// Central place for runtime configuration shared by the Taggr UI.
const FALLBACK_DOMAIN = "taggr";

export function getTaggrDomain() {
    // ドメイン設定は任意。未指定の場合は Taggr 既定値で動作する。
    return process.env.GYOTAKU_TAGGR_DOMAIN?.trim() || FALLBACK_DOMAIN;
}
