export default function SettingsPage() {
    return (
        <section className="card grid" style={{ gap: 16 }}>
            <h2>設定（モック）</h2>
            <p style={{ color: "#cbd5f5" }}>
                Juno/Next構成で必要となる設定項目をここに集約します。アクセス制御や通知方法など、旧UIの
                Settings を段階的に移植予定です。
            </p>
        </section>
    );
}
