import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { AGENTS_DIR } from './plist.ts'
import type { HealthRow, Job, LaunchctlEntry } from './types.ts'

const OWN_LABEL_PREFIX = 'com.elzup.'
const LABEL_PATTERN = /<key>Label<\/key>\s*<string>([^<]+)<\/string>/

export const parseLaunchctlList = (output: string): LaunchctlEntry[] =>
  output
    .split('\n')
    .slice(1)
    .map((line) => line.split('\t'))
    .filter((cols) => cols.length === 3)
    .map(([pid, lastExit, label]) => ({
      label,
      pid: pid === '-' ? null : Number(pid),
      lastExit: Number(lastExit),
    }))

export const readLaunchctl = (): LaunchctlEntry[] =>
  parseLaunchctlList(
    execFileSync('/bin/launchctl', ['list'], { encoding: 'utf8' })
  )

// ~/Library 配下を指すのはアプリの updater / helper (Dropbox, Google, watchman 等) なので除く
const referencesOwnScript = (xml: string) =>
  xml
    .split(`${homedir()}/`)
    .slice(1)
    .some((rest) => !rest.startsWith('Library/'))

/**
 * 自作とみなす plist のラベル一覧。
 * home 配下のスクリプトを指す plist はアプリが置いたものではなく手で置いたもの、という前提。
 * バイナリ plist は文字列一致しないので拾わない (自作 plist は全て XML)。
 */
export const findOwnLabels = (dir = AGENTS_DIR): string[] =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.plist'))
    .map((name) => readFileSync(join(dir, name), 'utf8'))
    .map((xml) => ({ xml, label: LABEL_PATTERN.exec(xml)?.[1] }))
    .filter(
      ({ xml, label }) =>
        label !== undefined &&
        (label.startsWith(OWN_LABEL_PREFIX) || referencesOwnScript(xml))
    )
    .map(({ label }) => label as string)

const rowOf = (job: Job, entry: LaunchctlEntry | undefined): HealthRow => {
  const base = { label: job.label, lastExit: entry?.lastExit ?? null }

  if (!job.managed && job.scheduler === 'cron')
    return { ...base, status: 'unchecked' }
  if (!job.managed && job.isDead === true) return { ...base, status: 'dead' }
  if (entry === undefined) return { ...base, status: 'not-loaded' }
  if (entry.lastExit === 0) return { ...base, status: 'ok' }
  // KeepAlive のジョブは落ちても再起動されるので、pid があれば「今は動いている」
  if (entry.pid !== null) return { ...base, status: 'restarting' }
  return { ...base, status: 'failing' }
}

export const checkHealth = (
  jobs: Job[],
  entries: LaunchctlEntry[],
  ownLabels: string[]
): HealthRow[] => {
  const entryByLabel = new Map(entries.map((entry) => [entry.label, entry]))
  const known = new Set(jobs.map((job) => job.label))
  const unregistered = ownLabels
    .filter((label) => !known.has(label))
    .map((label) => ({
      label,
      status: 'unregistered' as const,
      lastExit: entryByLabel.get(label)?.lastExit ?? null,
    }))

  return [
    ...jobs.map((job) => rowOf(job, entryByLabel.get(job.label))),
    ...unregistered,
  ]
}

const HEALTHY = new Set<HealthRow['status']>(['ok', 'unchecked'])

export const problemsOf = (rows: HealthRow[]) =>
  rows.filter((row) => !HEALTHY.has(row.status))

export const formatRow = (row: HealthRow) =>
  `${row.status.padEnd(12)} ${String(row.lastExit ?? '-').padStart(4)}  ${row.label}`
