import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Gyotaku Portal",
    description:
        "Immutable capture previews for social posts, tailored for X/Twitter drops.",
    metadataBase: new URL("https://gyotaku.app"),
    openGraph: {
        title: "Gyotaku Portal",
        description:
            "Create link previews that mirror the original post — especially for X.",
        url: "https://gyotaku.app",
        siteName: "Gyotaku Portal",
        images: [
            {
                url: "/og-placeholder.svg",
                width: 1200,
                height: 630,
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ja">
            <head>
                <meta name="mark" content="OG" />
            </head>
            <body>{children}</body>
        </html>
    );
}
