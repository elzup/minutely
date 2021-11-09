import { slackNotify } from './slack'

const SLACK_URL = process.env.SLACK_URL || ''

export const slackNotice = (
  username: string,
  text: string,
  icon_emoji: string
) => {
  if (!SLACK_URL) throw new Error('SLACK_URL is not defined')

  return slackNotify(SLACK_URL, {
    text,
    channel: '#notice',
    username,
    icon_emoji,
  })
}
