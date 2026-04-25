import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow jspdf and other packages that use browser APIs
  // to be bundled only on the client
  serverExternalPackages: [],
};

export default nextConfig;
