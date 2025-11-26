import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchPostSummary, fetchThread, submitTextPost } from "@/lib/taggr-client";
import { CommentForm } from "@/components/forms/comment-form";

const initialState = { status: "idle", message: "" } as const;

async function createComment(
    _prevState: typeof initialState,
    formData: FormData,
    postId: number,
) {
    "use server";
    const body = (formData.get("body") ?? "").toString();
    const result = await submitTextPost({ body, parent: postId });
    if (!result.success) {
        return {
            status: "error",
            message: result.error ?? "コメント送信に失敗しました",
        } as const;
    }
    return {
        status: "success",
        message: "コメントを送信しました",
    } as const;
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
    const postId = Number(params.id);
    if (Number.isNaN(postId) || postId <= 0) {
        notFound();
    }
    const summary = await fetchPostSummary(postId);
    if (!summary) {
        notFound();
    }
    const thread = await fetchThread(postId);

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Post #{postId}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {summary.post.body}
                    </div>
                    <Separator />
                    <Link href="/feed" className="text-sm text-primary underline-offset-4 hover:underline">フィードへ戻る</Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">コメント</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {thread.length === 0 && (
                        <p className="text-sm text-muted-foreground">コメントはまだありません。</p>
                    )}
                    {thread.map(({ post, meta }) => (
                        <article key={post.id} className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                            <div className="text-xs text-slate-500">{meta.author_name} / #{post.id}</div>
                            <p className="whitespace-pre-wrap">{post.body}</p>
                        </article>
                    ))}
                    <Separator />
                    <CommentForm
                        action={(state, formData) => createComment(state, formData, postId)}
                        initialState={initialState}
                    />
                </CardContent>
            </Card>
        </section>
    );
}
