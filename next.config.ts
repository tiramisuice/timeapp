import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  // React strict mode is on by default
  reactStrictMode: true,
  // If your repo is not at root (e.g., username/timeboard), uncomment and set:
  // basePath: '/timeboard',
  // trailingSlash: true, // Helps with GitHub Pages routing
};

export default nextConfig;
