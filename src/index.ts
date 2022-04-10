import { cronMatch } from './cronMatch'
import { Db, loadDb } from './db'
import { mensaCheck } from './mensaCheck'
import { morseClockSignal } from './morseClockSignal'

//
// It be effective immediately after saving
//

const dayTime = `8-21`
const HOURLY = '* 0 * * * *'
const HOURLY3 = '* 0 */3 * * *'
const _MINUTELY = '* * * * * *'
const _HOURLYDAY = `* 0 ${dayTime} * * *`
// NOTE: 秒は "*"、1分に一回呼ばれることは保証されていて何秒のタイミングで呼ばれるかは不明なので

type PureTask = {
  name: string
  cronExp: string
  func: () => void
}
type DbTask = Omit<PureTask, 'func'> & {
  func: (db: Db) => Promise<void>
  db: true
}
type Task = PureTask | DbTask

const tasks: Task[] = [
  { name: 'mensaCheck', cronExp: HOURLY3, func: mensaCheck },
  { name: 'clockSignal', cronExp: HOURLY, func: morseClockSignal },
  // {
  //   cronExp: WEEKLY,
  //   name: 'minutely works',
  //   func: () => slackNotice('weekley', 'minutely works', ':+1:'),
  // },
  // NOTE: memSearch completed
  // { name: 'memSearch', cronExp: MINUTELY, func: memSearch, db: true },
]

const isDbTask = (task: Task): task is DbTask => task.hasOwnProperty('db')
const isPureTask = (task: Task): task is PureTask => !isDbTask(task)

async function main() {
  const now = new Date()

  const runTasks = tasks.filter((task) => cronMatch(task.cronExp, now))
  const runPureTasks = runTasks.filter(isPureTask)
  const runDbTasks = runTasks.filter(isDbTask)

  runPureTasks.forEach((task) => task.func())

  if (runDbTasks.length === 0) return

  const db = await loadDb()

  for (const task of runDbTasks) {
    await task.func(db)
  }
  await db.write()
}

main()
