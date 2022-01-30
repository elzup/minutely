import { execSync } from 'child_process'
import * as morse from 'morse-converter'

const morse2soundCmd = (sig: string) =>
  `(cd ~/.ghq/github.com/irevenko/morse2sound && cargo run "${sig}")`

export function morseClockSignal() {
  const sig = morse.encode(`${new Date().getHours()}`)
  const cmd = morse2soundCmd(sig)

  execSync(cmd)
}
