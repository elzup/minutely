import { cronMatch } from './cronMatch'
import { mensaCheck } from './mensaCheck'
import { morseClockSignal } from './morseClockSignal'
import { slackNotice } from './slackCli'

async function main() {
  const now = new Date()
  // NOTE: 秒は "*"、1分に一回呼ばれることは保証されていて何秒のタイミングで呼ばれるかは不明なので
  const hourly3 = '* 0 */3 * * *'

  if (cronMatch(hourly3, now)) {
    mensaCheck()
  }

  // const weekly = '0 0 6 * * SAT *' // not work
  // if (cronMatch(weekly, now)) {
  //   slackNotice('weekley', 'minutely works', ':+1:')
  // }

  const hourly = '* 0 * * * *'
  if (cronMatch(hourly, now)) {
    morseClockSignal()
  }
}

main()
