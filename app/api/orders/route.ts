import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PAYMENT_METHODS = ["MTN_MONEY", "MOOV_MONEY", "CARD", "CASH"] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

type OrderItemInput = {
  productId: string;
  quantity: number;
  name?: string;
};

type OrderRequest = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  address?: string;
  city?: string;
  paymentMethod?: string;
  items: OrderItemInput[];
};

function generateOrderNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);

  return `KOB-${random}`;
}

class InsufficientStockError extends Error {
  constructor(productName: string) {
    super(`Stock insuffisant pour "${productName}". Quelqu'un vient peut-être de l'acheter, réessayez.`);
    this.name = "InsufficientStockError";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequest;

    const {
      firstName,
      lastName,
      email,
      whatsapp,
      address,
      city,
      paymentMethod,
      items,
    } = body;

    /* =========================
       VALIDATION
    ========================= */

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !whatsapp?.trim()
    ) {
      return NextResponse.json(
        {
          error: "Veuillez remplir toutes les informations obligatoires.",
        },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          error: "Votre panier est vide.",
        },
        { status: 400 }
      );
    }

    if (
      paymentMethod &&
      !PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)
    ) {
      return NextResponse.json(
        {
          error: "Méthode de paiement invalide.",
        },
        { status: 400 }
      );
    }

    /* =========================
       VÉRIFICATION INITIALE DES PRODUITS
       (pour les messages d'erreur et le calcul du total —
       la vraie garantie anti-survente se fait dans la transaction)
    ========================= */

    const products = await Promise.all(
      items.map(async (item) => {
        if (
          !item.productId ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          throw new Error("Les informations du panier sont invalides.");
        }

        const product = await prisma.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new Error(`Le produit ${item.productId} n'existe plus.`);
        }

        if (!product.active) {
          throw new Error(
            `Le produit "${product.name}" n'est plus disponible.`
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuffisant pour "${product.name}". Stock disponible : ${product.stock}.`
          );
        }

        return {
          product,
          quantity: item.quantity,
        };
      })
    );

    /* =========================
       CALCUL DU TOTAL
    ========================= */

    const subtotal = products.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const shipping = 0;

    const total = subtotal + shipping;

    /* =========================
       RÉCUPÉRATION OU CRÉATION DU CLIENT
    ========================= */

    const session = await auth();
    const isLoggedInCustomer =
      session?.user &&
      (session.user as { role?: string }).role === "customer";

    const normalizedEmail = email.trim().toLowerCase();

    let customerId: string;

    if (isLoggedInCustomer) {
      const id = (session!.user as { id?: string }).id as string;

      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          whatsapp: whatsapp.trim(),
          address: address?.trim() || null,
          city: city?.trim() || null,
        },
      });

      customerId = updatedCustomer.id;
    } else {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingCustomer) {
        const updatedCustomer = await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            whatsapp: whatsapp.trim(),
            address: address?.trim() || null,
            city: city?.trim() || null,
          },
        });

        customerId = updatedCustomer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            whatsapp: whatsapp.trim(),
            address: address?.trim() || null,
            city: city?.trim() || null,
            country: "Bénin",
          },
        });

        customerId = newCustomer.id;
      }
    }

    /* =========================
       TRANSACTION ATOMIQUE :
       décrément conditionnel du stock + création de la commande.
       Si le stock d'un produit a changé entre-temps (achat concurrent),
       toute la transaction échoue et rien n'est enregistré.
    ========================= */

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const { product, quantity } of products) {
        const result = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: { gte: quantity },
          },
          data: {
            stock: { decrement: quantity },
          },
        });

        if (result.count === 0) {
          throw new InsufficientStockError(product.name);
        }
      }

      return tx.order.create({
        data: {
          orderNumber,

          customerId,

          subtotal,
          shipping,
          total,

          status: "PENDING",
          paymentStatus: "PENDING",

          paymentMethod: (paymentMethod as PaymentMethod) || "MTN_MONEY",

          items: {
            create: products.map(({ product, quantity }) => ({
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              total: product.price * quantity,
              downloadUrl: product.downloadUrl || null,
            })),
          },
        },

        include: {
          items: true,
          customer: true,
        },
      });
    });

    /* =========================
       RÉPONSE
    ========================= */

    return NextResponse.json(
      {
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        total: order.total,
        message: "Commande créée avec succès.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création commande:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la création de la commande.",
      },
      { status: error instanceof InsufficientStockError ? 409 : 500 }
    );
  }
}
