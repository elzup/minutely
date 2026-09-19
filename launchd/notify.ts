import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { formatRow } from './health.ts'
import { REPO_DIR } from './manifest.ts'
import type { HealthRow } from './types.ts'

// data/ は .gitignore 済み。前回の問題集合を持ち、変化したときだけ通知する
// (毎日同じ失敗を流し続けると通知ごと無視されるようになるため)。
const STATE_PATH = join(REPO_DIR, 'data/launchd-health.json')

const signatureOf = (problems: HealthRow[]) =>
  problems
    .map((row) => `${row.label}:${row.status}`)
    .toSorted()
    .join(',')

const readLastSignature = (): string | null => {
  if (!existsSync(STATE_PATH)) return null
  const state: unknown = JSON.parse(readFileSync(STATE_PATH, 'utf8'))

  if (typeof state !== 'object' || state === null) return null
  const { signature } = state as { signature?: unknown }

  return typeof signature === 'string' ? signature : null
}

const writeSignature = (signature: string) => {
  mkdirSync(dirname(STATE_PATH), { recursive: true })
  writeFileSync(STATE_PATH, `${JSON.stringify({ signature }, null, 2)}\n`)
}

const postSlack = async (text: string) => {
  const url = process.env.SLACK_URL

  if (url === undefined || url === '')
    throw new Error('SLACK_URL is not defined')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      channel: '#notice',
      username: 'launchd health',
      icon_emoji: ':stethoscope:',
    }),
  })

  if (!response.ok) throw new Error(`slack notify failed: ${response.status}`)
}

const messageOf = (problems: HealthRow[]) =>
  problems.length === 0
    ? 'launchd jobs: all recovered :white_check_mark:'
    : `launchd jobs with problems (${problems.length})\n\`\`\`\n${problems.map(formatRow).join('\n')}\n\`\`\``

/** 問題集合が前回から変わったときだけ Slack に流す。通知したかどうかを返す */
export const notifyIfChanged = async (
  problems: HealthRow[]
): Promise<boolean> => {
  const signature = signatureOf(problems)

  if (signature === readLastSignature()) return false
  await postSlack(messageOf(problems))
  // 送信に成功してから保存する。失敗時に保存すると次回「変化なし」と判定されて通知が永久に落ちる
  writeSignature(signature)
  return true
}
