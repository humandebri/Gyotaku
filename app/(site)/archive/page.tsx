import Link from "next/link";
import { mockArchives } from "../data";

const statusColor: Record<string, string> = {
    verified: "#4ade80",
    pending: "#facc15",
    disputed: "#f87171",
};

export default function ArchiveIndexPage() {
    return (
        <section className="grid" style={{ gap: 24 }}>
            <div className="card">
                <p style={{ textTransform: "uppercase", color: "#38bdf8" }}>
                    Archive Registry
                </p>
                <h2 style={{ marginTop: 8 }}>魚拓一覧（モック）</h2>
                <p style={{ color: "#cbd5f5" }}>
                    ここでは Next.js 上で魚拓一覧画面を先行実装しています。実データと接続後はICから
                    `archive_meta` を引いて表示します。
                </p>
            </div>
            <div className="grid">
                {mockArchives.map((archive) => (
                    <article key={archive.id} className="card">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <span>#{archive.id}</span>
                            <span
                                style={{
                                    color: statusColor[archive.status],
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                }}
                            >
                                {archive.status}
                            </span>
                        </div>
                        <p style={{ marginTop: 12, fontSize: 14, color: "#94a3b8" }}>
                            {archive.capturedAt} / {archive.domain}
                        </p>
                        <Link
                            href={`/archive/${archive.id}`}
                            style={{ color: "#38bdf8", fontWeight: 500 }}
                        >
                            {archive.sourceUrl}
                        </Link>
                        <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                            merkleRoot: {archive.merkleRoot}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
