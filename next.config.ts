import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: '',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
  },
};

export default nextConfig;
