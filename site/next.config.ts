import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
