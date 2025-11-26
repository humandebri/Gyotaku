import { fetchUserProfile } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

export default async function SettingsPage() {
    const domain = getTaggrDomain();
    const profile = await fetchUserProfile({ domain });

    return (
        <section className="space-y-6">
            <div className="card space-y-2">
                <h2 className="text-2xl font-semibold">設定</h2>
                {profile ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                            ユーザー名: <span className="text-foreground font-semibold">{profile.name}</span>
                        </div>
                        <div>通知数: {profile.notifications?.length ?? 0}</div>
                        <div>フォロー中: {profile.followees?.length ?? 0}</div>
                        <div>フォロワー: {profile.followers?.length ?? 0}</div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">プロフィール情報を取得できませんでした。</p>
                )}
            </div>
            <div className="card">
                <h3 className="text-lg font-semibold">今後の設定項目</h3>
                <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                    <li>通知設定 (Inboxや提案の更新)</li>
                    <li>セキュリティ設定 (デバイス、認証方法)</li>
                    <li>表示設定 (テーマ、言語)</li>
                </ul>
            </div>
        </section>
    );
}
