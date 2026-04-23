import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const [notifications, unread_count] = await Promise.all([
      prisma.notifikasi.findMany({
        where: { penerima_id: userId },
        orderBy: { tanggal_notif: "desc" },
        take: 30,
      }),
      prisma.notifikasi.count({
        where: { penerima_id: userId, dibaca: false },
      }),
    ]);

    return NextResponse.json({ notifications, unread_count });
  } catch (error) {
    console.error("[GET /api/notifications] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    let ids: number[] | undefined;
    try {
      const body = (await request.json()) as { ids?: number[] };
      ids = body.ids;
    } catch {
      // Body might be empty — treat as mark-all
      ids = undefined;
    }

    const where =
      ids && ids.length > 0
        ? {
            id: { in: ids },
            penerima_id: userId, // Ensure users can only mark their own notifications
            dibaca: false,
          }
        : {
            penerima_id: userId,
            dibaca: false,
          };

    const result = await prisma.notifikasi.updateMany({
      where,
      data: { dibaca: true },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("[PATCH /api/notifications] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
