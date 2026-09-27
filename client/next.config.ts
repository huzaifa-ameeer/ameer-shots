import type { NextConfig } from "next";

/**
 * NEXT_PUBLIC_API_URL is inlined into the client bundle at build time, so a
 * missing value in production would quietly ship a site talking to
 * localhost. Vercel gets it from the project's environment variables; failing
 * the build makes the mistake obvious instead of invisible.
 */
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL must be set when building for production, " +
      "e.g. https://your-api.onrender.com",
  );
}

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
};

export default nextConfig;
