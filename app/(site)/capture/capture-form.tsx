"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type CaptureFormState = {
    status: "idle" | "success" | "error";
    message: string;
};

export default function CaptureForm({
    action,
    initialState,
}: {
    action: (state: CaptureFormState, formData: FormData) => Promise<CaptureFormState>;
    initialState: CaptureFormState;
}) {
    const [state, formAction] = useFormState(action, initialState);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">魚拓を作成</CardTitle>
                    <CardDescription>
                        URL を入力し、必要なら補足メモや Realm を指定してください。投稿は Taggr canister へ送信されます。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="url">
                                ソースURL
                            </label>
                            <input
                                id="url"
                                name="url"
                                type="url"
                                required
                                placeholder="https://example.com/article"
                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="notes">
                                メモ（任意）
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                placeholder="検証コメントや追記メモを残せます"
                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="realm">
                                Realm（任意）
                            </label>
                            <input
                                id="realm"
                                name="realm"
                                type="text"
                                placeholder="DAO / GYOTAKU など"
                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <FormStatusButton label="魚拓を送信" />
                    </form>
                </CardContent>
            </Card>
            {state.status !== "idle" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            {state.status === "success" ? "送信成功" : "エラー"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{state.message}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function FormStatusButton({ label }: { label: string }) {
    const status = useFormStatus();
    return (
        <Button type="submit" disabled={status.pending} className="w-full">
            {status.pending ? "送信中..." : label}
        </Button>
    );
}
