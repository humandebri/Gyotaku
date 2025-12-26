import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-sans",
});

const notoSerif = Noto_Serif_JP({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-serif",
});

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
        <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable}`}>
            <head>
                <meta name="mark" content="OG" />
            </head>
            <body>{children}</body>
        </html>
    );
}
