import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP-only: AVIF encoding is dramatically slower for marginal size gains
    // on our photo set, and stalls the dev-mode optimizer at large widths.
    formats: ["image/webp"],
  },
};

export default nextConfig;
