"use client";

import Link from "next/link";
import { useState } from "react";

type SourceSummary = {
    url: string;
    title: string;
    platform: "x" | "generic";
};

export default function CapturePage() {
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
        <section className="grid" style={{ gap: 24 }}>
            <div className="card grid">
                <div>
                    <p style={{ textTransform: "uppercase", color: "#38bdf8" }}>
                        Gyotaku × Juno
                    </p>
                    <h2>魚拓作成ワークフロー</h2>
                    <p style={{ color: "#cbd5f5", lineHeight: 1.6 }}>
                        X（旧Twitter）などのリンクを貼り付け、魚拓保存時のプレビュー挙動をテストします。
                        実装が進めばここから canister API を呼び出すフローに置き換えます。
                    </p>
                </div>
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
            <section className="card grid">
                <h3 style={{ margin: 0 }}>プレビュー結果</h3>
                {!preview && (
                    <p style={{ color: "#94a3b8" }}>
                        まだURLが入力されていません。Xリンクを入力すると X 特化レイアウトに切り替わるかを確認できます。
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
                            <h4 style={{ margin: "4px 0 8px" }}>{preview.title}</h4>
                            <a
                                href={preview.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#38bdf8" }}
                            >
                                {preview.url}
                            </a>
                        </div>
                    </div>
                )}
            </section>
        </section>
    );
}
