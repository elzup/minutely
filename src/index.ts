import { cronMatch } from './cronMatch'
import { mensaCheck } from './mensaCheck'
import { morseClockSignal } from './morseClockSignal'

const dayTime = `8-21`
const hourly3 = '* 0 */3 * * *'
const dayHourly = `* 0 ${dayTime} * * *`

async function main() {
  //
  // It be effective immediately after saving
  //
  const now = new Date()
  // NOTE: 秒は "*"、1分に一回呼ばれることは保証されていて何秒のタイミングで呼ばれるかは不明なので

  if (cronMatch(hourly3, now)) {
    mensaCheck()
  }

  // const weekly = '0 0 6 * * SAT *' // not work
  // if (cronMatch(weekly, now)) {
  //   slackNotice('weekley', 'minutely works', ':+1:')
  // }

  if (cronMatch(dayHourly, now)) {
    morseClockSignal()
  }
}

main()
