import { parseCronExpression } from 'cron-schedule'

export const cronMatch = (cronExp: string, date: Date) =>
  parseCronExpression(cronExp).matchDate(date)
