---
title: "Gyotaku移行ポリシー（段階移行版）"
updated: "2024-04-??"
note: "Taggr本体を温存したまま魚拓機能へスライドさせるための当面方針"
---

## 基本方針
- Taggrの既存機能は極力そのまま残し、Gyotaku固有要件と競合する箇所のみを段階的に無効化・改修する。
- 変更は「設定で止める → APIで分岐 → 最後に削除」の3段階で行い、巻き戻し可能な差分を維持する。
- 設計判断は `docs/Plan.md` のロードマップと突き合わせ、魚拓アーカイブに必要な新機能を優先して追加する。

## 機能ステータス一覧（暫定）
| カテゴリ | 主なモジュール | 現状方針 |
| --- | --- | --- |
| トークン経済／決済 | `env/token.rs`, `env/auction.rs`, `env/distribution.rs`, `tokens*.tsx` | トークンエコシステムは面白い資産となるため維持。オークションだけは削除し、将来の魚拓課金モデルを検討。 |
| ガバナンス／DAO | `env/proposals.rs`, `env/nns_proposals.rs`, `frontend/proposals.tsx` | 提案／投票UIも残す。Gyotaku側の運用ルールが固まるまで「Gyotaku設定には影響しない」旨を明記して使い分ける。 |
| Realms／ドメイン | `env/realms.rs`, `env/domains.rs`, `frontend/realms.tsx`, `domains.tsx` | マルチコミュニティ構想は将来のアーカイブ区分に転用できるため維持。設定値だけ単一ドメイン向けに絞る。 |
| SNS投稿／エンゲージメント | `frontend/feed.tsx`, `post_feed.tsx`, `thread.tsx`, `env/post.rs` | 当面は残す。魚拓ビューが実装できた段階で二本立て運用に入り、アクセス導線を整理。 |
| ソーシャルグラフ | `env/user.rs`, `frontend/inbox.tsx`, `invites.tsx` | 連絡・招待機能も保持し、魚拓共有フローの検証に活用。通知の過負荷だけ監視。 |
| プロフィール／PFP | `env/pfp.rs`, `frontend/profile.tsx` | ストレージ圧迫が許容範囲かを計測しつつ継続。容量問題が顕在化したら圧縮方針を再検討。 |
| マルチメディア投稿 | `env/storage.rs`, `frontend/image_preview.ts` | 魚拓スクリーンショット保存の再利用候補。実装を流用しつつハッシュ保存を追記する。 |
| Feature Flags | `env/features.rs` | 不要なフラグは即削除せず、`gyotaku_only` など新フラグで分岐。 |

## データ保存構造について
- 当面はTaggr既存のデータ構造をそのまま利用し、Gyotaku固有の魚拓データも同じ枠組みで保持する。
- もし将来的にボトルネックが顕在化した場合のみ、`docs/Plan.md`側で正式に移行計画を立てる。

## 具体的な改修項目（コード精査結果ベース）

### バックエンド
- `src/backend/updates.rs`
  - 既存の `add_post_data` / `add_post_blob` / `commit_post` を魚拓入力にも使う。`Draft` には `meta.json` や `raw.html` を blob として積み、`id` を `archive_meta`, `archive_html`, `archive_screenshot` のように固定。
  - Gyotaku専用の update（例: `set_archive_source_url`）を追加する場合は、`caller(state)` 認証・`CONFIG.max_blob_size_bytes` のバリデーションを既存実装にならって入れる。
- `src/backend/env/post.rs`
  - `Post::save_blobs` が blob ID を `files` に登録するため、魚拓blobの命名規約をコメント化。`Post::with_meta` へ「realmがgyotakuならNSFW判定をスキップ」等の分岐もここで制御できる。
  - 既存 `Post::delete` は `hashes` を削除フラグとして使うため、GyotakuのMerkle情報は `hashes` ではなく `archive_meta` blob に埋め込む。
- `src/backend/env/storage.rs` / `src/bucket/src/lib.rs`
  - `Storage::write_to_bucket` の仕様はそのまま使い、HTTPサーブ側に `/blob` ルートを追加して JSON/HTML を返せるようにする。`bucketImageUrl` 依存を崩さないため `Content-Type` は queryパラメータ（例: `mime=text/html`）で指定。
- `src/backend/env/realms.rs` / `src/backend/env/mod.rs`
  - `state.init()` で gyotaku専用 Realm を自動生成し、`Realm` 設定に「投稿 = 魚拓のみ」とわかる `metadata` を付与。既存の Realm CRUD API を温存しつつ default realm を差し替える。
- `src/backend/queries.rs`
  - `files` テーブルを直接 expose する `get_post_files(post_id)` を追加しておけば、フロントは bucket URL をクラスタ内で計算できる。現行の query パターン（`reply(read(|state| { ... }))`）に倣う。

### フロントエンド
- `src/frontend/src/form.tsx`
  - Gyotakuモードのフォーム（URL入力、スクショアップロード、メタ情報表示）を `Form` の props と state で切り替え。`tmpBlobs` に `archive_*` ID をセットし、本文には簡易サマリのみを残す。
- `src/frontend/src/new.tsx`
  - `PostSubmissionForm` に「魚拓作成」タブを追加。`newPostCallback` へ `mode: "gyotaku" | "default"` を渡し、Gyotaku時は realm を強制・`encodeExtension` を空にする。
- `src/frontend/src/post.tsx`
  - `filesToUrls` の返り値を画像以外も扱える形へ拡張（`bucketBlobUrl` を呼ぶ）。`PostView` で `archive_meta` を検出した際に JSON fetch → 元URLや検証情報を描画するカードを追加。
- `src/frontend/src/post_feed.tsx` / `src/frontend/src/search.tsx`
  - `realm === "gyotaku"` の投稿だけを集計するフィルタと新しいタブ（例: “Gyotaku”）を追加。既存の feed ロジック（`loadFeed`）を流用しつつ、UIだけ切り替え。
- `src/frontend/src/api.ts`
  - 新たに追加する backend update/query を interface に追加し、`window.api` で呼べるようにする。`Backend` 型破壊を避けるため optional メソッドとして定義しておく。

### Bucket UI/UX
- `bucketImageUrl` を `bucketBlobUrl` にリネームし、`Content-Type` を query で渡す（デフォルトは従来通り image/png）。既存の画像フローは互換を保つ。
- Blobのダウンロード導線を `src/frontend/src/post.tsx` に追加し、ユーザーが HTML / JSON を直接保存できるようにする。

## 次アクション
1. 既存機能を保持したままGyotaku要件を満たせるか、各カテゴリのリスクを洗い直す（テスト観点・UX観点）。
2. 現行データ構造で魚拓メタデータを記録するPoCを実装し、必要なフィールドだけ追加で補う。
3. 魚拓専用機能（アーカイブ作成・検証UI）を追加し、徐々にユーザー導線をTAGGR→Gyotakuへ寄せていく。
