import { chromium, devices } from 'playwright'

async function scrape(q: string) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ ...devices['Desktop Chrome'] })
  const url = googleSearchUrl(q)

  await page.goto(url)
}
