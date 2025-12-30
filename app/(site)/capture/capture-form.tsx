"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type CaptureFormState = {
    status: "idle" | "success" | "error";
    message: string;
};

const GENRE_OPTIONS = [
    { value: "", label: "ジャンルを選択（任意）" },
    { value: "news", label: "ニュース" },
    { value: "politics", label: "政治・社会" },
    { value: "business", label: "ビジネス" },
    { value: "tech", label: "テクノロジー" },
    { value: "culture", label: "カルチャー" },
    { value: "life", label: "ライフスタイル" },
];
const VISIBILITY_OPTIONS = [
    { value: "public", label: "公開" },
    { value: "followers_only", label: "フォロワー限定" },
    { value: "paid", label: "有料" },
    { value: "draft", label: "下書き" },
];

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
                        URL を入力し、必要なら補足メモやジャンルを指定してください。投稿は Taggr canister へ送信されます。
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
                                className="form-input"
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
                                className="form-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="realm">
                                ジャンル（任意）
                            </label>
                            <select id="realm" name="realm" className="form-input">
                                {GENRE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="visibility">
                                公開範囲
                            </label>
                            <select
                                id="visibility"
                                name="visibility"
                                className="form-input"
                                defaultValue="public"
                            >
                                {VISIBILITY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="price">
                                有料価格（クレジット）
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min={1}
                                step={1}
                                placeholder="有料時のみ入力"
                                className="form-input"
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
