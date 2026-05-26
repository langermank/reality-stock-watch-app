import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/.claude/**",
        "**/.codex/**",
      ],
    };

    return config;
  },
};

export default nextConfig;
