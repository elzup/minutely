import { spawn } from 'child_process'

const open = (path: string) => spawn('open', [path])

export async function openNews() {
  await open('https://github.com/trending/javascript?since=daily')
  await open('https://github.com/trending/typescript?since=daily')
  await open('https://twitter.com/javascriptdaily')
  await open('https://twitter.com/i/lists/1072318038316244992')
}
