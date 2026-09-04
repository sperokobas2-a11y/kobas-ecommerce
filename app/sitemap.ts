import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.kobas-ecommerce.shop";

  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: baseUrl + "/produit/" + product.slug,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: baseUrl + "/recherche",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...productUrls,
  ];
}
