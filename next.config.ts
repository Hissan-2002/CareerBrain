import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse uses Node.js native modules — keep it out of the Turbopack bundle
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
