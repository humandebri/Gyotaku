import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { mockArchives } from "../../data";

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const archive = mockArchives.find((a) => a.id === id);
    if (!archive) {
        return { title: "Archive not found" };
    }
    return {
        title: `Archive ${archive.id}`,
        description: `Captured ${archive.capturedAt} (${archive.domain})`,
    };
}

export async function generateStaticParams() {
    return mockArchives.map(({ id }) => ({ id }));
}

export default async function ArchiveDetail({ params }: PageProps) {
    const { id } = await params;
    const archive = mockArchives.find((a) => a.id === id);
    if (!archive) {
        notFound();
    }

    return (
        <section className="grid" style={{ gap: 24 }}>
            <div className="card">
                <p style={{ textTransform: "uppercase", color: "#38bdf8" }}>
                    Archive detail
                </p>
                <h2>{archive.id}</h2>
                <p style={{ color: "#cbd5f5" }}>
                    元URL: <a href={archive.sourceUrl}>{archive.sourceUrl}</a>
                </p>
                <p>Captured at: {archive.capturedAt}</p>
                <p>Domain: {archive.domain}</p>
                <p>Merkle root: {archive.merkleRoot}</p>
                <p>Status: {archive.status}</p>
            </div>
            <div className="grid">
                <article className="card">
                    <h3>スクリーンショット</h3>
                    <p style={{ color: "#94a3b8" }}>
                        Next.js 側で `/_next/static/` や bucket からファイル取得する実装を今後追加します。
                    </p>
                    <div
                        style={{
                            marginTop: 12,
                            height: 240,
                            borderRadius: 12,
                            background: "linear-gradient(135deg,#0f172a,#1d4ed8)",
                        }}
                    />
                </article>
                <article className="card">
                    <h3>Notary検証</h3>
                    <p style={{ color: "#94a3b8" }}>
                        `verify_archive` を叩いて結果を表示するUIをここに追加します。
                    </p>
                </article>
            </div>
        </section>
    );
}
