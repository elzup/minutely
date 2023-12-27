import { Db } from '../db'

export async function report(db: Db) {
  const logs = (await db.get('report').value()) || []

  logs.push({ date: new Date().toLocaleString() })
  db.set('report', logs.slice(logs.length - 1000)).write()
}
