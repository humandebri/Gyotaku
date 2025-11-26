import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchPostSummary, fetchCaptureContent } from "@/lib/taggr-client";
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
                                <div>Realm: {summary.post.realm ?? "N/A"}</div>
                                <div>Tags: {summary.post.tags.join(", ") || "N/A"}</div>
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
                    <CardContent className="p-0">
                        <iframe
                            srcDoc={capture.html}
                            className="h-[600px] w-full border-t border-border"
                            title={`Gyotaku capture ${postId}`}
                        />
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
