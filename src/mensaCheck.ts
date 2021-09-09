import { spawnSync } from 'child_process'
import { slackNotify } from './slack'
const SLACK_URL = process.env.SLACK_URL || ''

const htmlq = '$HOME/.cargo/bin/htmlq'
const curl = '/usr/bin/curl'
const nonReadyText = '（現在未定です）'
const mensaUrl = 'https://mensa.jp/exam/'

function mensaCheckReady(): false | string {
  const command = `${curl} ${mensaUrl} | ${htmlq} --text "#exam p:nth-of-type(5)"`
  const result = spawnSync(command, { shell: true })
  const text = result.stdout.toString().trim()
  // console.log(text)

  const noReady = text === nonReadyText
  if (noReady) return false
  return text
}

const mensaSlackNotify = (text: string) =>
  slackNotify(SLACK_URL, {
    text,
    channel: '#notice',
    username: 'MENSA checker',
    icon_emoji: ':brain:',
  })

export function mensaCheck() {
  if (!SLACK_URL) return
  const result = mensaCheckReady()
  if (!result) return
  mensaSlackNotify(result)
}
