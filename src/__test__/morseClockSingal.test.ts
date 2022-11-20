import { range } from '@elzup/kit'
import { hourSignal } from '../module/morseClockSignal'

test('hourSignal', () => {
  expect(hourSignal(1, 1)).toMatchInlineSnapshot(`"1 a"`)
  expect(hourSignal(2, 1)).toMatchInlineSnapshot(`"1 b"`)
  expect(range(24).map((h) => hourSignal(1, h))).toMatchInlineSnapshot(`
    Array [
      "0 a",
      "1 a",
      "2 a",
      "3 a",
      "4 a",
      "5 a",
      "6 a",
      "7 a",
      "8 a",
      "9 a",
      "a a",
      "b a",
      "10 a",
      "11 a",
      "12 a",
      "13 a",
      "14 a",
      "15 a",
      "16 a",
      "17 a",
      "18 a",
      "19 a",
      "1a a",
      "1b a",
    ]
  `)
})
