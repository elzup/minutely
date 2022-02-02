import { googleSearchUrl } from '@elzup/kit/lib/url'
import axios from 'axios'
import { chromium, devices } from 'playwright'
import cheerio = require('cheerio')

export async function googleSearchCount(q: string) {
  const url = googleSearchUrl(q)
  const res = await axios.get(url)

  const $ = cheerio.load(res.data)

  return $('#result-stats').text()
}

export async function googleSearchCountPlaywright(q: string) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ ...devices['Desktop Chrome'] })
  const url = googleSearchUrl(q)

  await page.goto(url)
  const res = page.locator('#result-stats')

  const text = await res.textContent()

  console.log(text)
  browser.close()
}
