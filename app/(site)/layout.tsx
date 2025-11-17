import type { ReactNode } from "react";
import { TaggrNavigationBar, TaggrSidebar } from "./taggr-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <TaggrNavigationBar />
            <div className="flex min-h-[calc(100vh-72px)]">
                <TaggrSidebar>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs tracking-[3px] text-muted-foreground">
                                DEPLOYMENT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-semibold">Console</p>
                            <a
                                href="http://localhost:5866"
                                className="text-sm text-primary hover:underline"
                            >
                                localhost:5866
                            </a>
                            <p className="text-xs text-muted-foreground">
                                Mission Control (Skylab)
                            </p>
                        </CardContent>
                    </Card>
                </TaggrSidebar>
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}
