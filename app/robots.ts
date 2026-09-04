import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.kobas-ecommerce.shop";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/compte/",
        "/connexion/",
        "/inscription/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
