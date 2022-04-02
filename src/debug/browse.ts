import {
  googleSearchCount,
  googleSearchCountPlaywright,
  googleSearchCountPlaywrightMulti,
} from '../browseSearchCount'

async function main() {
  let start = Date.now()

  console.log(await googleSearchCountPlaywrightMulti(['RS3']))
  return
  console.log(await googleSearchCountPlaywright('lion'))
  console.log(Date.now() - start)

  start = Date.now()
  console.log(await googleSearchCount('lion'))
  console.log(Date.now() - start)
}

main()
