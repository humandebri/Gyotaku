// /history: 最近の魚拓リンクをTaggr feedから取得し履歴表示する。
import Link from "next/link";
import { fetchPersonalFeed, type PersonalFeedItem } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

export default async function HistoryPage() {
    const domain = getTaggrDomain();
    const feed = await loadFeed(domain);

    return (
        <section className="space-y-6">
            <div className="card">
                <h2 className="text-2xl font-semibold">履歴</h2>
                <p className="text-sm text-muted-foreground">最近の魚拓やアクションの履歴をここに表示します。</p>
            </div>
            <div className="card space-y-2">
                <h3 className="text-lg font-semibold">最近の魚拓</h3>
                {feed.error ? (
                    <p className="text-sm text-muted-foreground">{feed.error}</p>
                ) : (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {feed.items.slice(0, 10).map((entry) => (
                            <li key={entry.post.id}>
                                <Link
                                    href={`/gyotaku/${entry.post.id}`}
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    Gyotaku #{entry.post.id}
                                </Link>
                            </li>
                        ))}
                        {feed.items.length === 0 && <li>魚拓はまだありません。</li>}
                    </ul>
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
        console.error("personal_feed fetch failed (history)", error);
        return {
            items: [],
            error: "履歴を取得できませんでした。",
        };
    }
}
