import { redirect } from "next/navigation";
import { submitTextPost } from "@/lib/taggr-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const initialState = { status: "idle", message: "" } as const;
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

async function createPost(_prevState: typeof initialState, formData: FormData) {
    "use server";
    const body = (formData.get("body") ?? "").toString();
    const realm = (formData.get("realm") ?? "").toString().trim();
    const visibility = (formData.get("visibility") ?? "public").toString().trim();
    const priceRaw = (formData.get("price") ?? "").toString().trim();
    const price = priceRaw ? Number(priceRaw) : undefined;
    if (priceRaw && (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price))) {
        return {
            status: "error",
            message: "有料価格は1以上の整数で入力してください。",
        } as const;
    }
    if (visibility === "paid" && !price) {
        return {
            status: "error",
            message: "有料にする場合は価格を入力してください。",
        } as const;
    }
    const result = await submitTextPost({
        body,
        realm: realm || undefined,
        visibility: visibility || "public",
        price: visibility === "paid" ? price : undefined,
    });
    if (result.success && result.postId) {
        redirect(`/post/${result.postId}`);
    }
    return {
        status: result.success ? "success" : "error",
        message: result.error ?? "投稿を送信しました。",
    } as const;
}

export default function NewPostPage() {
    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">新規投稿</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createPost} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" htmlFor="body">
                                本文
                            </label>
                            <textarea
                                id="body"
                                name="body"
                                rows={8}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" htmlFor="realm">
                                ジャンル (任意)
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
                            <label className="text-sm font-semibold" htmlFor="visibility">
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
                            <label className="text-sm font-semibold" htmlFor="price">
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
                        <Button type="submit">投稿する</Button>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
