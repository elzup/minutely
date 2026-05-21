import {
  buildAlertText,
  buildSigs,
  toBitByte,
  toHexByte,
} from '../module/morseClockSignal'

test('toHexByte', () => {
  expect(toHexByte(0)).toBe('00')
  expect(toHexByte(15)).toBe('0F')
  expect(toHexByte(255)).toBe('FF')
})

test('toBitByte', () => {
  expect(toBitByte(0)).toBe('00000000')
  expect(toBitByte(1)).toBe('00000001')
  expect(toBitByte(255)).toBe('11111111')
})

test('buildAlertText', () => {
  expect(buildAlertText(15, 170)).toBe('0F 10101010')
})

test('buildSigs', () => {
  expect(buildSigs(15, 170).message).toBe('0F 10101010')
})
