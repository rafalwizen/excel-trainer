import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting: emits .next/standalone with a minimal server.js (Dockerfile
  // runner stage copies it; public/ and .next/static are copied alongside).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
