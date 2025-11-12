import { defineConfig } from "@junobuild/config";

export default defineConfig({
    satellite: {
        ids: {
            production: "xxxx-xxxx-xxxx-xxxx-cai",
            staging: "yyyy-yyyy-yyyy-yyyy-cai",
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
