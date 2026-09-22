## minutely

> この Mac で動く自作の定期実行 (launchd / cron) の台帳と失敗検知

元は「毎分起動して cron 式を照合するディスパッチャ」だったが廃止した
(1 回 CPU 約 2 秒 × 1440 回/日、実タスクは最大 24 回/日。実行時の型検査で 3 か月全停止しても気づけなかった)。
スケジューラは launchd 自体に任せ、このリポジトリは **何が登録されていて、どれが落ちているか** だけを持つ。

```bash
nr launchd ls                 # 台帳 + 現在の状態
nr launchd health             # 問題のあるジョブだけ
nr launchd render <label>     # managed ジョブの plist を出力
nr launchd install <label>    # ~/Library/LaunchAgents に配置して登録し直す
nr launchd uninstall <label>  # launchd から外して plist を消す
nr test && nr typecheck
```

- 台帳は `launchd/jobs.json`。
  - `managed: true` — plist をここから生成する。ログは `~/Library/Logs/elzup/<label>.log`。
  - `managed: false` — plist の正本は各リポジトリ (forge, quota, daily-report-ai …)。載せて監視だけする。
- `com.elzup.launchd-health` が毎日 10:30 に `health --notify` を実行し、問題の集合が**変化したときだけ** Slack (`SLACK_URL`, `.envrc`) に通知する。
- 状態の意味: `failing` = 最後の終了コードが非 0 / `restarting` = KeepAlive で再起動中だが前回は失敗 /
  `not-loaded` = 台帳にあるが launchd に無い / `dead` = 撤去待ち / `unregistered` = 自作 plist なのに台帳に無い。
- `node launchd/cli.ts` は node の type stripping で直接動く (依存ゼロ、型検査は実行経路に置かない)。

マシン状態の計測は [forge](https://github.com/elzup/forge) の役割で、ここでは扱わない。

`jobs/` は managed ジョブの本体 (`morningNews.ts` = 7:00 のニュース)。
`morseClock.ts` (毎時の morse 時報) は dabod へ移植予定のため台帳から外して停止中。移植が済んだら消す。
