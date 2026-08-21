import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read: Boolean(body.read) },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("PATCH /api/admin/messages/[id]:", error);

    return NextResponse.json(
      { error: "Impossible de mettre à jour le message." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/messages/[id]:", error);

    return NextResponse.json(
      { error: "Impossible de supprimer le message." },
      { status: 500 }
    );
  }
}