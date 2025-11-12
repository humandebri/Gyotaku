1. 「Taggr をフォークする」ことについて
✅ 利点

Taggr は既に ICP（Internet Computer Protocol）上の分散SNSプラットフォームとして動いているプロジェクト。

つまり、ICP 上での canister 配置、ユーザ認証、投稿機能、UI／UX等が既にベースとして実装されており、あなたの「魚拓保存＋検証」機能を乗せる出発点としては時間と労力を省ける。

Rust 版の canister（あるいは WASM 対応）を使っている可能性があるため、Rust に適応しやすい。実際 Taggr のリポジトリには rust-toolchain.toml が含まれています。 
GitHub

⚠️ 注意点／リスク

Taggr が持つ機能の多く（SNS投稿・フォロー・反応など）はあなたの目的とは少し異なる。つまり「魚拓＋検証」の専業プラットフォームにおいては機能過剰／不要なコードが多い。フォーク時には不要な機能を整理・削除するコストがある。

ライセンス：Taggr は GPL-3.0 ライセンスとなっており、フォーク／改変時にはその条件を守る必要あり。 
GitHub

技術的な整合性：Taggr が「分散SNS」目的で作られているため、あなたの「魚拓アーカイブ＋検証」アプリケーション用にモジュールを大幅に改造する必要がある。設計の自由度が制限される可能性あり。

スケーラビリティ／ストレージ要件：魚拓を多数保存する用途では、元の SNS用途より“ストレージ重・BLOB多”になるため、Taggrのアーキテクチャがそのまま最適とは限らない。

🎯 結論：フォークは「あり」だが「慎重に」

あなたの目的を最短で実現するためには「Taggr をフォークして魚拓機能を上に載せる」道は有効。

ただし、設計の方向性をあらかじめ明確にして、不要な部分を整理・改造する計画を立てること。

特に、「SQLite＋Merkle＋Notary」部分はTaggrには含まれていない可能性が高いので、そこを新規実装／統合する必要あり。

2. 設計概要（Rust／ICP／SQLite＋魚拓保存プラットフォーム）
アーキテクチャ全体図
[ クライアント（ブラウザ / 拡張） ]
        ↓
[ フロントエンド（Web UI, Next.jsなど） ]
        ↓
[ API / canisterモジュール (Rust) ]
        ├─ ArchiveDB Canister (SQLiteインターフェース)
        ├─ Notary Canister (刻印／検証)
        └─ Storage Canister（スクショ／大バイナリ／必要なら） 

モジュール別設計

ArchiveDB Canister

SQLite を embed（Rust + rusqlite または別ライブラリ）

API: store_archive, get_archive, list_archives, verify_archive

データモデル：アーカイブ単位のレコード（URL, timestamp, canonical_html, screenshot_hash, merkle_root, uploader_did, uploader_sig, etc）

バイナリ（スクショ/HTML）は可能なら別Storage Canisterに格納し、ArchiveDBにはハッシュと参照のみ持たせる。

Notary Canister

単純な刻印サービス：store_root(archive_id, merkle_root, uploader_did, timestamp)、get_root(archive_id)

改竄防止：append-only、所有者／管理者による削除や更新操作なし。

Rust (or Motoko) で実装可能。Rust CDK for ICP を使えば統一できる。

フロントエンド／ブラウザ拡張

ユーザーが任意のWebページ/投稿URLを入力または保存ボタンをクリック

ページを取得・正規化・スクショ取得、ハッシュ生成、Merkle root生成、署名取得（ユーザー DID）

その上で store_archive を呼ぶ。

UI 上で保存済アーカイブの一覧・検証ステータス・“Verified”バッジを表示。

データモデル（Rust構造体例）
struct Archive {
    id: String,
    source_url: String,
    captured_at: DateTime<Utc>,
    canonical_html_hash: String,
    screenshot_hash: String,
    merkle_root: String,
    uploader_did: String,
    uploader_sig: String,
    notary_tx: Option<u64>,
    metadata_json: String,
}

ハッシュ／Merkleロジック（Rust版）

Use sha2 crate (Sha256)

Leaf生成関数、Merkle tree構築関数

Signature: DID 署名は ed25519-dalek などで実装

ストレージ／SQL（Rust rusqlite）

Open or create SQLite database inside canister state

Use prepared statements for inserts

Ensure append-only constraints (no DELETE, minimal UPDATE)

検証フロー

Frontend から verify_archive(archive_id) を呼ぶ

Canister computes or retrieves stored values, recalculates merkle root if full data is accessible or rely on stored hashes

Compare with Notary’s get_root

Return result (Verified, Unverified, MissingData)

UI／UX要件

魚拓保存時：進捗（スクショ取得、正規化、ハッシュ生成、署名、アップロード）をユーザーに見せる

アーカイブ詳細ページに「検証バッジ」「Proof JSONダウンロード」「notaryリンク」「検証履歴」表示

OG画像生成（Optional）：スクショ＋short-hash刻印＋“Verified”バッジ。フロントエンドまたはバックエンドで自動生成

3. スケジュールとマイルストーン

スプリント1（2〜4週間）

Taggrリポジトリをクローン・理解

Rust／ICP 環境セットアップ

Notary Canister の基本実装（store/get）

SQLite構造体＋Rustのデータモデル定義

スプリント2（4〜6週間）

ArchiveDB Canister実装：store_archive, get_archive

Leaf＋Merkleハッシュ生成ライブラリ実装

クライアント側（簡易CLI／ブラウザ版）保存フロー実装

スプリント3（4〜6週間）

フロントエンド UI：保存フォーム、一覧、検証ボタン

検証機能実装（verify_archive）

OG画像生成、自動署名／receipt機能

スプリント4（6〜8週間）

テスト／監査：改竄シナリオ、署名漏洩、DB書換チェック

UX改善、エラーハンドリング、ログ／監視ダッシュボード

デプロイ準備、セキュリティチェック、ライセンス整理

4. 技術選定ハイライト／理由

Rust：メモリー安全・WASM変換容易・高性能。ICP canister で Rust CDK が利用可能。

SQLite：透過性・移植性が高い。魚拓データ構造には十分。

Merkleハッシュ方式：改竄検出が確実。

Notary canister：改竄防止の根幹。

前段に Taggr を使う：SNS機能が既にあるので、魚拓専用プラットフォームへの拡張が早く可能。

5. フォーク時に注意すべき具体項目

不要なSNS投稿／フォロー／コメント機能を整理・削除して、魚拓保存中心に設計を簡素化。

TaggrのUI／文言が「ソーシャルネットワーク寄り」なので、「魚拓アーカイブ＋検証」寄りのUIに置き換える。

ライセンス（GPL-3.0）遵守：フォーク元コードをそのまま改変・再配布する場合は同ライセンスの継承を考慮。

ストレージ設計の見直し：Taggrが投稿軽量設計なら、あなたは重め（HTML＋画像＋スクショ）の設計。性能・コストの評価が必要。

スケーリング・運用コストを明確化：魚拓数が増えたときの対応（アーカイブ老朽化／冷アーカイブ）を早期から設計。

セキュリティ／監査ログ強化：改竄検出機能を設計初期段階から入れる。

6. 現状コード精査メモ

- バックエンド
  - `src/backend/updates.rs` の `add_post_data` → `add_post_blob` → `commit_post` が投稿保存の本線。`Post::create`／`Post::save_blobs`（`src/backend/env/post.rs`）に着地し、`Storage::write_to_bucket`（`src/backend/env/storage.rs`）経由で bucket canister へバイナリを書き込む。
  - 投稿の添付は `Post.files: BTreeMap<String, (u64, usize)>` に `id@bucket_principal` で紐づき、Next.js 側では `/_next/static/...` のURLを生成して描画する。現状は `/image` エンドポイント固定なので、HTML等の任意BLOBを返すには bucket 側に追加ルートが必要。
  - 投稿ドラフトは `src/backend/env/user.rs` の `Draft` 構造体で保持（本文・realm・extension・blobs）。Gyotaku情報はここにJSON化して格納するか、既存の `blobs` と `files` を流用して `meta.json`／`raw.html` を添付すればデータ構造を変えずに運べる。
  - Notary/ハッシュ計算向けの拡張は `Post.hashes`（削除時に使用）と `Post.extension` を流用できないため、`Post.files` に proof JSON を置き、検証ロジックは別queryで取り出す形が現実的。

- フロントエンド
  - 投稿フォームは Next.js App Router 上で再実装し、URL・スクリーンショットなどを `Route Handler` へ投げる。Gyotaku入力欄は `app/(site)/capture/page.tsx` で管理する。
  - 表示側は `app/archive/[id]/page.tsx` で `meta.json` を読み込み、元URLや検証結果をCard化する。Xリンクの場合はX風カードに切り替える。
  - API レイヤーは Next.js の server actions / route handlers へ移行し、DFINITY SDK 呼び出しを `app/lib/ic-client.ts` などに閉じ込める。

7. Gyotaku移行タスク（コード指定）

- `app/(site)/capture/page.tsx` に「魚拓を作成」フォームと URL 入力欄を実装。`meta.json`（URL, timestamp, canonical hash, merkle root など）と `html`/`screenshot` をRoute Handlerへ送る。
- Realm指定は Next 側でGyotaku専用Realmを強制し、`src/backend/env/realms.rs`（`realms::create_realm` 周辺）の初期化と整合をとる。
- `src/backend/env/realms.rs` および `state.init()`（`src/backend/env/mod.rs`）に「gyotaku」Realm をプリセット登録。これにより既存の `Post.realm` を使って魚拓と通常投稿をUIで切り替えられる。

### 7.2 フェーズ1：アーカイブ保存API
- `src/backend/updates.rs` に `submit_archive_metadata`（仮）を追加し、`Draft` に `archive_meta` blob を push できるようにする。既存の `add_post_blob` を流用しても良いが、`id` 命名規約（例: `archive_meta`, `archive_html`, `screenshot_png`）を決めておく。
- `Post::save_blobs`（`src/backend/env/post.rs`）に Gyotaku固有IDを検知するバリデーション／ロギングを追加。`Storage::write_to_bucket` の戻り値 `(Principal, offset)` をそのまま `files` に保持する既存仕様を活用する。
- バケット canister（`src/bucket/src/lib.rs`）に `/blob` のようなHTTPルートを追加し、`Content-Type` を `application/json` / `text/html` などアップロード時に決められるようクエリパラメータを拡張する。`bucketImageUrl` も一般化して `bucketBlobUrl` を用意。

### 7.3 フェーズ2：閲覧・検証UI
- `app/archive/[id]/page.tsx` で `archive_meta` を読み込み、元URL・取得日時・Merkle root をカード表示。`meta.json` からスクショIDを辿って `<Image>`／ダウンロードボタンを描画。
- `app/archive/page.tsx`（一覧）や `app/search/page.tsx` で `realm === "gyotaku"` の投稿のみを表示する。
  - API側で `get_archive_blob(post_id, blob_id)` のような query を `src/backend/queries.rs` に追加し、Nextクライアントが bucket URL を直接組み立てなくても良いようにする（セキュリティ／CORS対策）。既存の `files` 取得パターンを流用すればOK。

### 7.4 フェーズ3：Notary連携
- `src/backend/env/mod.rs` もしくは専用モジュールに `GyotakuProof` ヘルパーを実装し、`meta.json` に入っている `merkle_root` を `State::notary`（新規フィールド）へ書き込む update を追加。データ構造は維持し、`Post.hashes` には触れない。
- `app/archive/[id]/page.tsx` に検証ボタンを配置し、`verify_archive(post_id)` query を叩いて Notaryとの照合結果（OK/NG/Unknown）を表示。結果はカード内のステータスとして反映。

### 7.5 フェーズ4：テストと監視
- バックエンド: `cargo test -- --test-threads 1` で `Post::save_blobs` の新分岐や Realm 初期化の回帰を確認。必要に応じて `src/backend/env/post.rs` に単体テストを追加。
- フロントエンド: `npm run test:e2e` のタグを追加し、魚拓作成→検証のUIフローを Playwright で自動化。
- 運用: `make start` + `npm start` でローカル統合を行い、`window.backendCache.stats.buckets` が更新されることを確認。
