import { fetchUserProfile } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

export default async function WalletPage() {
    const domain = getTaggrDomain();
    const profile = await fetchUserProfile({ domain });

    return (
        <section className="space-y-6">
            <div className="card">
                <h2 className="text-2xl font-semibold">ウォレット</h2>
                {profile ? (
                    <p className="text-sm text-muted-foreground">残高: {profile.balance ?? 0}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">ウォレット情報を取得できませんでした。</p>
                )}
            </div>
            <div className="card">
                <h3 className="text-lg font-semibold">今後の計画</h3>
                <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                    <li>クレジット残高・履歴の表示</li>
                    <li>トークン送受信 UI</li>
                </ul>
            </div>
        </section>
    );
}
