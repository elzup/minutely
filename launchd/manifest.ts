import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Job, Manifest } from './types.ts'

const LAUNCHD_DIR = dirname(fileURLToPath(import.meta.url))

export const REPO_DIR = dirname(LAUNCHD_DIR)
export const MANIFEST_PATH = join(LAUNCHD_DIR, 'jobs.json')

export const expandHome = (path: string) =>
  path.startsWith('~/') ? join(homedir(), path.slice(2)) : path

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const validateJob = (raw: unknown, index: number): Job => {
  if (!isRecord(raw)) throw new Error(`jobs[${index}] is not an object`)
  const { label, purpose, managed } = raw

  if (typeof label !== 'string' || label === '')
    throw new Error(`jobs[${index}].label is required`)
  if (typeof purpose !== 'string')
    throw new Error(`${label}: purpose is required`)
  if (typeof managed !== 'boolean')
    throw new Error(`${label}: managed must be boolean`)
  if (managed && !Array.isArray(raw.program))
    throw new Error(`${label}: managed job needs program[]`)
  if (managed && !isRecord(raw.schedule))
    throw new Error(`${label}: managed job needs schedule`)
  if (raw.isDisabled !== undefined && typeof raw.isDisabled !== 'boolean')
    throw new Error(`${label}: isDisabled must be boolean`)
  if (!managed && raw.scheduler !== 'launchd' && raw.scheduler !== 'cron')
    throw new Error(`${label}: scheduler must be launchd or cron`)

  return raw as Job
}

const assertUniqueLabels = (jobs: Job[]) => {
  const seen = new Set<string>()

  for (const job of jobs) {
    if (seen.has(job.label)) throw new Error(`duplicate label: ${job.label}`)
    seen.add(job.label)
  }
}

export const loadManifest = (path = MANIFEST_PATH): Manifest => {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'))

  if (!isRecord(raw) || !Array.isArray(raw.jobs))
    throw new Error(`${path}: "jobs" array is required`)
  const jobs = raw.jobs.map(validateJob)

  assertUniqueLabels(jobs)
  return { jobs }
}
