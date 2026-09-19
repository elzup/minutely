import { homedir } from 'node:os'
import { join } from 'node:path'
import { expandHome } from './manifest.ts'
import type { ManagedJob, Schedule } from './types.ts'

export const LOG_DIR = join(homedir(), 'Library/Logs/elzup')
export const AGENTS_DIR = join(homedir(), 'Library/LaunchAgents')

export const logPathOf = (label: string) => join(LOG_DIR, `${label}.log`)
export const plistPathOf = (label: string) => join(AGENTS_DIR, `${label}.plist`)

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const str = (value: string) => `<string>${escapeXml(value)}</string>`
const int = (value: number) => `<integer>${value}</integer>`
const key = (name: string) => `<key>${name}</key>`

// env ファイルを $0 として渡し、source してから本体を exec する。
// launchd は direnv を通らないので、.envrc の export をここで読み込む。
const ENV_WRAPPER = '. "$0" && exec "$@"'

const programArgs = (job: ManagedJob): string[] => {
  const program = job.program.map(expandHome)

  if (job.envFile === undefined) return program
  return ['/bin/sh', '-c', ENV_WRAPPER, expandHome(job.envFile), ...program]
}

const scheduleXml = (schedule: Schedule): string[] => {
  if (schedule.kind === 'interval')
    return [key('StartInterval'), int(schedule.seconds)]

  const hour =
    schedule.hour === undefined ? [] : [key('Hour'), int(schedule.hour)]

  return [
    key('StartCalendarInterval'),
    '<dict>',
    ...hour,
    key('Minute'),
    int(schedule.minute),
    '</dict>',
  ]
}

export const renderPlist = (job: ManagedJob): string => {
  const log = logPathOf(job.label)
  const workdir =
    job.workdir === undefined
      ? []
      : [key('WorkingDirectory'), str(expandHome(job.workdir))]
  const body = [
    key('Label'),
    str(job.label),
    key('ProgramArguments'),
    '<array>',
    ...programArgs(job).map(str),
    '</array>',
    ...workdir,
    ...scheduleXml(job.schedule),
    key('StandardOutPath'),
    str(log),
    key('StandardErrorPath'),
    str(log),
    // 定期ジョブが前面作業の I/O と CPU を奪わないようにする (forge の plist と同じ方針)
    key('ProcessType'),
    str('Background'),
  ]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    ...body.map((line) => `  ${line}`),
    '</dict>',
    '</plist>',
    '',
  ].join('\n')
}
