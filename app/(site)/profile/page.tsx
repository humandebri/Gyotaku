// /profile: ユーザープロフィールと魚拓メタ情報の概要を表示する。
import Link from "next/link";
import { fetchPersonalFeed, fetchUserProfile, type TaggrUserProfile } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";
import { parseCaptureMetadata, type CaptureMetadata } from "@/lib/capture-metadata";

export default async function ProfilePage() {
    const domain = getTaggrDomain();
    const [feedState, profileState] = await Promise.all([
        loadCaptureFeed(domain),
        loadProfile(domain),
    ]);

    const captures = feedState.items;
    const profile = profileState.profile;

    return (
        <section className="space-y-6">
            <div className="card space-y-2">
                <h2 className="text-2xl font-semibold">プロフィール</h2>
                {profile ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                            ユーザー名: <span className="text-foreground font-semibold">{profile.name}</span>
                        </div>
                        <div>投稿数: {profile.num_posts ?? "-"}</div>
                        <div>
                            フォロー/フォロワー: {profile.followees?.length ?? 0} / {profile.followers?.length ?? 0}
                        </div>
                        <div>クレジット: {profile.balance ?? 0}</div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {profileState.error ?? "プロフィール情報を取得できませんでした。"}
                    </p>
                )}
            </div>
            <div className="card">
                <h3 className="text-lg font-semibold">魚拓概況</h3>
                <p className="text-sm text-muted-foreground">
                    魚拓保存数: {captures.length}
                    {feedState.error && `（${feedState.error}）`}
                </p>
            </div>
            <div className="card">
                <h3 className="text-lg font-semibold">最近の魚拓</h3>
                <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                    {captures.slice(0, 5).map(({ postId, metadata }) => (
                        <li key={postId}>
                            <Link href={`/gyotaku/${postId}`} className="text-primary underline-offset-4 hover:underline">
                                {metadata!.url}
                            </Link>
                        </li>
                    ))}
                    {captures.length === 0 && <li>魚拓はまだありません。</li>}
                </ul>
            </div>
        </section>
    );
}

type CaptureEntry = {
    postId: number;
    metadata: CaptureMetadata;
};

type CaptureFeedState = {
    items: CaptureEntry[];
    error?: string;
};

async function loadCaptureFeed(domain: string): Promise<CaptureFeedState> {
    try {
        const items = await fetchPersonalFeed({ domain, page: 0, offset: 0 });
        const captures = items
            .map((item) => ({
                postId: item.post.id,
                metadata: parseCaptureMetadata(item.post.body),
            }))
            .filter((entry): entry is CaptureEntry => Boolean(entry.metadata));
        return { items: captures };
    } catch (error) {
        console.error("personal_feed fetch failed (profile)", error);
        return {
            items: [],
            error: "魚拓一覧を取得できませんでした",
        };
    }
}

type ProfileState = {
    profile: TaggrUserProfile | null;
    error?: string;
};

async function loadProfile(domain: string): Promise<ProfileState> {
    try {
        const profile = await fetchUserProfile({ domain });
        return { profile };
    } catch (error) {
        console.error("user profile fetch failed", error);
        return {
            profile: null,
            error: "プロフィールの取得に失敗しました。",
        };
    }
}
