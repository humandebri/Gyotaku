import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

const navItems: { href: Route; label: string }[] = [
    { href: "/", label: "ホーム" },
    { href: "/capture", label: "魚拓作成" },
    { href: "/archive", label: "魚拓一覧" },
    { href: "/governance", label: "ガバナンス" },
    { href: "/profile", label: "プロフィール" },
    { href: "/settings", label: "設定" },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "grid",
                gridTemplateRows: "auto 1fr",
                background: "#020617",
                color: "#e2e8f0",
            }}
        >
            <header
                style={{
                    borderBottom: "1px solid rgba(148,163,184,0.2)",
                    padding: "16px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <p style={{ fontSize: 12, margin: 0, color: "#38bdf8" }}>
                        Gyotaku
                    </p>
                    <h1 style={{ margin: 0, fontSize: 18 }}>魚拓ポータル</h1>
                </div>
                <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                textDecoration: "none",
                                color: "#f8fafc",
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>
            <main
                style={{
                    padding: "32px 24px 64px",
                    maxWidth: 1200,
                    width: "100%",
                    margin: "0 auto",
                }}
            >
                {children}
            </main>
        </div>
    );
}
