// Taggr heritage landing page focused on a light, layered Gyotaku aesthetic.
import { mockFeed, mockArchives } from "./data";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    fetchPersonalFeed,
    type PersonalFeedItem,
    type TaggrUserFilter,
} from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

type LegacyUtility = {
    title: string;
    description: string;
};

type SectionIntroProps = {
    eyebrow: string;
    title: string;
    description: string;
    className?: string;
};

type PersonalFeedState = {
    items: PersonalFeedItem[];
    isMock: boolean;
};

export default async function HomePage() {
    const legacyUtilities: LegacyUtility[] = [
        {
            title: "Inbox",
            description: "Taggrの通知センター。Gyotakuに移行しても既存のフローを踏襲します。",
        },
        {
            title: "Bookmarks",
            description: "魚拓と投稿を混在させた保存箱。今後は検証結果も紐付け予定。",
        },
        {
            title: "DAO / Proposals",
            description:
                "Rust backend上のガバナンス機能は現存しているため、UIだけ整えればすぐ復活できます。",
        },
    ];

    const domain = getTaggrDomain();
    const feedState = await getPersonalFeed(domain);

    return (
        <main className="mx-auto max-w-6xl space-y-24 px-6 py-16 lg:px-8">
            <HeroCard />
            <FeedSection domain={domain} feed={feedState} />
            <ArchiveSection />
            <LegacyUtilities utilities={legacyUtilities} />
        </main>
    );
}

function HeroCard() {
    return (
        <Card className="relative overflow-hidden border border-slate-200/80 p-12 shadow-md shadow-slate-900/10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/40" />
            <CardContent className="relative space-y-8">
                <p className="text-sm font-semibold uppercase tracking-[6px] text-primary/80">
                    Taggr heritage
                </p>
                <h2 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                    ソーシャル機能とGyotakuの良いところを両立
                </h2>
                <p className="text-base leading-loose text-muted-foreground max-w-3xl">
                    Rust製 canister は旧Taggrの投稿・フォロー・DAO・ウォレット機能を保持したままです。
                    Next.js 側の UI を段階的に再構築することで、既存ユーザーが違和感なく魚拓モードへ移行できるようにします。
                </p>
                <div className="flex flex-wrap gap-4">
                    <Button className="px-6 py-2 text-sm shadow-sm shadow-primary/20">
                        Gyotakuを作成
                    </Button>
                    <Button className="px-6 py-2 text-sm" variant="outline">
                        機能の移植状況
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function FeedSection({
    domain,
    feed,
}: {
    domain: string;
    feed: PersonalFeedState;
}) {
    return (
        <section className="space-y-10">
            <SectionIntro
                eyebrow="Timeline"
                title="Gyotakuジャンルの要約をフォローアップ"
                description="リアルタイムフィードの復帰前に、旧Taggrのキューを魚拓ワークフローへ取り込みます。"
            />
            <div className="grid gap-8 md:grid-cols-2">
                {feed.items.length === 0 ? (
                    <Card className="p-8">
                        <CardHeader>
                            <CardTitle className="text-xl text-foreground">
                                まだフィードがありません
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base leading-relaxed">
                                {domain} の personal_feed から投稿を取得できませんでした。後ほど再試行してください。
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    feed.items.map(({ post, meta }) => (
                        <Link key={`${post.id}-${meta.author_name}`} href={`/gyotaku/${post.id}`} className="block">
                            <Card className="flex h-full flex-col gap-2 p-8">
                                <CardHeader className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl text-foreground">
                                            {truncate(post.body)}
                                        </CardTitle>
                                        <span className="text-sm font-medium text-primary">
                                            {post.realm ? `ジャンル: ${post.realm}` : `ジャンル: ${domain}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">by {meta.author_name}</p>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <p className="text-base leading-relaxed text-muted-foreground">
                                        {summarizePost(post.body)}
                                    </p>
                                    <Separator />
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                        <span>{formatTimestamp(post.timestamp)}</span>
                                        <span className="tracking-wide">
                                            {feed.isMock ? "Mock capture" : "Gyotaku capture"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );
}

function ArchiveSection() {
    return (
        <section className="space-y-10">
            <SectionIntro
                eyebrow="Immutable archives"
                title="魚拓ストレージのレイヤーを追跡"
                description="Rust backendに保存された魚拓データを、新しいUIで段階的に再描画します。"
                className="max-w-3xl"
            />
            <div className="grid gap-8 md:grid-cols-3">
                {mockArchives.map((archive) => (
                    <Card key={archive.id} className="flex h-full flex-col justify-between p-8">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-lg text-foreground">
                                <span>{archive.domain}</span>
                                <span
                                    className="text-xs font-semibold tracking-wide"
                                    style={{ color: statusColor(archive.status) }}
                                >
                                    {archive.status.toUpperCase()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p className="line-clamp-2 break-all leading-relaxed">
                                {archive.sourceUrl}
                            </p>
                            <Separator />
                            <div className="text-xs leading-relaxed">
                                captured {archive.capturedAt}
                                <br />
                                merkle {archive.merkleRoot}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function LegacyUtilities({ utilities }: { utilities: LegacyUtility[] }) {
    return (
        <section className="space-y-10">
            <SectionIntro
                eyebrow="Legacy utilities"
                title="既存Taggr機能の移植ラインナップ"
                description="fish-inboxやDAOなどの主要機能を段階的にUIへ呼び戻すためのロードマップです。"
                className="max-w-2xl"
            />
            <div className="grid gap-8 md:grid-cols-3">
                {utilities.map((utility) => (
                    <Card key={utility.title} className="flex h-full flex-col gap-4 p-8">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-[4px] text-slate-500">
                                {utility.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base leading-relaxed">
                                {utility.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function SectionIntro({ eyebrow, title, description, className }: SectionIntroProps) {
    const classes = className ? `space-y-4 ${className}` : "space-y-4";
    return (
        <div className={classes}>
            <p className="text-xs font-semibold uppercase tracking-[6px] text-slate-500">
                {eyebrow}
            </p>
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="text-base leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

async function getPersonalFeed(domain: string): Promise<PersonalFeedState> {
    try {
        const items = await fetchPersonalFeed({ domain, page: 0, offset: 0 });
        return {
            items,
            isMock: false,
        };
    } catch (error) {
        console.error("personal_feed fetch failed", error);
        return {
            items: buildMockPersonalFeed(),
            isMock: true,
        };
    }
}

function buildMockPersonalFeed(): PersonalFeedItem[] {
    const fallbackFilter: TaggrUserFilter = {
        age_days: 0,
        safe: true,
        balance: 0,
        num_followers: 0,
    };
    return mockFeed.map((entry, index) => ({
        post: {
            id: index,
            body: entry.excerpt,
            user: index,
            tags: [entry.realm],
            realm: entry.realm,
            timestamp: Date.parse(entry.capturedAt) || undefined,
        },
        meta: {
            author_name: entry.author,
            author_filters: fallbackFilter,
            viewer_blocked: false,
            realm_color: null,
            nsfw: false,
            max_downvotes_reached: false,
        },
    }));
}

function truncate(content: string, length = 60) {
    return content.length > length ? `${content.slice(0, length)}…` : content;
}

function summarizePost(content: string, length = 200) {
    const normalized = content.replace(/\s+/g, " ").trim();
    return normalized.length > length ? `${normalized.slice(0, length)}…` : normalized;
}

function formatTimestamp(timestamp?: number) {
    if (!timestamp) {
        return "captured recently";
    }
    try {
        const value = Number(timestamp);
        const millis = value > 1_000_000_000_000 ? value / 1_000_000 : value;
        return new Date(millis).toLocaleString();
    } catch (error) {
        console.error("timestamp parse failed", error);
        return "captured";
    }
}

function statusColor(status: string) {
    switch (status) {
        case "verified":
            return "#4ade80";
        case "pending":
            return "#facc15";
        case "disputed":
            return "#f87171";
        default:
            return "#cbd5f5";
    }
}
