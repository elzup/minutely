import { execSync } from 'child_process'

const morse2soundCmd = (sig: string) =>
  `(cd ~/.ghq/github.com/irevenko/morse2sound && cargo run "${sig}")`

export function morseClockSignal() {
  const sig = '...--'
  const cmd = morse2soundCmd(sig)

  execSync(cmd)
}
