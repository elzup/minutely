import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { userInfo } from 'node:os'
import { parseArgs } from 'node:util'
import {
  checkHealth,
  findOwnLabels,
  formatRow,
  problemsOf,
  readLaunchctl,
} from './health.ts'
import { loadManifest } from './manifest.ts'
import { notifyIfChanged } from './notify.ts'
import { LOG_DIR, plistPathOf, renderPlist } from './plist.ts'
import type { Job, ManagedJob } from './types.ts'

const USAGE = `usage: node launchd/cli.ts <command>
  ls                 台帳と現在の状態を一覧する
  health [--notify]  問題のあるジョブだけ出す (--notify: 変化時に Slack)
  render <label>     managed ジョブの plist を標準出力へ
  install <label>    plist を ~/Library/LaunchAgents に置いて launchd に登録し直す
  uninstall <label>  launchd から外して plist を消す (止めたままにするなら台帳で isDisabled: true)`

const findManaged = (jobs: Job[], label: string | undefined): ManagedJob => {
  const job = jobs.find((candidate) => candidate.label === label)

  if (job === undefined) throw new Error(`unknown label: ${label}`)
  if (!job.managed)
    throw new Error(`${label} is external (plist の正本は ${job.owner})`)
  return job
}

const currentRows = (jobs: Job[]) =>
  checkHealth(jobs, readLaunchctl(), findOwnLabels())

const ownerOf = (job: Job | undefined) => {
  if (job === undefined) return '?'
  return job.managed ? 'minutely' : job.owner
}

const ls = (jobs: Job[]) => {
  const jobByLabel = new Map(jobs.map((job) => [job.label, job]))

  for (const row of currentRows(jobs)) {
    const job = jobByLabel.get(row.label)

    console.info(
      `${formatRow(row).padEnd(52)} ${ownerOf(job).padEnd(16)} ${job?.purpose ?? ''}`
    )
  }
}

const health = async (jobs: Job[], shouldNotify: boolean) => {
  const problems = problemsOf(currentRows(jobs))

  console.info(
    problems.length === 0 ? 'all ok' : problems.map(formatRow).join('\n')
  )
  if (!shouldNotify) return
  const hasNotified = await notifyIfChanged(problems)

  console.info(hasNotified ? 'notified' : 'unchanged, not notified')
}

const domain = () => `gui/${userInfo().uid}`

const bootout = (label: string) => {
  try {
    execFileSync('/bin/launchctl', ['bootout', `${domain()}/${label}`], {
      stdio: 'ignore',
    })
  } catch {
    // 未登録なら bootout は失敗する。初回 install / 二重 uninstall では正常な経路で、
    // install では直後の bootstrap が成否を決める
  }
}

const install = (job: ManagedJob) => {
  if (job.isDisabled === true)
    throw new Error(`${job.label} is disabled (台帳の isDisabled を外す)`)
  const path = plistPathOf(job.label)

  mkdirSync(LOG_DIR, { recursive: true })
  writeFileSync(path, renderPlist(job))
  bootout(job.label)
  execFileSync('/bin/launchctl', ['bootstrap', domain(), path], {
    stdio: 'inherit',
  })
  console.info(`installed ${path}`)
}

const uninstall = (job: ManagedJob) => {
  const path = plistPathOf(job.label)

  bootout(job.label)
  rmSync(path, { force: true })
  console.info(`uninstalled ${path}`)
}

const main = async () => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { notify: { type: 'boolean', default: false } },
  })
  const [command, label] = positionals
  const { jobs } = loadManifest()

  if (command === 'ls') return ls(jobs)
  if (command === 'health') return health(jobs, values.notify)
  if (command === 'render')
    return process.stdout.write(renderPlist(findManaged(jobs, label)))
  if (command === 'install') return install(findManaged(jobs, label))
  if (command === 'uninstall') return uninstall(findManaged(jobs, label))
  console.error(USAGE)
  process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
