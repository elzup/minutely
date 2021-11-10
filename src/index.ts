import { cronMatch } from './cronMatch'
import { mensaCheck } from './mensaCheck'
import { slackNotice } from './slackCli'

async function main() {
  const now = new Date()
  const hourly3 = '* 0 */3 * * * *'
  const weekly = '* 0 6 * * SAT *'

  if (cronMatch(hourly3, now)) {
    mensaCheck()
  }

  if (cronMatch(weekly, now)) {
    slackNotice('weekley', 'minutely works', ':+1:')
  }
}

main()
