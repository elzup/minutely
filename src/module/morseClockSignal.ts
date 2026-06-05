import { spawnSync } from 'child_process'
import { charAlphabets } from '@elzup/kit/lib/constants'
import * as morse from 'morse-converter'
import notifier from 'node-notifier'

const cargoBin = `$HOME/.cargo/bin`
const morse2sound = `${cargoBin}/morse2sound`
const morse2soundCmd = (sig: string) =>
  `${morse2sound} --dot-duration 50 --frequency 200 "${sig}"`

const enableMorseSig = false

const BYTE_RADIX = 16
const BYTE_BIT_LENGTH = 8
const BYTE_MAX_EXCLUSIVE = 0x100

const randomByte = () => Math.floor(Math.random() * BYTE_MAX_EXCLUSIVE)

export const toHexByte = (value: number) =>
  value.toString(BYTE_RADIX).toUpperCase().padStart(2, '0')

export const toBitByte = (value: number) =>
  value.toString(2).padStart(BYTE_BIT_LENGTH, '0')

export const hourSignal = (d: number, h: number) => `${charAlphabets[h]}`

const hourSignalNow = (d: Date) => hourSignal(d.getDate(), d.getHours())

const toClock = (d: Date) =>
  `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`

export const buildSigs = (
  d = new Date(),
  binValue = randomByte(),
  hexValue = randomByte()
) => {
  const sig = hourSignalNow(d)
  const morseSig = morse.encode(sig)
  const clock = toClock(d)
  const bin = toBitByte(binValue)
  const hex = toHexByte(hexValue)
  const message = `${clock} ${sig} <[ ${morseSig} ]>\n${bin} ${hex}`

  return { sig, morseSig, clock, bin, hex, message }
}

export function morseClockSignal() {
  const { morseSig, message } = buildSigs()

  // sender に通知許可済みの既存アプリの bundle id を指定すると、
  // 通知センターに保持されやすくなる (terminal-notifier 単体だと消えることがある)
  notifier.notify({ title: 'morse sig', message, sender: 'com.apple.Terminal' })

  if (enableMorseSig) {
    spawnSync(morse2soundCmd(morseSig), { shell: true })
  }
}
