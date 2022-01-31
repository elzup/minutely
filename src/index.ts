import { cronMatch } from './cronMatch'
import { mensaCheck } from './mensaCheck'
import { morseClockSignal } from './morseClockSignal'

//
// It be effective immediately after saving
//

const dayTime = `8-21`
const HOURLY = '* 0 * * * *'
const HOURLY3 = '* 0 */3 * * *'
const HOURLYDAY = `* 0 ${dayTime} * * *`
// NOTE: 秒は "*"、1分に一回呼ばれることは保証されていて何秒のタイミングで呼ばれるかは不明なので

type Task = {
  name: string
  cronExp: string
  func: () => void
}
const tasks: Task[] = [
  { name: 'mensaCheck', cronExp: HOURLY3, func: mensaCheck },
  { name: 'morseClockSignal', cronExp: HOURLY, func: morseClockSignal },
  // {
  //   cronExp: WEEKLY,
  //   name: 'minutely works',
  //   func: () => slackNotice('weekley', 'minutely works', ':+1:'),
  // },
]

async function main() {
  const now = new Date()
  const runTasks = tasks.filter((task) => cronMatch(task.cronExp, now))

  if (runTasks.length === 0) return

  runTasks.forEach((task) => {
    task.func()
  })
}

main()
