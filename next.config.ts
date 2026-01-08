import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker/Self-hosting efficiency
  output: "standalone",
  // React strict mode is on by default
  reactStrictMode: true,
};

export default nextConfig;
