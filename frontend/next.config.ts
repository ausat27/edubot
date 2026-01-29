import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/tasks',
        destination: `${backendUrl}/api/tasks`,
      },
      {
        source: '/tasks/:path*',
        destination: `${backendUrl}/api/tasks/:path*`,
      },
      {
        source: '/chat',
        destination: `${backendUrl}/api/chat`,
      },
      {
        source: '/reset',
        destination: `${backendUrl}/api/reset`,
      },
      {
        source: '/history/:path*',
        destination: `${backendUrl}/api/history/:path*`,
      },
    ];
  },
};

export default nextConfig;
