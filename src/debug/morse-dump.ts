import { buildSigs } from '../module/morseClockSignal'

const range = (n: number) => [...Array(n).keys()]

range(24)
  .map((h) => buildSigs(new Date(2021, 0, 1, h, 0, 0)))
  .forEach(({ message }) => {
    console.log(message)
  })
