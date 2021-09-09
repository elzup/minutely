import axios from 'axios'
import { exec, spawn } from 'child_process'

const SLACK_URL = process.env.SLACK_URL || ''

type Payload = {
  text: string
  channel: string
  username?: string
  icon_emoji?: string
}

function slackNotify(url: string, payloasdObj: Payload) {
  const payload = JSON.stringify(payloasdObj)

  const options = {
    method: 'POST',
    url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: { payload },
  } as const

  return axios.request(options)
}

function mensaCheck() {
  const htmlq = '/Users/hiro/.cargo/bin/htmlq'
  spawn(
    `curl $TARGET_URL | ${htmlq} --text "#exam p:nth-of-type(5)" | sed 's/^ *\| *$//'`,
    { stdio: 'inherit', shell: true }
  )
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
  mensaSlackNotify()
  ;('')
}

main()
