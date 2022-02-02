import { memSearch } from './browseSearchCount'
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
const MINUTELY = '* * * * * *'
const _HOURLYDAY = `* 0 ${dayTime} * * *`
// NOTE: 秒は "*"、1分に一回呼ばれることは保証されていて何秒のタイミングで呼ばれるかは不明なので

type Task = {
  name: string
  cronExp: string
  func: () => void
}
type DbTask = Omit<Task, 'func'> & {
  func: (db: Db) => Promise<void>
}

const tasks: Task[] = [
  { name: 'mensaCheck', cronExp: HOURLY3, func: mensaCheck },
  { name: 'clockSignal', cronExp: HOURLY, func: morseClockSignal },
  // {
  //   cronExp: WEEKLY,
  //   name: 'minutely works',
  //   func: () => slackNotice('weekley', 'minutely works', ':+1:'),
  // },
]
const dbTasks: DbTask[] = [
  { name: 'memSearch', cronExp: MINUTELY, func: memSearch },
]

async function main() {
  const now = new Date()

  tasks
    .filter((task) => cronMatch(task.cronExp, now))
    .forEach((task) => {
      task.func()
    })
  const runDbTasks = dbTasks.filter((task) => cronMatch(task.cronExp, now))

  if (runDbTasks.length === 0) return

  const db = await loadDb()

  for (const task of runDbTasks) {
    await task.func(db)
  }
  await db.write()
}

main()
