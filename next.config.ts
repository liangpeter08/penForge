import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second dev server run from the same checkout without clobbering .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["three"],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
