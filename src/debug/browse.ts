import {
  googleSearchCountPlaywright,
  googleSearchCount,
} from '../browseSearchCount'

async function main() {
  let start = Date.now()

  console.log(await googleSearchCountPlaywright('lion'))
  console.log(Date.now() - start)

  start = Date.now()
  console.log(await googleSearchCount('lion'))
  console.log(Date.now() - start)
}

main()
