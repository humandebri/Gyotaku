import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchUserProfile } from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

type NavItem = {
    label: string;
    description: string;
    href: Route;
};

const primaryNav: NavItem[] = [
    { label: "HOME", description: "Landing", href: "/" },
    { label: "FEED", description: "Posts & comments", href: "/feed" },
    { label: "CAPTURE", description: "New gyotaku", href: "/capture" },
    { label: "ARCHIVE", description: "Immutable records", href: "/archive" },
    { label: "GOVERNANCE", description: "DAO & proposals", href: "/governance" },
];

const utilityNav: NavItem[] = [
    { label: "INBOX", description: "Notifications", href: "/inbox" },
    { label: "PROFILE", description: "Identity & wallet", href: "/profile" },
    { label: "SETTINGS", description: "Preferences", href: "/settings" },
    { label: "HISTORY", description: "Activity log", href: "/history" },
    { label: "WALLET", description: "Credits", href: "/wallet" },
];

export async function TaggrNavigationBar() {
    const domain = getTaggrDomain();
    let profile = null;
    try {
        profile = await fetchUserProfile({ domain });
    } catch (error) {
        console.warn("failed to load profile for navbar", error);
    }
    return (
        <header className="border-b border-border/50 bg-background/70 px-10 py-6 backdrop-blur">
            <div className="flex items-center justify-between gap-6">
                <div>
                    <p className="text-[10px] uppercase tracking-[6px] text-muted-foreground">
                        TAGGR
                    </p>
                    <h1 className="text-lg font-semibold tracking-wide">
                        Gyotaku Edition
                    </h1>
                </div>
                <nav className="flex flex-wrap gap-4 text-xs font-semibold tracking-[2px] text-muted-foreground">
                    {primaryNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-muted-foreground transition hover:text-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-full">
                        Sign In
                    </Button>
                    <Link href="/inbox" className="text-xs text-muted-foreground">
                        Notifications ({profile?.notifications?.length ?? 0})
                    </Link>
                    <Link href="/post/new" className="rounded-full">
                        <Button size="sm" className="rounded-full">Post</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export function TaggrSidebar({ children }: { children: ReactNode }) {
    return (
        <aside className="hidden w-72 border-r border-border/40 bg-background/40 px-6 py-8 md:flex md:flex-col md:gap-6">
            <SectionTitle>Quick Access</SectionTitle>
            <div className="space-y-3">
                {utilityNav.map((item) => (
                    <Card key={item.href}>
                        <CardHeader>
                            <CardTitle className="text-sm tracking-wide">
                                {item.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs text-muted-foreground">
                            <p>{item.description}</p>
                            <Separator />
                            <Link
                                href={item.href}
                                className="text-xs font-semibold text-primary"
                            >
                                Open
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {children}
        </aside>
    );
}

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <p className="text-[10px] uppercase tracking-[6px] text-muted-foreground">
            {children}
        </p>
    );
}
