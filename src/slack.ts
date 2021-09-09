import axios from 'axios'

type Payload = {
  text: string
  channel: string
  username?: string
  icon_emoji?: string
}

export function slackNotify(url: string, data: Payload) {
  return axios.request({
    method: 'POST',
    url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
  })
}
