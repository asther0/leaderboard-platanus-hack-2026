import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Rebuild CSS from source: the restored build cache served pre-logo styles.
    turbopackFileSystemCacheForBuild: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hack-user-assets.s3.amazonaws.com',
        pathname: '/project-logos/26-co/*.png',
      },
    ],
  },
};

export default nextConfig;
