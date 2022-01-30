import { spawnSync } from 'child_process'
import { slackNotice } from './slackCli'

const cargoBin = `$HOME/.cargo/bin`
const htmlq = `${cargoBin}/htmlq`
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
  slackNotice('MENSA checker', text, ':brain:')

export function mensaCheck() {
  const result = mensaCheckReady()
  if (!result) return
  mensaSlackNotify(result)
}
