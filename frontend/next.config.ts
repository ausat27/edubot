import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  async rewrites() {
    // Only use rewrites in local development to proxy to Python backend on port 8000.
    // In production (Vercel), vercel.json handles the routing to the Python Serverless Function.
    if (process.env.NODE_ENV === 'development') {
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
    }
    return [];
  },
};

export default nextConfig;
