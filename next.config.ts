import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["preview-chat-f9ff970b-2959-4bc4-9639-f08e5a513285.space-z.ai", "*.space-z.ai"],
};

export default nextConfig;
