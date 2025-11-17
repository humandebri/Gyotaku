import CaptureForm, { type CaptureFormState } from "./capture-form";
import { submitCapture } from "@/lib/taggr-client";

const MAX_HTML_BYTES = 4 * 1024 * 1024;

const initialState: CaptureFormState = {
    status: "idle",
    message: "",
};

async function createCapture(
    _prevState: CaptureFormState,
    formData: FormData,
): Promise<CaptureFormState> {
    "use server";

    const url = (formData.get("url") ?? "").toString().trim();
    const notes = (formData.get("notes") ?? "").toString().trim();
    const realm = (formData.get("realm") ?? "").toString().trim();

    if (!url) {
        return {
            status: "error",
            message: "URLを入力してください。",
        };
    }

    let html: string;
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            return {
                status: "error",
                message: `URLの取得に失敗しました (status: ${response.status})`,
            };
        }
        html = await response.text();
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "魚拓の取得に失敗しました",
        };
    }

    const htmlSize = Buffer.byteLength(html);
    if (htmlSize > MAX_HTML_BYTES) {
        return {
            status: "error",
            message: `HTMLサイズが大きすぎます (${(htmlSize / (1024 * 1024)).toFixed(2)}MB)。${
                MAX_HTML_BYTES / (1024 * 1024)
            }MB以下のページで試してください。`,
        };
    }

    const result = await submitCapture({
        url,
        notes: notes || undefined,
        realm: realm || undefined,
        html,
    });

    if (result.success) {
        return {
            status: "success",
            message: result.mocked
                ? "環境変数が未設定のためモックモードで魚拓を記録しました。"
                : `魚拓を送信しました（Post ID: ${result.postId ?? "pending"}）。`,
        };
    }

    return {
        status: "error",
        message: result.error ?? "魚拓の送信に失敗しました。",
    };
}

export default function CapturePage() {
    return (
        <main className="mx-auto max-w-4xl space-y-10 px-6 py-16 lg:px-8">
            <header className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[6px] text-slate-500">
                    Capture
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    魚拓を取得
                </h1>
                <p className="text-base leading-relaxed text-muted-foreground">
                    元記事のURLや補足メモを入力し、Taggr canister へ投稿します。未認証の状態では送信が拒否される可能性があります。
                </p>
            </header>
            <CaptureForm action={createCapture} initialState={initialState} />
        </main>
    );
}
