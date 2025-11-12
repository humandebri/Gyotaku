"use client";

import Link from "next/link";
import { useState } from "react";

type SourceSummary = {
    url: string;
    title: string;
    platform: "x" | "generic";
};

export default function Page() {
    const [preview, setPreview] = useState<SourceSummary | null>(null);

    const handleProbe = (formData: FormData) => {
        const target = String(formData.get("url") || "").trim();
        if (!target) return;
        const isX = /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\//i.test(
            target,
        );
        setPreview({
            url: target,
            platform: isX ? "x" : "generic",
            title: isX ? "X mirror preview (予定)" : "汎用リンクプレビュー",
        });
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                padding: "48px 16px",
            }}
        >
            <div className="grid" style={{ maxWidth: 720, width: "100%" }}>
                <section className="card grid">
                    <div>
                        <p style={{ textTransform: "uppercase", color: "#38bdf8" }}>
                            Gyotaku × Juno
                        </p>
                        <h1 style={{ marginTop: 8, marginBottom: 16 }}>
                            Next.js + Juno Hosting
                        </h1>
                        <p style={{ lineHeight: 1.6, color: "#cbd5f5" }}>
                            このポータルはJunoのSatelliteで静的配信する前提で構築されています。
                            右のパネルでは、X（旧Twitter）リンクを魚拓として保存した際に、
                            カードプレビューをXライクに調整する要件を検証できます。
                        </p>
                    </div>
                    <div>
                        <form action={handleProbe} className="grid" style={{ gap: 8 }}>
                            <label htmlFor="url">魚拓したいURL</label>
                            <input
                                id="url"
                                name="url"
                                placeholder="https://x.com/username/status/..."
                                required
                                style={{
                                    borderRadius: 10,
                                    border: "1px solid rgba(148,163,184,0.4)",
                                    padding: "12px 14px",
                                    background: "rgba(15,23,42,0.35)",
                                    color: "inherit",
                                }}
                            />
                            <button className="cta-button" type="submit">
                                プレビュー判定
                            </button>
                        </form>
                    </div>
                </section>

                <section className="card grid">
                    <h2 style={{ margin: 0 }}>プレビュー結果</h2>
                    {!preview && (
                        <p style={{ color: "#94a3b8" }}>
                            まだURLが入力されていません。Xリンクを入力すると、X特化レイアウトで
                            OGタグを構成するモードに切り替わることを確認できます。
                        </p>
                    )}
                    {preview && (
                        <div
                            style={{
                                borderRadius: 20,
                                border: "1px solid rgba(148,163,184,0.2)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: 180,
                                    background:
                                        preview.platform === "x"
                                            ? "linear-gradient(135deg,#0f172a,#1d4ed8)"
                                            : "linear-gradient(135deg,#0f172a,#0f766e)",
                                }}
                            />
                            <div style={{ padding: 16, background: "#0b1120" }}>
                                <p
                                    style={{
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: 1.2,
                                        color: "#94a3b8",
                                    }}
                                >
                                    {preview.platform === "x"
                                        ? "X-Like Preview"
                                        : "Generic Preview"}
                                </p>
                                <h3 style={{ margin: "4px 0 8px" }}>{preview.title}</h3>
                                <Link
                                    href={preview.url}
                                    target="_blank"
                                    style={{ color: "#38bdf8" }}
                                >
                                    {preview.url}
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
