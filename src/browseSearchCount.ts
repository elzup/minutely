import { googleSearchUrl } from '@elzup/kit/lib/url'
import axios from 'axios'
import { chromium, devices } from 'playwright'
import cheerio = require('cheerio')
import incstr from 'incstr'
import { appendSearchCounts, Db } from './db'

export async function memSearch(db: Db) {
  const inc = incstr(db.get('searchCount.inc').value())

  const res = await googleSearchCountPlaywright(inc)

  db.set('searchCount.inc', inc).write()
  appendSearchCounts(`${inc}\t${res}\n`)
}

export async function googleSearchCount(q: string) {
  const url = googleSearchUrl(q)
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
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ ...devices['Desktop Chrome'] })
  const url = googleSearchUrl(q)

  await page.goto(url)
  const res = page.locator('#result-stats')

  const text = await res.textContent()

  browser.close()
  if (!text) return -1
  return parseCountNum(text)
}
