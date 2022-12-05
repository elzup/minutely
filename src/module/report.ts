import { Db } from '../db'

export async function report(db: Db) {
  const logs = (await db.get('report').value()) || []

  logs.push({ date: new Date().toISOString() })
  db.set('report', logs.slice(logs.length - 100)).write()
}
