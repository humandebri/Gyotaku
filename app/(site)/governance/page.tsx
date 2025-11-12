export default function GovernancePage() {
    return (
        <section className="card grid" style={{ gap: 16 }}>
            <p style={{ textTransform: "uppercase", color: "#38bdf8" }}>
                DAO / Governance
            </p>
            <h2>ガバナンスUI移植予定</h2>
            <p style={{ color: "#cbd5f5", lineHeight: 1.6 }}>
                旧React版で提供していた提案一覧・投票UIをここに段階移植します。
                まずはNext.jsでのレイアウトを固め、後続でIC APIを接続する予定です。
            </p>
        </section>
    );
}
