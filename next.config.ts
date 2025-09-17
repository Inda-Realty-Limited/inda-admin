import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin/:path*",
        destination: "http://192.168.0.102:9009/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
