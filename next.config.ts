import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yhtdqryejlocbwvpmpjn.supabase.co',
      },
    ],
  },
};

export default nextConfig;
