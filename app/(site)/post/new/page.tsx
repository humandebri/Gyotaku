import { redirect } from "next/navigation";
import { submitTextPost } from "@/lib/taggr-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const initialState = { status: "idle", message: "" } as const;

async function createPost(_prevState: typeof initialState, formData: FormData) {
    "use server";
    const body = (formData.get("body") ?? "").toString();
    const realm = (formData.get("realm") ?? "").toString().trim();
    const result = await submitTextPost({ body, realm: realm || undefined });
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
                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" htmlFor="realm">
                                Realm (任意)
                            </label>
                            <input
                                id="realm"
                                name="realm"
                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <Button type="submit">投稿する</Button>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
