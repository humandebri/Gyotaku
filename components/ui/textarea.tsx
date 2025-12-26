import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = "", ...props }, ref) => (
        <textarea
            ref={ref}
            className={`form-input ${className}`}
            {...props}
        />
    ),
);
Textarea.displayName = "Textarea";
