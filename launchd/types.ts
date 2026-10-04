export type Schedule =
  | { kind: 'interval'; seconds: number }
  | {
      kind: 'calendar'
      /** 1-12。省略すると毎月 */
      months?: number[]
      /** 1-31。省略すると毎日 */
      day?: number
      hour?: number
      minute: number
    }

type JobBase = {
  label: string
  purpose: string
}

/** このリポジトリが plist を生成・配置するジョブ */
export type ManagedJob = JobBase & {
  managed: true
  program: string[]
  schedule: Schedule
  workdir?: string
  /** 実行前に source する env ファイル (launchd は .envrc を読まないため) */
  envFile?: string
}

/** plist / crontab の正本が他リポジトリにあるジョブ。台帳には載せて監視だけする */
export type ExternalJob = JobBase & {
  managed: false
  scheduler: 'launchd' | 'cron'
  owner: string
  /** dead = スクリプト消失などで撤去待ち。health では failing ではなく dead として出す */
  isDead?: boolean
}

export type Job = ManagedJob | ExternalJob

export type Manifest = {
  jobs: Job[]
}

export type LaunchctlEntry = {
  label: string
  pid: number | null
  lastExit: number
}

export type HealthStatus =
  | 'ok'
  | 'failing'
  | 'restarting'
  | 'not-loaded'
  | 'dead'
  | 'unregistered'
  | 'unchecked'

export type HealthRow = {
  label: string
  status: HealthStatus
  lastExit: number | null
}
