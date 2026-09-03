import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ABANDON_THRESHOLD_HOURS = 48;

export async function GET(request: Request) {
  try {
    // Vérification du secret pour empêcher un appel externe non autorisé
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (
      !expectedSecret ||
      authHeader !== `Bearer ${expectedSecret}`
    ) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const threshold = new Date(
      Date.now() - ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000
    );

    const abandonedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        status: { notIn: ["CANCELLED", "DELIVERED"] },
        createdAt: { lte: threshold },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    let cleanedCount = 0;
    const errors: string[] = [];

    for (const order of abandonedOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          // Restitution du stock pour chaque article
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity },
              },
            }).catch(() => {
              // Le produit a peut-être été supprimé depuis — on ignore
              // silencieusement pour ne pas bloquer le reste du nettoyage.
            });
          }

          // Annulation de la commande
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED",
            },
          });

          // Marquage des paiements en attente comme échoués
          await tx.payment.updateMany({
            where: {
              orderId: order.id,
              status: "PENDING",
            },
            data: {
              status: "FAILED",
            },
          });
        });

        cleanedCount++;
      } catch (err) {
        errors.push(
          `Commande ${order.orderNumber} : ${
            err instanceof Error ? err.message : "erreur inconnue"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      checked: abandonedOrders.length,
      cleaned: cleanedCount,
      errors,
    });
  } catch (error) {
    console.error("GET /api/cron/cleanup-abandoned-orders:", error);

    return NextResponse.json(
      { error: "Impossible d'exécuter le nettoyage." },
      { status: 500 }
    );
  }
}
