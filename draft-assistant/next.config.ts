import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is per-user and reads the session; there is no static shell worth
  // prerendering, so Cache Components stays off.
  cacheComponents: false,
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
