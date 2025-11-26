#!/usr/bin/env bash
# Helper for spinning up the DFX replica + Taggr canister for local UI development.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() {
    printf '[run-local] %s\n' "$1"
}

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log "コマンド '$1' が見つかりません。インストール後に再実行してください。"
        exit 1
    }
}

ensure_env_file() {
    local env_file=".env.local"
    if [[ -f "$env_file" ]]; then
        return
    }
    if [[ -f ".env.local.example" ]]; then
        cp .env.local.example "$env_file"
        log ".env.local をテンプレートから作成しました。GYOTAKU_CANISTER_ID を更新して再実行してください。"
    else
        log ".env.local が存在しません。必要な環境変数を手動で用意してください。"
    }
    exit 1
}

start_replica() {
    local port="8080"
    if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
        log "ポート ${port} で既にレプリカが動いているようです。起動手順をスキップします。"
        return
    fi
    log "DFX レプリカを起動します (make start)"
    make start >/dev/null
    log "レプリカ起動完了。"
}

deploy_canisters() {
    log "Taggr canister をローカルへデプロイします (make local_deploy)"
    make local_deploy
}

build_canisters() {
    log "開発ビルドを実行します (make dev_build)"
    make dev_build
}

reinstall_taggr() {
    log "Taggr canister を再インストールします (make local_reinstall)"
    make local_reinstall
}

main() {
    require_cmd dfx
    require_cmd make
    require_cmd npm
    ensure_env_file
    start_replica
    deploy_canisters
    build_canisters
    reinstall_taggr
    log "ローカルレプリカの準備が整いました。別ターミナルで 'npm start' もしくは 'npm run dev' を実行してください。"
}

main "$@"
