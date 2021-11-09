import { mensaCheck } from './mensaCheck'
import { slackNotice } from './slackCli'

async function main() {
  const now = new Date()
  const h = now.getHours()
  const min = now.getMinutes()
  const hourly = min === 0
  const hourly3 = hourly && h % 3 == 0

  const weekly = now.getDay() === 6 && hourly && h === 6

  if (hourly3) {
    mensaCheck()
  }

  if (weekly) {
    slackNotice('weekley', 'minutely works', ':+1:')
  }
}

main()
