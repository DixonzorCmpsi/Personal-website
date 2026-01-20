// next.config.ts
import type { NextConfig } from "next";

// Detect if we are running in GitHub Actions (for GitHub Pages)
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // DYNAMIC LOGIC:
  // 1. If on GitHub Actions -> Use 'export' (Static HTML for Pages)
  // 2. Otherwise (Docker/Cloudflare/Local) -> Use 'standalone' (Node Server)
  output: isGithubActions ? 'export' : 'standalone',

  images: {
    // Disable optimization ONLY for static builds (GitHub Pages)
    // Docker/Cloudflare will still use the powerful Next.js Image Optimization
    unoptimized: isGithubActions,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
