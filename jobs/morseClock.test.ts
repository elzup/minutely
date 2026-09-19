import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildSigs, hourSignal, toBitByte, toHexByte } from './morseClock.ts'

test('toHexByte', () => {
  assert.equal(toHexByte(0), '00')
  assert.equal(toHexByte(15), '0F')
  assert.equal(toHexByte(255), 'FF')
})

test('toBitByte', () => {
  assert.equal(toBitByte(0), '00000000')
  assert.equal(toBitByte(170), '10101010')
  assert.equal(toBitByte(255), '11111111')
})

test('hourSignal', () => {
  assert.equal(hourSignal(0), 'a')
  assert.equal(hourSignal(13), 'n')
  assert.equal(hourSignal(23), 'x')
})

test('buildSigs', () => {
  const sigs = buildSigs(new Date(2021, 0, 1, 13, 0, 0), 170, 15)

  assert.deepEqual(sigs, {
    sig: 'n',
    morseSig: '-.',
    clock: '13:00',
    bin: '10101010',
    hex: '0F',
    message: '13:00 n <[ -. ]>\n10101010 0F',
  })
})
