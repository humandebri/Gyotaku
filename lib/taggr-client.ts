// Taggr canister client: provides thin wrappers around JSON-based queries.
import { HttpAgent, QueryResponseStatus, pollForResponse } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import { Principal } from "@icp-sdk/core/principal";

type JsonRecord = Record<string, unknown>;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const env = resolveEnv();
const canisterPrincipal = Principal.fromText(env.canisterId);

let agentPromise: Promise<HttpAgent> | null = null;

function resolveEnv() {
    const fallbackHost = "http://127.0.0.1:8080";
    const fallbackCanister = "aaaaa-aa";
    const fallbackTemplate = "https://{canister}.raw.icp0.io/asset";
    const hostRaw = process.env.GYOTAKU_IC_HOST?.trim();
    const canisterRaw = process.env.GYOTAKU_CANISTER_ID?.trim();
    const templateRaw = process.env.GYOTAKU_BUCKET_URL_TEMPLATE?.trim();
    const hostMissing = !hostRaw;
    const canisterMissing = !canisterRaw;
    if (hostMissing && process.env.NODE_ENV !== "production") {
        console.warn(`環境変数 GYOTAKU_IC_HOST が未設定のため ${fallbackHost} を使用します`);
    }
    if (canisterMissing && process.env.NODE_ENV !== "production") {
        console.warn(`環境変数 GYOTAKU_CANISTER_ID が未設定のため ${fallbackCanister} を使用します`);
    }
    const template = templateRaw && templateRaw.includes("{canister}")
        ? templateRaw
        : fallbackTemplate;
    return {
        host: hostMissing ? fallbackHost : hostRaw!,
        canisterId: canisterMissing ? fallbackCanister : canisterRaw!,
        bucketTemplate: template,
        hostMissing,
        canisterMissing,
    } as const;
}

async function getAgent() {
    if (!agentPromise) {
        agentPromise = HttpAgent.create({
            host: env.host,
        }).then(async (agent) => {
            if (env.host.includes("127.0.0.1") || env.host.includes("localhost")) {
                await agent.fetchRootKey();
            }
            return agent;
        });
    }
    return agentPromise;
}

async function queryJson<T>(methodName: string, args: unknown[], parser: (raw: unknown) => T) {
    const agent = await getAgent();
    const response = await agent.query(canisterPrincipal, {
        methodName,
        arg: encoder.encode(JSON.stringify(args)),
    });

    if (response.status === QueryResponseStatus.Rejected) {
        throw new Error(`Taggr query ${methodName} rejected: ${response.reject_message}`);
    }

    const payload = decoder.decode(response.reply.arg);
    let raw: unknown;
    try {
        raw = JSON.parse(payload);
    } catch (error) {
        const parseError = error instanceof Error ? error.message : "unknown";
        throw new Error(`Taggr query ${methodName} response parse error: ${parseError}`);
    }
    return parser(raw);
}

async function callUpdateRaw(methodName: string, arg: Uint8Array) {
    const agent = await getAgent();
    const { requestId } = await agent.call(canisterPrincipal, {
        methodName,
        arg,
    });
    const { reply } = await pollForResponse(agent, canisterPrincipal, requestId);
    return reply;
}

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null;
}

function assertFiniteNumber(value: unknown, label: string): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`${label} が数値ではありません`);
    }
}

function assertString(value: unknown, label: string): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`${label} が文字列ではありません`);
    }
}

function assertBoolean(value: unknown, label: string): asserts value is boolean {
    if (typeof value !== "boolean") {
        throw new Error(`${label} が真偽値ではありません`);
    }
}

function ensureStringArray(value: unknown, label: string) {
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
        throw new Error(`${label} が文字列配列ではありません`);
    }
    return value;
}

export type TaggrPost = {
    id: number;
    body: string;
    user: number;
    tags: string[];
    realm: string | null;
    timestamp?: number;
    files?: Record<string, [number, number]>;
    [key: string]: unknown;
};

export type TaggrUserFilter = {
    age_days: number;
    safe: boolean;
    balance: number;
    num_followers: number;
};

export type TaggrPostMeta = {
    author_name: string;
    author_filters: TaggrUserFilter;
    viewer_blocked: boolean;
    realm_color: string | null;
    nsfw: boolean;
    max_downvotes_reached: boolean;
    [key: string]: unknown;
};

export type PersonalFeedItem = {
    post: TaggrPost;
    meta: TaggrPostMeta;
};

function toPost(raw: unknown): TaggrPost {
    if (!isRecord(raw)) {
        throw new Error("投稿データが不正です");
    }

    const { id, body, user, tags, realm = null, timestamp, ...rest } = raw;
    assertFiniteNumber(id, "post.id");
    assertString(body, "post.body");
    assertFiniteNumber(user, "post.user");
    const normalizedTags = ensureStringArray(tags, "post.tags");
    if (realm !== null && typeof realm !== "string") {
        throw new Error("post.realm が文字列ではありません");
    }
    if (timestamp !== undefined) {
        assertFiniteNumber(timestamp, "post.timestamp");
    }

    return {
        id,
        body,
        user,
        tags: normalizedTags,
        realm,
        timestamp,
        ...rest,
    };
}

function toUserFilter(raw: unknown): TaggrUserFilter {
    if (!isRecord(raw)) {
        throw new Error("author_filters が不正です");
    }

    const {
        age_days = 0,
        safe = false,
        balance = 0,
        num_followers = 0,
    } = raw;
    assertFiniteNumber(age_days, "author_filters.age_days");
    assertBoolean(safe, "author_filters.safe");
    assertFiniteNumber(balance, "author_filters.balance");
    assertFiniteNumber(num_followers, "author_filters.num_followers");

    return { age_days, safe, balance, num_followers };
}

function toPostMeta(raw: unknown): TaggrPostMeta {
    if (!isRecord(raw)) {
        throw new Error("投稿メタ情報が不正です");
    }

    const {
        author_name,
        author_filters,
        viewer_blocked,
        realm_color = null,
        nsfw,
        max_downvotes_reached,
        ...rest
    } = raw;

    assertString(author_name, "meta.author_name");
    const filters = toUserFilter(author_filters);
    assertBoolean(viewer_blocked, "meta.viewer_blocked");
    if (realm_color !== null && typeof realm_color !== "string") {
        throw new Error("meta.realm_color が文字列ではありません");
    }
    assertBoolean(nsfw, "meta.nsfw");
    assertBoolean(max_downvotes_reached, "meta.max_downvotes_reached");

    return {
        author_name,
        author_filters: filters,
        viewer_blocked,
        realm_color,
        nsfw,
        max_downvotes_reached,
        ...rest,
    };
}

function parsePostEntries(raw: unknown) {
    if (!Array.isArray(raw)) {
        throw new Error("postレスポンスが不正です");
    }
    return raw.map(parsePostEntry);
}

function parsePostEntry(entry: unknown): PersonalFeedItem {
    if (!Array.isArray(entry) || entry.length !== 2) {
        throw new Error("post要素形式が不正です");
    }
    const [postRaw, metaRaw] = entry;
    return {
        post: toPost(postRaw),
        meta: toPostMeta(metaRaw),
    };
}

function parsePersonalFeed(raw: unknown) {
    return parsePostEntries(raw);
}

export type NotificationPayload = JsonRecord | string;

export type TaggrNotification = {
    id: number;
    payload: NotificationPayload;
    read: boolean;
};

export type TaggrUserProfile = {
    id: number;
    name: string;
    about: string;
    notifications: TaggrNotification[];
    [key: string]: unknown;
};

function parseNotifications(value: unknown): TaggrNotification[] {
    if (!isRecord(value)) {
        return [];
    }
    return Object.entries(value).map(([key, rawEntry]) => {
        const id = Number(key);
        if (Number.isNaN(id)) {
            throw new Error("notification ID が数値化できません");
        }
        if (!Array.isArray(rawEntry) || rawEntry.length !== 2) {
            throw new Error("notification 要素形式が不正です");
        }
        const [payload, readFlag] = rawEntry;
        assertBoolean(readFlag, "notification.read");
        if (payload !== null && typeof payload !== "string" && !isRecord(payload)) {
            throw new Error("notification payload が不正です");
        }
        return {
            id,
            payload: payload ?? {},
            read: readFlag,
        };
    });
}

function parseUserProfile(raw: unknown): TaggrUserProfile | null {
    if (raw === null) {
        return null;
    }
    if (!isRecord(raw)) {
        throw new Error("user レスポンスが不正です");
    }

    const { id, name, about, notifications, ...rest } = raw;
    assertFiniteNumber(id, "user.id");
    assertString(name, "user.name");
    assertString(about, "user.about");

    return {
        id,
        name,
        about,
        notifications: parseNotifications(notifications),
        ...rest,
    };
}

export async function fetchPersonalFeed({
    domain,
    page = 0,
    offset = 0,
}: {
    domain: string;
    page?: number;
    offset?: number;
}) {
    return queryJson(
        "personal_feed",
        [domain, page, offset],
        (data) => parsePersonalFeed(data),
    );
}

export async function fetchUserProfile({
    domain,
    handle,
}: {
    domain: string;
    handle?: string;
}) {
    const handleInput = handle ? [handle] : [];
    return queryJson("user", [domain, handleInput], (data) => parseUserProfile(data));
}

export async function fetchPostSummary(postId: number): Promise<PersonalFeedItem | null> {
    const posts = await queryJson("posts", [[postId]], (data) => parsePostEntries(data));
    return posts[0] ?? null;
}

export type CaptureSubmission = {
    url: string;
    notes?: string;
    realm?: string;
    html: string;
};

export type CaptureResult = {
    success: boolean;
    postId?: number | null;
    error?: string;
    mocked?: boolean;
};

const addPostArgsCodec = [
    IDL.Text,
    IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Nat8))),
    IDL.Opt(IDL.Nat64),
    IDL.Opt(IDL.Text),
    IDL.Opt(IDL.Vec(IDL.Nat8)),
];

const addPostResultCodec = IDL.Variant({
    Ok: IDL.Nat64,
    Err: IDL.Text,
});

export async function submitCapture(payload: CaptureSubmission): Promise<CaptureResult> {
    if (env.hostMissing || env.canisterMissing) {
        return {
            success: true,
            postId: null,
            mocked: true,
        };
    }
    const htmlBytes = new TextEncoder().encode(payload.html);
    if (htmlBytes.length === 0) {
        return { success: false, error: "HTMLが空のため保存できません" };
    }
    const attachments: [string, number[]][] = [
        ["capture", Array.from(htmlBytes)],
    ];
    const arg = IDL.encode(addPostArgsCodec, [
        formatCaptureBody(payload),
        attachments,
        [],
        payload.realm ? [payload.realm] : [],
        [],
    ]);

    try {
        const reply = await callUpdateRaw("add_post", arg);
        if (!reply || reply.length === 0) {
            return { success: true, postId: null };
        }
        const [result] = IDL.decode([addPostResultCodec], reply);
        if ("Ok" in result) {
            return { success: true, postId: Number(result.Ok) };
        }
        return { success: false, error: result.Err };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "capture failed",
        };
    }
}

function formatCaptureBody({ url, notes }: CaptureSubmission) {
    const trimmedNotes = notes?.trim();
    return [`Captured URL: ${url.trim()}`, trimmedNotes ? `Notes: ${trimmedNotes}` : null]
        .filter(Boolean)
        .join("\n\n");
}

export async function fetchCaptureContent(post: TaggrPost): Promise<{
    html: string;
    mocked: boolean;
}> {
    const descriptor = findCaptureDescriptor(post);
    if (!descriptor) {
        return {
            html: fallbackCaptureHtml(post.id),
            mocked: true,
        };
    }

    try {
        const url = buildBucketAssetUrl(descriptor.bucketId, descriptor.offset, descriptor.len);
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`bucket fetch failed (${response.status})`);
        }
        const html = await response.text();
        return { html, mocked: false };
    } catch (error) {
        console.error("capture fetch failed", error);
        return {
            html: fallbackCaptureHtml(post.id),
            mocked: true,
        };
    }
}

function findCaptureDescriptor(post: TaggrPost) {
    const files = post.files as Record<string, [number, number]> | undefined;
    if (!files) {
        return null;
    }
    for (const [key, value] of Object.entries(files)) {
        if (key.startsWith("capture@")) {
            const [, bucketId] = key.split("@");
            if (!bucketId || value.length < 2) {
                continue;
            }
            return { bucketId, offset: value[0], len: value[1] };
        }
    }
    return null;
}

function buildBucketAssetUrl(bucketId: string, offset: number, len: number) {
    const replaced = env.bucketTemplate.replace("{canister}", bucketId);
    const url = new URL(replaced);
    url.searchParams.set("offset", offset.toString());
    url.searchParams.set("len", len.toString());
    return url.toString();
}

function fallbackCaptureHtml(postId: number) {
    return `<!doctype html><html><head><style>body{font-family:system-ui;padding:40px;background:#f8fafc;color:#0f172a;}article{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 15px 50px rgba(15,23,42,0.08);}h1{font-size:24px;margin-bottom:16px;}p{line-height:1.6;margin-bottom:12px;}</style></head><body><article><h1>Gyotaku #${postId}</h1><p>魚拓HTMLがまだ保存されていないか取得に失敗しました。</p></article></body></html>`;
}
