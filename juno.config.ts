import { defineConfig } from "@junobuild/config";

export default defineConfig({
    satellite: {
        ids: {
            production: "atbka-rp777-77775-aaaaq-cai",
            development: "atbka-rp777-77775-aaaaq-cai",
        },
        source: "dist/frontend",
        predeploy: ["npm run build"],
        precompress: [
            {
                pattern: "**/*.+(js|mjs|css)",
                algorithm: "brotli",
                mode: "replace",
            },
            {
                pattern: "**/*.html",
                algorithm: "brotli",
                mode: "both",
            },
        ],
    },
});
