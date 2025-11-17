// Inbox screen renders Taggr notifications fetched via the canister client.
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    fetchUserProfile,
    type TaggrNotification,
} from "@/lib/taggr-client";
import { getTaggrDomain } from "@/lib/taggr-config";

type InboxState = {
    notifications: TaggrNotification[];
    isMock: boolean;
    message: string;
};

export default async function InboxPage() {
    const domain = getTaggrDomain();
    const inbox = await loadInboxState(domain);

    return (
        <main className="mx-auto max-w-4xl space-y-12 px-6 py-16 lg:px-8">
            <header className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[6px] text-slate-500">
                    Inbox
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    通知センター
                </h1>
                <p className="text-base leading-relaxed text-muted-foreground">
                    {inbox.message}
                </p>
            </header>
            <section className="space-y-4">
                {inbox.notifications.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {inbox.isMock ? "通知はモックデータです" : "通知はありません"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                {inbox.isMock
                                    ? "サインイン後にTaggrアカウントへ紐づく通知が表示されます。"
                                    : "最新の通知は届いていません。"}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    inbox.notifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            isMock={inbox.isMock}
                        />
                    ))
                )}
            </section>
        </main>
    );
}

function NotificationCard({
    notification,
    isMock,
}: {
    notification: TaggrNotification;
    isMock: boolean;
}) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[4px] text-slate-500">
                        Notification #{notification.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {notification.read ? "既読" : "未読"}
                    </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                    {isMock ? "Mock" : "Clear"}
                </Button>
            </div>
            <Separator className="my-4" />
            <p className="text-base leading-relaxed text-foreground">
                {formatNotificationPayload(notification.payload)}
            </p>
        </Card>
    );
}

function formatNotificationPayload(payload: TaggrNotification["payload"]) {
    if (typeof payload === "string") {
        return payload;
    }
    if (payload && typeof payload === "object") {
        try {
            return JSON.stringify(payload);
        } catch (error) {
            console.error("notification payload stringify failed", error);
            return "通知内容を表示できません";
        }
    }
    return "通知内容なし";
}

async function loadInboxState(domain: string): Promise<InboxState> {
    try {
        const profile = await fetchUserProfile({ domain });
        if (!profile) {
            return {
                notifications: [],
                isMock: true,
                message: "サインインしていないため通知は取得できません。",
            };
        }
        return {
            notifications: profile.notifications,
            isMock: false,
            message: `${profile.name} の通知履歴を表示しています。`,
        };
    } catch (error) {
        console.error("user profile fetch failed", error);
        return {
            notifications: buildMockNotifications(),
            isMock: true,
            message: "通知APIの取得に失敗したためモックデータを表示します。",
        };
    }
}

function buildMockNotifications(): TaggrNotification[] {
    return [
        {
            id: 1,
            payload: "DAO提案に関する最新アラート",
            read: false,
        },
        {
            id: 2,
            payload: {
                type: "follow",
                message: "@observer があなたをフォローしました",
            },
            read: true,
        },
    ];
}
