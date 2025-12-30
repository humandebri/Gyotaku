# Gyotaku Portal (Next.js)

ブラウザ向け魚拓ポータルの実験用Next.jsアプリです。静的配信を前提に `next export` を採用しています。

## 使い方

```bash
npm install
npm run dev    # 開発サーバー
npm run build  # dist/frontend へエクスポート
```

## 静的ビルド

- `npm run build` で `dist/frontend` を生成します。

## ルーティング（暫定）
- `/` : ホーム（フィードのモック）
- `/capture` : 魚拓作成フォーム
- `/archive` : 魚拓一覧
- `/archive/[id]` : 魚拓詳細
- `/governance` / `/profile` / `/settings` : 旧UI機能の移植先プレースホルダ
