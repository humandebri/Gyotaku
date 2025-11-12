import { mockFeed } from "./data";

export default function HomePage() {
    return (
        <section style={{ display: "grid", gap: 24 }}>
            <div className="card">
                <p style={{ textTransform: "uppercase", color: "#38bdf8" }}>
                    Timeline
                </p>
                <h2 style={{ marginTop: 8 }}>魚拓＆投稿の最新状況</h2>
                <p style={{ color: "#cbd5f5", lineHeight: 1.6 }}>
                    ここでは Gyotaku Realm の魚拓保存やDAO投稿のサマリを先にNext.js上で再構成していきます。
                </p>
            </div>
            <div className="grid">
                {mockFeed.map((post) => (
                    <article key={post.id} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#94a3b8" }}>{post.capturedAt}</span>
                            <span style={{ color: "#38bdf8" }}>#{post.realm}</span>
                        </div>
                        <h3 style={{ marginTop: 12 }}>{post.title}</h3>
                        <p style={{ marginTop: 4, color: "#cbd5f5" }}>{post.excerpt}</p>
                        <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                            by {post.author}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
