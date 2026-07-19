import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/signin",
        "/reset-password",
        "/impressum",
        "/privacy",
      ],
    },
    sitemap: "https://germanyguide.net/sitemap.xml",
  };
}
