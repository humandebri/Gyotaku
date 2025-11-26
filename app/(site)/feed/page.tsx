// /feed: Taggr personal feed を取得し Gyotaku UI で一覧表示する。
import Link from "next/link";
import { fetchPersonalFeed, type PersonalFeedItem } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

export default async function FeedPage() {
    const domain = getTaggrDomain();
    const feed = await loadFeed(domain);
    return (
        <section className="space-y-6">
            <div className="card">
                <h2 className="text-2xl font-semibold">Taggrフィード</h2>
                <p className="text-sm text-muted-foreground">最新の魚拓や投稿を一覧します。</p>
            </div>
            <div className="space-y-4">
                {feed.error ? (
                    <div className="card text-sm text-muted-foreground">{feed.error}</div>
                ) : feed.items.length === 0 ? (
                    <div className="card text-sm text-muted-foreground">フィードがまだありません。</div>
                ) : (
                    feed.items.map(({ post, meta }) => (
                        <article key={post.id} className="card space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{meta.author_name}</span>
                                <span>#{post.id}</span>
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {post.body.slice(0, 200)}
                            </div>
                            <Link
                                href={`/post/${post.id}`}
                                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                            >
                                詳細を表示
                            </Link>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}

type FeedState = {
    items: PersonalFeedItem[];
    error?: string;
};

async function loadFeed(domain: string): Promise<FeedState> {
    try {
        const items = await fetchPersonalFeed({ domain, page: 0, offset: 0 });
        return { items };
    } catch (error) {
        console.error("personal_feed fetch failed", error);
        return {
            items: [],
            error: "フィードを取得できませんでした。後ほど再試行してください。",
        };
    }
}
