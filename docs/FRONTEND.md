# Gyotaku Portal (Next.js + Juno)

ブラウザ向け魚拓ポータルの実験用Next.jsアプリです。Juno Hostingで静的配信する前提で `next export` を採用しています。

## 使い方

```bash
cd apps/gyotaku-portal
npm install

# 開発サーバー
npm run dev

# 本番ビルド（out/ を生成）
npm run build
```

## Juno連携

- `npm run juno:dev` — `juno hosting dev --mode staging` を呼び出し、ローカルからStaging Satelliteへ同期。
- `npm run juno:deploy` — `juno hosting deploy` を実行。`juno.config.ts` 内の `ids` / `source` を参照します。

`JUNO_TOKEN` を環境変数に設定した上でコマンドを実行してください（例: `.env` やシェルのexport）。
