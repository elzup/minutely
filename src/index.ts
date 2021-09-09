import { mensaCheck } from './mensaCheck'

async function main() {
  const now = new Date()
  const h = now.getHours()
  const min = now.getMinutes()
  const hourly = min === 0
  const hourly3 = hourly && h % 3 == 0

  if (hourly3) {
    mensaCheck()
  }
}

main()
