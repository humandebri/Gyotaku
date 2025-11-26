"use client";

// コメントフォーム: サーバーアクション経由で投稿を送信する UI。

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    action: (prevState: FormState, formData: FormData) => Promise<FormState>;
    initialState: FormState;
};

type FormState = {
    status: "idle" | "success" | "error";
    message: string;
};

export function CommentForm({ action, initialState }: Props) {
    const [state, formAction] = useFormState(action, initialState);

    return (
        <form action={formAction} className="space-y-3">
            <Textarea name="body" rows={4} required placeholder="コメントを入力" />
            {state.status === "error" && (
                <p className="text-xs text-red-500">{state.message}</p>
            )}
            {state.status === "success" && (
                <p className="text-xs text-green-500">{state.message}</p>
            )}
            <CommentSubmitButton />
        </form>
    );
}

function CommentSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "送信中..." : "コメントを投稿"}
        </Button>
    );
}
