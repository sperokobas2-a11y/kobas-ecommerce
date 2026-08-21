import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [orders, products, customers, payments] = await Promise.all([
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany(),
      prisma.customer.findMany(),
      prisma.payment.findMany(),
    ]);

    // Revenu total (commandes payées uniquement)
    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // Revenu des 30 derniers jours vs 30 jours précédents (évolution)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const last30DaysRevenue = paidOrders
      .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);

    const previous30DaysRevenue = paidOrders
      .filter(
        (o) =>
          new Date(o.createdAt) >= sixtyDaysAgo &&
          new Date(o.createdAt) < thirtyDaysAgo
      )
      .reduce((sum, o) => sum + o.total, 0);

    const revenueGrowth =
      previous30DaysRevenue > 0
        ? ((last30DaysRevenue - previous30DaysRevenue) /
            previous30DaysRevenue) *
          100
        : last30DaysRevenue > 0
          ? 100
          : 0;

    // Ventes par jour (14 derniers jours) pour un graphique
    const salesByDay: Record<string, number> = {};

    for (let i = 13; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = day.toISOString().split("T")[0];
      salesByDay[key] = 0;
    }

    paidOrders.forEach((order) => {
      const key = new Date(order.createdAt).toISOString().split("T")[0];
      if (key in salesByDay) {
        salesByDay[key] += order.total;
      }
    });

        // Top produits (par quantité vendue, à partir des OrderItem)
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    

    orders.forEach((order) => {
      if (order.paymentStatus !== "PAID") return;

      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Répartition des statuts de commande
    const ordersByStatus = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Répartition des moyens de paiement
    const paymentsByMethod = payments.reduce(
      (acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        averageOrderValue:
          paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        revenueGrowth,
        salesByDay,
        topProducts,
        ordersByStatus,
        paymentsByMethod,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats:", error);

    return NextResponse.json(
      { error: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}