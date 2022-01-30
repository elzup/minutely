import { execSync } from 'child_process'
import * as morse from 'morse-converter'

const cargoBin = `$HOME/.cargo/bin`
const morse2sound = `${cargoBin}/morse2sound`
const morse2soundCmd = (sig: string) =>
  `${morse2sound} --dot-duration 50 --frequency 200 "${sig}"`

const hourSignal = () => {
  const h = new Date().getHours()
  // 0 => 'za',
  // 1 => 'b',
  // 2 => 'c',
  // 23=> 'xy'
  const hourCharList = ['za', ...`bcdefghijklmnopqrstuvw`.split(''), 'xy']

  return `${hourCharList[h]}${h}`
}

export function morseClockSignal() {
  const morseSig = morse.encode(hourSignal())
  const cmd = morse2soundCmd(morseSig)

  execSync(cmd)
}
