// /governance: 提案UIのモックとして feed を解析する。
import { fetchPersonalFeed } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";
import { parseCaptureMetadata, type CaptureMetadata } from "@/lib/capture-metadata";

export default async function GovernancePage() {
    const domain = getTaggrDomain();
    const proposals = await loadProposals(domain);

    return (
        <section className="space-y-6">
            <div className="card">
                <p className="text-xs uppercase tracking-[4px] text-primary">DAO / Governance</p>
                <h2 className="text-2xl font-semibold">ガバナンス提案 (モック)</h2>
                <p className="text-sm text-muted-foreground">
                    旧版で提供していた提案一覧・投票UIを再構築しています。まずは魚拓のメタデータを使って提案の存在を示します。
                </p>
            </div>
            {proposals.error ? (
                <div className="card">
                    <p className="text-sm text-muted-foreground">{proposals.error}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {proposals.items.length === 0 ? (
                        <div className="card">
                            <p className="text-sm text-muted-foreground">提案が見つかりませんでした。</p>
                        </div>
                    ) : (
                        proposals.items.map(({ postId, metadata, title }) => (
                            <article key={postId} className="card space-y-2">
                                <h3 className="text-lg font-semibold">{title}</h3>
                                <p className="text-sm text-muted-foreground">提案魚拓: {metadata.url}</p>
                            </article>
                        ))
                    )}
                </div>
            )}
        </section>
    );
}

type ProposalEntry = {
    postId: number;
    metadata: CaptureMetadata;
    title: string;
};

type ProposalState = {
    items: ProposalEntry[];
    error?: string;
};

async function loadProposals(domain: string): Promise<ProposalState> {
    try {
        const items = await fetchPersonalFeed({ domain, page: 0, offset: 0 });
        const proposals = items
            .map((item) => ({
                postId: item.post.id,
                metadata: parseCaptureMetadata(item.post.body),
                title: item.post.body.split("\n")[0],
            }))
            .filter((entry): entry is ProposalEntry => Boolean(entry.metadata));
        return { items: proposals };
    } catch (error) {
        console.error("personal_feed fetch failed (governance)", error);
        return {
            items: [],
            error: "提案一覧を取得できませんでした。",
        };
    }
}
