// /archive: Gyotaku魚拓一覧を Taggr feed から構築する。
import Link from "next/link";
import { fetchPersonalFeed } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";
import { parseCaptureMetadata, type CaptureMetadata } from "@/lib/capture-metadata";

export default async function ArchiveIndexPage() {
    const domain = getTaggrDomain();
    const captures = await loadCaptures(domain);

    return (
        <section className="space-y-6">
            <div className="card">
                <p className="text-xs uppercase tracking-[4px] text-primary">Archive Registry</p>
                <h2 className="mt-3 text-2xl font-semibold">魚拓一覧</h2>
                <p className="text-sm text-muted-foreground">
                    下記は Taggr canister から取得した最新の魚拓一覧です。各エントリをクリックすると魚拓の詳細ページへ遷移します。
                </p>
            </div>
            {captures.error ? (
                <div className="card text-sm text-muted-foreground">{captures.error}</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {captures.items.length === 0 ? (
                        <div className="card">
                            <p className="text-sm text-muted-foreground">魚拓がまだありません。</p>
                        </div>
                    ) : (
                        captures.items.map(({ postId, metadata, capturedAt }) => (
                            <article key={postId} className="card space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Gyotaku #{postId}</span>
                                    <span>{formatTimestamp(capturedAt)}</span>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[4px] text-slate-500">Source</p>
                                    <a
                                        href={metadata.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                                    >
                                        {metadata.url}
                                    </a>
                                </div>
                                <Link
                                    href={`/gyotaku/${postId}`}
                                    className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                                >
                                    詳細を見る
                                </Link>
                            </article>
                        ))
                    )}
                </div>
            )}
        </section>
    );
}

function formatTimestamp(timestamp?: number) {
    if (!timestamp) {
        return "";
    }
    try {
        return new Date(Number(timestamp / 1_000_000)).toLocaleString();
    } catch {
        return "";
    }
}

type ArchiveEntry = {
    postId: number;
    metadata: CaptureMetadata;
    capturedAt?: number;
};

type ArchiveState = {
    items: ArchiveEntry[];
    error?: string;
};

async function loadCaptures(domain: string): Promise<ArchiveState> {
    try {
        const items = await fetchPersonalFeed({ domain, page: 0, offset: 0 });
        const captures = items
            .map((item) => ({
                postId: item.post.id,
                metadata: parseCaptureMetadata(item.post.body),
                capturedAt: item.post.timestamp,
            }))
            .filter((entry): entry is ArchiveEntry => Boolean(entry.metadata));
        return { items: captures };
    } catch (error) {
        console.error("personal_feed fetch failed (archive)", error);
        return {
            items: [],
            error: "魚拓一覧を取得できませんでした。",
        };
    }
}
