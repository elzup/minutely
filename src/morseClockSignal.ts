import { execSync } from 'child_process'
import * as morse from 'morse-converter'

const cargoBin = `$HOME/.cargo/bin`
const morse2sound = `${cargoBin}/morse2sound`
const morse2soundCmd = (sig: string) =>
  `${morse2sound} --dot-duration 50 --frequency 200 "${sig}"`

// 0 => 'za',
// 1 => 'b',
// 2 => 'c',
// 23=> 'xy'
const _HOUR_CHAR_LIST0 = ['za', ...`bcdefghijklmnopqrstuvw`.split(''), 'xy']

// prettier-ignore
const HOUR_CHAR_LIST = [
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
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

export const hourSignal = (d: number, h: number) =>
  `${ALPHABET[d % 26]} ${HOUR_CHAR_LIST[h]} ${h}`

const hourSignalNow = (d = new Date()) => hourSignal(d.getDate(), d.getHours())

export function morseClockSignal() {
  const morseSig = morse.encode(hourSignalNow())
  const cmd = morse2soundCmd(morseSig)

  execSync(cmd)
}
