import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@mui/icons-material',
      '@mui/material',
      'recharts',
    ],
  },
};

export default nextConfig;
