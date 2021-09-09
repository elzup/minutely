import axios from 'axios'
import { spawnSync } from 'child_process'

const SLACK_URL = process.env.SLACK_URL || ''

type Payload = {
  text: string
  channel: string
  username?: string
  icon_emoji?: string
}

function slackNotify(url: string, payloasdObj: Payload) {
  return axios.request({
    method: 'POST',
    url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: { payload: JSON.stringify(payloasdObj) },
  })
}

const htmlq = '$HOME/.cargo/bin/htmlq'
const curl = '/usr/bin/curl'
const nonReadyText = '（現在未定です）'
const mensaUrl = 'https://mensa.jp/exam/'

function mensaCheck(): false | string {
  const command = `${curl} ${mensaUrl} | ${htmlq} --text "#exam p:nth-of-type(5)"`
  const result = spawnSync(command, { shell: true })
  const text = result.stdout.toString().trim()
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

async function main() {
  if (!SLACK_URL) return
  const result = mensaCheck()
  if (!result) return
  mensaSlackNotify(result)
}

main()
