import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkHealth, parseLaunchctlList, problemsOf } from './health.ts'
import { renderPlist } from './plist.ts'
import type { Job, ManagedJob } from './types.ts'

const LIST_OUTPUT = [
  'PID\tStatus\tLabel',
  '6906\t1\tcom.elzup.quota.web',
  '-\t0\tcom.elzup.forge',
  '-\t1\tsync.dotfiles',
  '',
].join('\n')

const external = (label: string, extra: Partial<Job> = {}): Job =>
  ({
    label,
    purpose: '',
    managed: false,
    scheduler: 'launchd',
    owner: 'x',
    ...extra,
  }) as Job

test('parseLaunchctlList reads pid / exit / label', () => {
  assert.deepEqual(parseLaunchctlList(LIST_OUTPUT), [
    { label: 'com.elzup.quota.web', pid: 6906, lastExit: 1 },
    { label: 'com.elzup.forge', pid: null, lastExit: 0 },
    { label: 'sync.dotfiles', pid: null, lastExit: 1 },
  ])
})

test('checkHealth classifies each job', () => {
  const jobs = [
    external('com.elzup.forge'),
    external('com.elzup.quota.web'),
    external('sync.dotfiles'),
    external('gone'),
    external('old', { isDead: true }),
    external('cron:x', { scheduler: 'cron' }),
  ]
  const rows = checkHealth(jobs, parseLaunchctlList(LIST_OUTPUT), [
    'com.elzup.new',
  ])

  assert.deepEqual(
    rows.map((row) => row.status),
    [
      'ok',
      'restarting',
      'failing',
      'not-loaded',
      'dead',
      'unchecked',
      'unregistered',
    ]
  )
  assert.equal(problemsOf(rows).length, 5)
})

test('renderPlist wraps program with env file and escapes xml', () => {
  const job: ManagedJob = {
    label: 'com.elzup.test',
    purpose: '',
    managed: true,
    program: ['/bin/echo', 'a&b'],
    envFile: '/tmp/env',
    schedule: { kind: 'calendar', hour: 10, minute: 30 },
  }
  const xml = renderPlist(job)

  assert.match(xml, /<string>\/bin\/sh<\/string>\n\s+<string>-c<\/string>/)
  assert.match(
    xml,
    /<string>\/tmp\/env<\/string>\n\s+<string>\/bin\/echo<\/string>/
  )
  assert.match(xml, /a&amp;b/)
  assert.match(xml, /<key>Hour<\/key>\n\s+<integer>10<\/integer>/)
})
