import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchPostSummary, fetchCaptureContent, purchasePost } from "@/lib/taggr-client";
import { parseCaptureMetadata } from "@/lib/capture-metadata";

export default async function GyotakuDetailPage({
    params,
 }: {
    params: { id: string };
}) {
    const postId = Number(params.id);
    if (Number.isNaN(postId) || postId <= 0) {
        notFound();
    }

    const summary = await fetchPostSummary(postId);
    if (!summary) {
        notFound();
    }

    const capture = await fetchCaptureContent(postId);
    const metadata = parseCaptureMetadata(summary.post.body);
    const visibility = summary.post.access?.visibility ?? "public";
    const price = summary.post.access?.price;
    const viewerCanView = summary.meta.viewer_can_view ?? visibility === "public";
    const viewerHasPurchased = summary.meta.viewer_has_purchased ?? false;

    async function purchaseAccess() {
        "use server";
        await purchasePost(postId);
    }

    return (
        <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8">
            <header className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[6px] text-slate-500">
                    Gyotaku #{postId}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {summary.meta.author_name} の魚拓
                </h1>
                <p className="text-base leading-relaxed text-muted-foreground">
                    Post は魚拓のメタデータ、下部の iframe が実際のレイアウトを描画します。
                </p>
            </header>
            <section className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">概要</CardTitle>
                        <CardDescription>
                            Taggr canister から取得した投稿本文・タグをまとめています。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <article className="space-y-3">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                {summary.post.body}
                            </p>
                            <Separator />
                            <div className="text-xs text-slate-500">
                                <div>ジャンル: {summary.post.realm ?? "N/A"}</div>
                                <div>関連タグ: {summary.post.tags.join(", ") || "N/A"}</div>
                            </div>
                        </article>
                        <Link
                            href="/"
                            className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                        >
                            フィードへ戻る
                        </Link>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl">魚拓本文</CardTitle>
                        {capture.mocked && (
                            <CardDescription>
                                実際の保存先との接続が整うまではモックHTMLを表示しています。
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        {visibility === "paid" && !viewerCanView && (
                            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                                <p>この魚拓は有料コンテンツです。</p>
                                {price ? <p className="mt-2">価格: {price} クレジット</p> : null}
                                <form action={purchaseAccess} className="mt-4">
                                    <Button className="w-full" type="submit">
                                        購入して閲覧する
                                    </Button>
                                </form>
                            </div>
                        )}
                        {visibility === "paid" && viewerHasPurchased && (
                            <p className="text-xs text-muted-foreground">購入済み</p>
                        )}
                        {viewerCanView ? (
                            <iframe
                                srcDoc={capture.html}
                                className="h-[600px] w-full border border-border"
                                title={`Gyotaku capture ${postId}`}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                公開範囲により本文は非表示です。
                            </p>
                        )}
                    </CardContent>
                </Card>
                {metadata && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">魚拓メタデータ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div>
                                <span className="font-semibold text-foreground">URL: </span>
                                <a
                                    href={metadata.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    {metadata.url}
                                </a>
                            </div>
                            {metadata.capturedAt && (
                                <div>
                                    <span className="font-semibold text-foreground">Captured At: </span>
                                    {metadata.capturedAt}
                                </div>
                            )}
                            {metadata.hash && (
                                <div>
                                    <span className="font-semibold text-foreground">Content Hash: </span>
                                    <code>{metadata.hash}</code>
                                </div>
                            )}
                            {metadata.notes && (
                                <div>
                                    <span className="font-semibold text-foreground">Notes:</span>
                                    <p className="whitespace-pre-wrap">{metadata.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </section>
        </main>
    );
}
