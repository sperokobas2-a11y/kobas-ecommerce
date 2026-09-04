import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    const attempt = await prisma.loginAttempt.findUnique({
      where: { ip },
    });

    const now = new Date();

    if (attempt?.blockedUntil && attempt.blockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (attempt.blockedUntil.getTime() - now.getTime()) / 60000
      );

      return NextResponse.json({ blocked: true, remainingMinutes });
    }

    return NextResponse.json({ blocked: false });
  } catch (error) {
    console.error("GET /api/admin/login-status:", error);

    return NextResponse.json({ blocked: false });
  }
}
