import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * next/image refuses to optimise images from hosts it does not know.
     * Gallery pictures are served from Cloudinary, so allow that host here.
     * Listing the hostname (rather than a wildcard) is what keeps the
     * optimiser from being usable as an open proxy.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // The Express API, used for server-side fetches.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  },
};

export default nextConfig;
