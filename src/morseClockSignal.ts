import { execSync } from 'child_process'
import * as morse from 'morse-converter'

const cargo = `$HOME/.cargo/bin/cargo`
const morse2sound = `$HOME/.ghq/github.com/irevenko/morse2sound`
const morse2soundCmd = (sig: string) =>
  `(cd ${morse2sound}
    && ${cargo} run --offline --dot-duration 50 --frequency 200 "${sig}")`

export function morseClockSignal() {
  const sig = morse.encode(`${new Date().getHours()}`)
  const cmd = morse2soundCmd(sig)

  execSync(cmd)
}
