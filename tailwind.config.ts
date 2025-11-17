// Gyotaku UI theme configuration keeps a light, layered palette shared across shadcn primitives.
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "#E2E8F0",
                input: "#E2E8F0",
                ring: "#94A3B8",
                background: "#F8FAFC",
                foreground: "#0F172A",
                primary: {
                    DEFAULT: "#2563EB",
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#F1F5F9",
                    foreground: "#0F172A",
                },
                muted: {
                    DEFAULT: "#E2E8F0",
                    foreground: "#64748B",
                },
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#0F172A",
                },
            },
            borderRadius: {
                lg: "12px",
                md: "10px",
                sm: "8px",
            },
        },
    },
    plugins: [],
};

export default config;
