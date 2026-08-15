/** @type {import('next').NextConfig} */
const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

function originHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return "localhost:3000";
  }
}

const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Hostinger / reverse-proxy domains (set NEXTAUTH_URL to https://yourdomain.com)
      allowedOrigins: [
        "localhost:3000",
        originHost(appUrl),
        ...(process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
          : []),
      ],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "7o7q29b8xy.ufs.sh",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "bcrypt"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
