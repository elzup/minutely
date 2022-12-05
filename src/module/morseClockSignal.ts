import { spawnSync } from 'child_process'
import { charAlphabets } from '@elzup/kit/lib/constants'
import * as morse from 'morse-converter'
import notifier from 'node-notifier'

const cargoBin = `$HOME/.cargo/bin`
const morse2sound = `${cargoBin}/morse2sound`
const morse2soundCmd = (sig: string) =>
  `${morse2sound} --dot-duration 50 --frequency 200 "${sig}"`

// 0 => 'za',
// 1 => 'b',
// 2 => 'c',
// 23=> 'xy'
const _HOUR_CHAR_LIST01 = ['za', ...`bcdefghijklmnopqrstuvw`.split(''), 'xy']

// prettier-ignore
const _HOUR_CHAR_LIST02 = [
  `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`,
  `ab 9`,
  `cd 10`,
  `ef 11`,
  `gh 12`,
  `ij 13`,
  `kl 14`,
  `mn 15`,
  `op 16`,
  `qr 17`,
  `st 18`,
  `uv 19`,
  `wx 20`,
  `yz 21`,
  `22`, `23`,
]

export const hourSignal = (d: number, h: number) => `${charAlphabets[h]}`

const hourSignalNow = (d: Date) => hourSignal(d.getDate(), d.getHours())

export const buildSigs = (d = new Date()) => {
  const sig = hourSignalNow(d)
  const morseSig = morse.encode(sig)
  const message = `${sig} <[ ${morseSig} ]>`

  return { sig, morseSig, message }
}

export function morseClockSignal() {
  const { morseSig, message } = buildSigs()

  notifier.notify({ title: 'morse sig', message })

  spawnSync(morse2soundCmd(morseSig), { shell: true })
}
