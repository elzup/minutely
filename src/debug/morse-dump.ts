import { buildSigs } from '../module/morseClockSignal'

const range = (n: number) => [...Array(n).keys()]

range(24)
  .map((value) => buildSigs(value, value))
  .forEach(({ message }) => {
    console.log(message)
  })
