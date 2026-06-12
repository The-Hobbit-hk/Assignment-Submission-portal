import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/about/message-riy-2025-26",
        destination: "/about#message-riy-2026-27",
        permanent: true,
      },
      {
        source: "/resources/awards-structure-riy-2025-26",
        destination: "/resources/awards-structure-riy-2026-27",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: [
    "@prisma/client",
    "pg",
    "bcryptjs",
    "pdfkit",
    "exceljs",
    "@supabase/supabase-js",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
