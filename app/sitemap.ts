import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = "https://www.kobas-ecommerce.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const categories = await prisma.category.findMany({
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

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: baseUrl + "/boutique?categorie=" + category.slug,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: baseUrl + "/boutique",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: baseUrl + "/categories",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: baseUrl + "/a-propos",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: baseUrl + "/contact",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
