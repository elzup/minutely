// FIXME can't resolve package but type enable
// eslint-disable-next-line import/no-unresolved
import { appendFileSync } from 'fs'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

export type Db = low.LowdbSync<Data>

type Data = {
  searchCount: {
    inc: string
    data: Record<string, number>
  }
}

const init: Data = { searchCount: { inc: 'aaa', data: {} } }

export function loadDb() {
  const adapter = new FileSync<Data>('data/db.json')
  const db = low(adapter)

  db.defaults(init).write()

  // v2
  // db.data ||= init
  // // unit migration
  // db.data.searchCount ||= init.searchCount
  return db
}

export function appendSearchCounts(line: string) {
  appendFileSync('data/searchCounts.tsv', `${line}`)
}
