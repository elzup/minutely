import { range } from '@elzup/kit'
import { googleSearchUrl } from '@elzup/kit/lib/url'
import axios from 'axios'
import incstr from 'incstr'
import { chromium, devices } from 'playwright'
import cheerio = require('cheerio')
import notifier from 'node-notifier'
import { appendSearchCounts, Db } from '../db'

const oneTime = 1
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const END_ID = '999'

export async function memSearch(db: Db) {
  const lastId = db.get('searchCount.inc').value()
  const next = incstr.idGenerator({ lastId, alphabet })

  if (lastId === END_ID) {
    notifier.notify({ title: 'memSearch finished', message: `finished` })
    return
  }

  const ids = range(oneTime).map(() => next())

  const res = await googleSearchCountPlaywrightMulti(ids)

  const lastInc = ids.pop() || '---'

  db.set('searchCount.inc', lastInc).write()
  const text = Object.entries(res)
    .map(([id, count]) => `${id}\t${count}\n`)
    .join('')

  appendSearchCounts(text)
}
const prequery = (q: string) => q + ' -あいうえおかきくけこ' // avoid content result bar

export async function googleSearchCount(q: string) {
  const url = googleSearchUrl(prequery(q))
  const res = await axios.get(url)

  const $ = cheerio.load(res.data)

  return $('body').text()
}

const parseCountNum = (str: string) => {
  const m = str.match(/([\d,]+) 件/)

  if (!m) return -1
  return Number(m[1].replaceAll(',', '')) || -1
}

export async function googleSearchCountPlaywright(q: string) {
  return await googleSearchCountPlaywrightMulti([q])
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec))

export async function googleSearchCountPlaywrightMulti(qs: string[]) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ ...devices['Desktop Chrome'] })

  const map: Record<string, number> = {}

  for (const q of qs) {
    const sl = sleep(100)

    await page.goto(googleSearchUrl(prequery(q)))
    const res = page.locator('#result-stats')
    const text = await res.textContent()

    map[q] = text ? parseCountNum(text) : -1
    await sl
  }
  browser.close()

  return map
}
