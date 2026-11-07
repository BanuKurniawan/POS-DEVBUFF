import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.11",
    "192.168.1.*",
    "192.168.*",
    "172.19.80.1",
    "172.19.80.*",
    "172.19.*",
    "*.local",
  ],
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
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
