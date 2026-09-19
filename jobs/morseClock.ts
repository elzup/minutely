import { fileURLToPath } from 'node:url'
import morse from 'morse-converter'
import notifier from 'node-notifier'

const HOUR_LETTERS = 'abcdefghijklmnopqrstuvwxyz'
const BYTE_RADIX = 16
const BYTE_BIT_LENGTH = 8
const BYTE_MAX_EXCLUSIVE = 0x100

const randomByte = () => Math.floor(Math.random() * BYTE_MAX_EXCLUSIVE)

export const toHexByte = (value: number) =>
  value.toString(BYTE_RADIX).toUpperCase().padStart(2, '0')

export const toBitByte = (value: number) =>
  value.toString(2).padStart(BYTE_BIT_LENGTH, '0')

export const hourSignal = (hour: number) => HOUR_LETTERS[hour]

const toClock = (d: Date) =>
  `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`

export const buildSigs = (
  d = new Date(),
  binValue = randomByte(),
  hexValue = randomByte()
) => {
  const sig = hourSignal(d.getHours())
  const morseSig = morse.encode(sig)
  const clock = toClock(d)
  const bin = toBitByte(binValue)
  const hex = toHexByte(hexValue)
  const message = `${clock} ${sig} <[ ${morseSig} ]>\n${bin} ${hex}`

  return { sig, morseSig, clock, bin, hex, message }
}

// sender は @types/node-notifier に無いが、terminal-notifier の -sender にそのまま渡る。
// 通知許可済みの既存アプリの bundle id を指定すると通知センターに保持されやすくなる
// (terminal-notifier 単体だと消えることがある)。
type MacNotification = notifier.Notification & { sender: string }

export const notifyMorseClock = () => {
  const notification: MacNotification = {
    title: 'morse sig',
    message: buildSigs().message,
    sender: 'com.apple.Terminal',
  }

  notifier.notify(notification)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) notifyMorseClock()
