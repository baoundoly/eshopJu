import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by the Dockerfile which copies the .next/standalone output.
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  output: "standalone",

  // Expose env vars explicitly so they are available both at build time
  // (NEXT_PUBLIC_* are inlined into the JS bundle) and for documentation.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801XXXXXXXXX",
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? "EshopJu",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },

  images: {
    // Allow Next.js <Image> to serve images from any HTTPS source.
    // Narrow these to specific domains in production for security.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
