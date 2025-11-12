export default function ProfilePage() {
    return (
        <section className="grid" style={{ gap: 24 }}>
            <div className="card">
                <h2>プロフィール（モック）</h2>
                <p style={{ color: "#cbd5f5" }}>
                    DID: <code>aaaa-bbbb-cccc</code>
                </p>
                <p>魚拓保存数: 42</p>
                <p>Realm: gyotaku / dao</p>
            </div>
            <div className="card">
                <h3>今後の計画</h3>
                <ul>
                    <li>IC Identity連携とセッション管理</li>
                    <li>魚拓履歴・クレジット残高の表示</li>
                </ul>
            </div>
        </section>
    );
}
