import CaptureForm, { type CaptureFormState } from "./capture-form";
import { submitCapture } from "@/lib/taggr-client";
import { createHash } from "crypto";

const MAX_HTML_BYTES = 4 * 1024 * 1024;
const ALLOWED_TAGS = new Set([
    "html",
    "head",
    "body",
    "article",
    "section",
    "div",
    "span",
    "p",
    "a",
    "img",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "header",
    "footer",
    "nav",
    "main",
    "aside",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "pre",
    "code",
    "figure",
    "figcaption",
    "strong",
    "em",
    "small",
    "sup",
    "sub",
    "br",
    "hr",
    "img",
    "video",
    "source",
    "picture",
]);

const GLOBAL_ATTRS = new Set(["class", "id", "title", "style", "aria-label", "role"]);
const URI_ATTRS = new Set(["href", "src", "data-src"]);
const BOOLEAN_ATTRS = new Set(["disabled", "checked", "selected", "required", "readonly"]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(["href", "rel", "target", "title"]),
    img: new Set(["src", "alt", "width", "height", "loading"]),
    video: new Set(["src", "poster", "controls", "autoplay", "loop", "muted"]),
    source: new Set(["src", "type", "media"]),
    table: new Set(["summary"]),
    td: new Set(["colspan", "rowspan", "headers"]),
    th: new Set(["colspan", "rowspan", "headers", "scope"]),
};

const initialState: CaptureFormState = {
    status: "idle",
    message: "",
};

async function createCapture(
    _prevState: CaptureFormState,
    formData: FormData,
): Promise<CaptureFormState> {
    "use server";

    const url = (formData.get("url") ?? "").toString().trim();
    const notes = (formData.get("notes") ?? "").toString().trim();
    const realm = (formData.get("realm") ?? "").toString().trim();
    const visibility = (formData.get("visibility") ?? "public").toString().trim();
    const priceRaw = (formData.get("price") ?? "").toString().trim();

    if (!url) {
        return {
            status: "error",
            message: "URLを入力してください。",
        };
    }

    const price = priceRaw ? Number(priceRaw) : undefined;
    if (priceRaw && (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price))) {
        return {
            status: "error",
            message: "有料価格は1以上の整数で入力してください。",
        };
    }
    if (visibility === "paid" && !price) {
        return {
            status: "error",
            message: "有料にする場合は価格を入力してください。",
        };
    }

    let rawHtml: string;
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            return {
                status: "error",
                message: `URLの取得に失敗しました (status: ${response.status})`,
            };
        }
        rawHtml = await response.text();
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "魚拓の取得に失敗しました",
        };
    }

    const sanitizedHtml = sanitizeHtml(rawHtml, url);
    const htmlSize = Buffer.byteLength(sanitizedHtml);
    if (htmlSize > MAX_HTML_BYTES) {
        return {
            status: "error",
            message: `HTMLサイズが大きすぎます (${(htmlSize / (1024 * 1024)).toFixed(2)}MB)。${
                MAX_HTML_BYTES / (1024 * 1024)
            }MB以下のページで試してください。`,
        };
    }

    const capturedAt = new Date().toISOString();
    const contentHash = createHash("sha256").update(sanitizedHtml).digest("hex");

    const result = await submitCapture({
        url,
        notes: notes || undefined,
        realm: realm || undefined,
        html: sanitizedHtml,
        capturedAt,
        contentHash,
        visibility: visibility || "public",
        price: visibility === "paid" ? price : undefined,
    });

    if (result.success) {
        return {
            status: "success",
            message: result.mocked
                ? "環境変数が未設定のためモックモードで魚拓を記録しました。"
                : `魚拓を送信しました（Post ID: ${result.postId ?? "pending"}）。`,
        };
    }

    return {
        status: "error",
        message: result.error ?? "魚拓の送信に失敗しました。",
    };
}

function sanitizeHtml(input: string, sourceUrl?: string) {
    let sanitized = input
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .replace(/<!--([\s\S]*?)-->/g, "")
        .replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, "");

    const beforeLength = sanitized.length;
    sanitized = sanitized.replace(/<\/?([a-zA-Z0-9:-]+)([^>]*)>/g, (match, tag, attrs) => {
        const lowerTag = String(tag).toLowerCase();
        if (!ALLOWED_TAGS.has(lowerTag)) {
            return "";
        }
        if (match.startsWith("</")) {
            return `</${lowerTag}>`;
        }
        const cleanedAttrs = sanitizeAttributes(lowerTag, attrs || "");
        return `<${lowerTag}${cleanedAttrs}>`;
    });

    if (sanitized.length !== beforeLength && sourceUrl) {
        console.warn(
            `[Gyotaku] sanitized HTML from ${sourceUrl}, removed ${beforeLength - sanitized.length} characters`,
        );
    }

    return sanitized;
}

function sanitizeAttributes(tag: string, rawAttrs: string) {
    if (!rawAttrs) {
        return "";
    }
    const allowedAttrs = new Set<string>(GLOBAL_ATTRS);
    const tagSpecific = ALLOWED_ATTRS[tag];
    if (tagSpecific) {
        tagSpecific.forEach((attr) => allowedAttrs.add(attr));
    }

    const attrRegex = /([a-zA-Z0-9:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
    let cleaned = "";
    let match: RegExpExecArray | null;
    while ((match = attrRegex.exec(rawAttrs)) !== null) {
        const name = match[1].toLowerCase();
        if (!allowedAttrs.has(name) && !BOOLEAN_ATTRS.has(name)) {
            continue;
        }
        const rawValue = match[2];
        if (BOOLEAN_ATTRS.has(name) && !rawValue) {
            cleaned += ` ${name}`;
            continue;
        }
        let value = rawValue ? stripQuotes(rawValue) : "";
        if (!value && !BOOLEAN_ATTRS.has(name)) {
            continue;
        }
        if (URI_ATTRS.has(name) && !isSafeUrl(value)) {
            continue;
        }
        if (name === "style") {
            value = sanitizeStyle(value);
            if (!value) {
                continue;
            }
        }
        cleaned += ` ${name}="${value}"`;
    }
    return cleaned;
}

function stripQuotes(value: string) {
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}

function isSafeUrl(url: string) {
    const normalized = url.trim().toLowerCase();
    if (!normalized) {
        return false;
    }
    return (
        normalized.startsWith("http://") ||
        normalized.startsWith("https://") ||
        normalized.startsWith("//") ||
        normalized.startsWith("data:image/")
    );
}

function sanitizeStyle(value: string) {
    const lowered = value.toLowerCase();
    if (lowered.includes("expression") || lowered.includes("javascript:")) {
        return "";
    }
    return value.replace(/url\([^)]*javascript:[^)]*\)/gi, "");
}

export default function CapturePage() {
    return (
        <main className="mx-auto max-w-4xl space-y-10 px-6 py-16 lg:px-8">
            <header className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[6px] text-slate-500">
                    Capture
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    魚拓を取得
                </h1>
                <p className="text-base leading-relaxed text-muted-foreground">
                    元記事のURLや補足メモを入力し、ジャンルを選択して保存します。未認証の状態では送信が拒否される可能性があります。
                </p>
            </header>
            <CaptureForm action={createCapture} initialState={initialState} />
        </main>
    );
}
