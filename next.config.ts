import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  // React strict mode is on by default
  reactStrictMode: true,
  // Base path for GitHub Pages (change to match your repo name)
  basePath: '/timeapp',
  // Trailing slash helps with GitHub Pages routing
  trailingSlash: true,
};

export default nextConfig;
