---
title: "Juno 利用ノート（Gyotaku向け）"
updated: "2024-04-??"
note: "docs/docs.txt から抽出した全情報をGyotaku開発の観点で整理"
---

## 1. 全体像
- **提供サービス**: Authentication / Datastore / Storage / Hosting / Functions / Analytics を単一プラットフォームで提供。  
- **思想**: Vercel/Netlify に近いDXを保ちながら「分散インフラ＋所有権」を確保できる点を強調。Self-hosting との比較では「オペレーション負荷を肩代わり」するメリットを訴求。  
- **Gyotakuへの適用**: ICP canister(Taggr本体)はそのまま、魚拓専用UI/SSR/補助APIをJuno上のNext.jsアプリ＋Functionsで構築する想定。
- 参考リンク  
  - Comparisons: https://juno.build/docs/category/comparisons  
  - GitHub Actions: https://juno.build/docs/guides/github-actions/deploy-frontend  
  - Hosting / Custom Domain: https://juno.build/docs/build/hosting/development  
  - Configuration Reference: https://juno.build/docs/reference/configuration  

## 2. 初期セットアップ手順
1. **JUNO_TOKENの取得**  
   - Juno Console の Satellite 画面で controller を追加し、`Read-write` 権限のトークンを発行。`JUNO_TOKEN` としてGitHub Secretsに登録。
2. **juno.configの作成**  
   ```ts
   import { defineConfig } from "@junobuild/config";

   export default defineConfig({
       satellite: {
           ids: {
               production: "qsgjb-riaaa-aaaaa-aaaga-cai",
               staging: "xxxx-xxxx-xxxx-xxxx-cai",
           },
           source: "dist/frontend",
           predeploy: ["npm run build"],
           ignore: ["**/*.txt", ".tmp/"],
           precompress: [
               {
                   pattern: "**/*.+(js|mjs|css)",
                   algorithm: "brotli",
                   mode: "replace",
               },
               {
                   pattern: "**/*.html",
                   algorithm: "brotli",
                   mode: "both",
               },
           ],
       },
       // orbiter: { ... } // Analytics を自動連携したい場合に定義
   });
   ```
   - `satellite.id` または `satellite.ids` のいずれかを使用（両立不可）。  
  - `source` はビルド成果物のディレクトリ（本プロジェクトでは `dist/frontend`。一般的には Next.js: `out`, React/Vite: `dist`, SvelteKit: `build` など）。  
   - `predeploy` でビルドやLintを自動化。  
   - `ignore` は `.gitignore` と同様のglob指定。  
   - `precompress` は `pattern / mode / algorithm` を細かく調整できる（HTMLを `mode:"replace"` にするとSNSプレビューが壊れるので注意）。  
   - 設定を変更したら `juno config apply`、precompress周りを変えた場合は `juno hosting clear` → 再デプロイで反映。  
3. **CLI準備**  
   - `npm install --save-dev @junobuild/cli`  
   - ローカル検証: `npx juno hosting dev --mode staging` などでSatelliteと同期。

## 3. GitHub Actions デプロイパイプライン
```yaml
name: Deploy Frontend to Juno
on:
  workflow_dispatch:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - name: Install Dependencies
        run: npm ci
      - name: Build
        run: npm run build          # predeployに含めれば省略可能
      - name: Deploy to Juno
        uses: junobuild/juno-action@main
        with:
          args: hosting deploy --mode ${JUNO_MODE:-production}
        env:
          JUNO_TOKEN: ${{ secrets.JUNO_TOKEN }}
          JUNO_MODE: staging         # staging → production 切替用
```
- ActionはCLIコマンドを代理実行するだけなので `args` に任意のオプションをそのまま記述できる。  
- `PROJECT_PATH` 環境変数を渡すとモノレポ内のサブフォルダを対象にできる。  
- Build Reproducibility: Junoは `sha256` で差分検出するため、非決定的ビルドはデプロイコスト増に直結。`package-lock` 固定＋同一 Node バージョンでCI/ローカルを揃える。  
- デプロイコスト（cycles）はアセット数×頻度に比例。魚拓画像の更新はバッチ化し、Releaseトリガーでworkflowを走らせる選択肢も検討。

## 4. カスタムドメイン設定
1. Console の Hosting ページでカスタムドメインウィザードを実行し、FQDNを登録。  
2. DNS設定（基本は `CNAME -> icp1.io`）。CNAME未対応のapexは flattening(ANAME/ALIAS)を使うかCloudflareへ移行。  
3. プロバイダ別Tips  
   - **Cloudflare**:  
     - DNS > Settings で DNSSEC 無効。  
     - SSL/TLS > Overview を「Off (not secure)」に設定（Juno側で自動的に証明書を発行）。  
     - SSL/TLS > Edge Certificates の Universal SSL を無効化。  
     - レコードは「DNS only」（オレンジクラウドOFF）。  
   - **Google Domains / HostGator / Infomaniak**: apex CNAME非対応のため Cloudflare への移管推奨。  
4. ステータス  
   - `PendingOrder` → `PendingChallengeResponse` → `PendingAcmeApproval` → `Available` が通常フロー。  
   - `Failed` の場合はDNS設定を再確認。Propagationに最大24hかかるので焦って再設定しない。  

## 5. Satellite設定オプション（抜粋）
- **precompress**  
  - `false` で無効化。`mode: "replace"` は元ファイルを除去し `Content-Encoding` で提供。SNSプレビュー崩壊の恐れがあるためHTMLは `mode:"both"` 推奨。  
  - `algorithm: "brotli"` で高圧縮。  
  - ルール配列を渡すと拡張子ごとに異なる設定が可能。  
- **encoding**  
  - 既定マッピング: `.gz=gzip`, `.br=br`, `.Z=compress`, `.zlib=deflate`, その他=identity。  
  - `encoding: [{ pattern: "**/*.custom", value: "br" }]` のように上書きできる。  
- **orbiter**  
  - AnalyticsのID管理を自動化。Next.js/Vite用プラグインがあり、configファイルからIDを読み込んで環境変数に展開できる。  

## 6. モード / マルチ環境
- `juno hosting deploy --mode staging` のように `--mode` 引数で Satellite ID を切り替え。GitHub Actions では `args: hosting deploy --mode staging` もしくは環境変数 `JUNO_MODE` を使う。  
- `ids` に `production`, `staging`, `dev` などを登録すれば1ファイルで複数Satelliteを管理できる。  
- `PROJECT_PATH` を使えば `apps/gyotaku-ssr` のようなサブディレクトリから別Satelliteをデプロイ可能。

## 7. 運用ベストプラクティス
- **デプロイ頻度の最適化**: 魚拓ページは更新頻度が高くなる見込み。Daily BuildではなくReleaseトリガー等でワークフローを抑制。  
- **セキュリティ**: CI用トークンは必要最小限のcontroller権限に限定。管理者権限は人間アカウントに保持。  
- **監視**: `junobuild/juno-action` のログで差分数や失敗箇所を確認。大量の静的アセットがある場合は `juno hosting status` でキューの状況を追跡。  

## 8. Gyotaku適用シナリオ
1. **Next.js + Juno Hosting**  
   - 魚拓閲覧用ポータルをNext.jsで実装し、`/archive/[postId]` でSSR。  
   - 投稿メタデータとスクリーンショットURLはICP canisterからAPI経由で取得。  
   - 元URLが `x.com` / `twitter.com` の場合のみ、OGタグ・カード画像・ディスクリプションをX風に整形し、他ドメインは汎用レイアウトで出力。  
2. **Juno Functions**  
   - 将来的にHTML正規化やスクリーンショット処理をFunctionsで非同期実行し、結果を Storage に格納 → canister側へハッシュだけ返す構成も可能。  
3. **デプロイ戦略**  
   - `staging` Satelliteに自動デプロイ → smokeテスト → `production` Satelliteへ昇格という2段階運用。  
   - `precompress` を利用して `meta.json` などのテキストBLOBをBrotli圧縮し、配信コストを抑える。  

このノートを基にPoCを進め、追加で必要な CLI コマンド例やエラートラブルシューティングが出てきたら本ファイルへ追記する。

## 9. 現在のNext.js実装位置
- ルート直下に Next.js アプリを配置（`app/`, `public/`, `next.config.mjs`, `juno.config.ts`）。
  - `package.json` は Next.js + React 19 + DFINITY SDK + Playwright 依存を包含。
  - `app/page.tsx` で Xリンク検出モックを用意（プレビューをX風or汎用で切り替えるUI）。
  - `npm run build` は `next build && next export -o dist/frontend` を実行し、Canisterが `include_dir!` で読み込む静的ファイルを生成。
- 主要コマンド
  - `npm run dev` — Next.js開発サーバー。
  - `npm run build` — `dist/frontend` へエクスポート。
  - `npm run juno:dev` / `npm run juno:deploy` — Juno CLIラッパー。`JUNO_TOKEN`、`ids.production`／`ids.staging` を環境に合わせて更新する。
  ```bash
  npm install
  npm run dev        # または npm run juno:dev
  ```
