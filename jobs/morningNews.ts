import { execFileSync } from 'node:child_process'

const NEWS_URLS = [
  'https://github.com/trending/javascript?since=daily',
  'https://github.com/trending/typescript?since=daily',
  'https://twitter.com/javascriptdaily',
  'https://twitter.com/i/lists/1072318038316244992',
]

for (const url of NEWS_URLS) execFileSync('/usr/bin/open', [url])
