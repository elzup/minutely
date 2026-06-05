import { buildSigs, hourSignal, toBitByte, toHexByte } from '../module/morseClockSignal'

test('toHexByte', () => {
  expect(toHexByte(0)).toBe('00')
  expect(toHexByte(15)).toBe('0F')
  expect(toHexByte(255)).toBe('FF')
})

test('toBitByte', () => {
  expect(toBitByte(0)).toBe('00000000')
  expect(toBitByte(170)).toBe('10101010')
  expect(toBitByte(255)).toBe('11111111')
})

test('hourSignal', () => {
  expect(hourSignal(1, 0)).toBe('a')
  expect(hourSignal(1, 13)).toBe('n')
  expect(hourSignal(1, 23)).toBe('x')
})

test('buildSigs', () => {
  const { sig, morseSig, clock, bin, hex, message } = buildSigs(
    new Date(2021, 0, 1, 13, 0, 0),
    170,
    15
  )
  expect(sig).toBe('n')
  expect(morseSig).toBe('-.')
  expect(clock).toBe('13:00')
  expect(bin).toBe('10101010')
  expect(hex).toBe('0F')
  expect(message).toBe('13:00 n <[ -. ]>\n10101010 0F')
})
