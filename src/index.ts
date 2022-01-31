import { cronMatch } from './cronMatch'
import { mensaCheck } from './mensaCheck'
import { morseClockSignal } from './morseClockSignal'

const dayTime = `8-21`
const HOURLY = '* 0 * * * *'
const HOURLY3 = '* 0 */3 * * *'
const HOURLYDAY = `* 0 ${dayTime} * * *`
// NOTE: 秒は "*"、1分に一回呼ばれることは保証されていて何秒のタイミングで呼ばれるかは不明なので

async function main() {
  //
  // It be effective immediately after saving
  //
  const tasks = []
  const now = new Date()

  if (cronMatch(HOURLY3, now)) {
    tasks.push(mensaCheck)
  }

  // const weekly = '0 0 6 * * SAT *' // not work
  // if (cronMatch(weekly, now)) {
  //   slackNotice('weekley', 'minutely works', ':+1:')
  // }

  if (cronMatch(HOURLY, now)) {
    tasks.push(morseClockSignal)
  }
  if (tasks.length === 0) return
  tasks.forEach((task) => {
    task()
  })
}

main()
