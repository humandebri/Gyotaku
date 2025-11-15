import { withJuno } from "@junobuild/nextjs-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    images: {
        unoptimized: true,
    },
    experimental: {
        typedRoutes: true,
    },
};

export default withJuno(nextConfig);
