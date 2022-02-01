import { range } from '@elzup/kit'
import { hourSignal } from '../morseClockSignal'

test('hourSignal', () => {
  expect(hourSignal(1, 1)).toMatchInlineSnapshot(`"a 1"`)
  expect(hourSignal(2, 1)).toMatchInlineSnapshot(`"b 1"`)
  expect(range(24).map((h) => hourSignal(1, h))).toMatchInlineSnapshot(`
    Array [
      "a 0",
      "a 1",
      "a 2",
      "a 3",
      "a 4",
      "a 5",
      "a 6",
      "a 7",
      "a 8",
      "a ab 9",
      "a cd 10",
      "a ef 11",
      "a gh 12",
      "a ij 13",
      "a kl 14",
      "a mn 15",
      "a op 16",
      "a qr 17",
      "a st 18",
      "a uv 19",
      "a wx 20",
      "a yz 21",
      "a 22",
      "a 23",
    ]
  `)
})
