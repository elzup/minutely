import { spawnSync } from 'child_process'
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

const assertByte = (value: number) => {
  if (!Number.isInteger(value) || value < 0 || value >= BYTE_MAX_EXCLUSIVE) {
    throw new Error(`byte must be an integer from 0 to 255: ${value}`)
  }
}

export const toHexByte = (value: number) => {
  assertByte(value)
  return value.toString(BYTE_RADIX).toUpperCase().padStart(2, '0')
}

export const toBitByte = (value: number) => {
  assertByte(value)
  return value.toString(2).padStart(BYTE_BIT_LENGTH, '0')
}

export const buildAlertText = (
  hexValue = randomByte(),
  bitValue = randomByte()
) => `${toHexByte(hexValue)} ${toBitByte(bitValue)}`

export const buildSigs = (hexValue?: number, bitValue?: number) => {
  const sig = buildAlertText(hexValue, bitValue)
  const morseSig = morse.encode(sig)
  const message = sig

  return { sig, morseSig, message }
}

export function morseClockSignal() {
  const { morseSig, message } = buildSigs()

  notifier.notify({ title: 'morse sig', message })

  if (enableMorseSig) {
    spawnSync(morse2soundCmd(morseSig), { shell: true })
  }
}
