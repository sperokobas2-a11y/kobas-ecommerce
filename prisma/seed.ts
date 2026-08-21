import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: "Gaming",
      slug: "gaming",
      description: "Jeux, accessoires et expériences gaming",
    },
    {
      name: "Logiciels",
      slug: "logiciels",
      description: "Les outils pour travailler et créer",
    },
    {
      name: "Informatique",
      slug: "informatique",
      description: "Équipements et solutions informatiques",
    },
    {
      name: "Téléphones",
      slug: "telephones",
      description: "Smartphones et accessoires",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const gaming = await prisma.category.findUnique({
    where: { slug: "gaming" },
  });

  const logiciels = await prisma.category.findUnique({
    where: { slug: "logiciels" },
  });

  const informatique = await prisma.category.findUnique({
    where: { slug: "informatique" },
  });

  if (!gaming || !logiciels || !informatique) {
    throw new Error("Catégories introuvables.");
  }

  const products = [
    {
      name: "Pack Gaming Premium",
      slug: "pack-gaming-premium",
      description: "Une sélection premium pour les passionnés de gaming.",
      price: 40000,
      comparePrice: 50000,
      stock: 50,
      sku: "KOBAS-GAMING-001",
      images: [],
      featured: true,
      categoryId: gaming.id,
    },
    {
      name: "Pack Gaming Starter",
      slug: "pack-gaming-starter",
      description: "Le pack idéal pour commencer.",
      price: 25000,
      stock: 50,
      sku: "KOBAS-GAMING-002",
      images: [],
      featured: false,
      categoryId: gaming.id,
    },
    {
      name: "Pack Logiciels Pro",
      slug: "pack-logiciels-pro",
      description: "Des outils logiciels pour améliorer votre productivité.",
      price: 25000,
      comparePrice: 35000,
      stock: 30,
      sku: "KOBAS-SOFT-001",
      images: [],
      featured: true,
      categoryId: logiciels.id,
    },
    {
      name: "Pack Logiciels Starter",
      slug: "pack-logiciels-starter",
      description: "Une sélection de logiciels essentiels.",
      price: 15000,
      stock: 40,
      sku: "KOBAS-SOFT-002",
      images: [],
      featured: false,
      categoryId: logiciels.id,
    },
    {
      name: "Pack Tech Premium",
      slug: "pack-tech-premium",
      description: "Une sélection de solutions technologiques.",
      price: 15000,
      stock: 25,
      sku: "KOBAS-TECH-001",
      images: [],
      featured: true,
      categoryId: informatique.id,
    },
    {
      name: "Pack Informatique Pro",
      slug: "pack-informatique-pro",
      description: "Solutions informatiques pour professionnels.",
      price: 30000,
      stock: 20,
      sku: "KOBAS-INFO-001",
      images: [],
      featured: false,
      categoryId: informatique.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("Base Kobas initialisée avec succès.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });