import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const aspirasiId = parseInt(id, 10);
    if (Number.isNaN(aspirasiId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const rating = Number(body?.rating);
    const feedback =
      typeof body?.feedback === "string" ? body.feedback.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const aspirasi = await prisma.aspirasi.findFirst({
      where: {
        id: aspirasiId,
        user_id: parseInt(session.user.id, 10),
      },
      select: {
        id: true,
        status: true,
        rating: true,
      },
    });

    if (!aspirasi) {
      return NextResponse.json({ error: "Aspirasi not found" }, { status: 404 });
    }

    if (aspirasi.status !== "selesai") {
      return NextResponse.json(
        { error: "Feedback hanya bisa dikirim saat laporan selesai" },
        { status: 400 },
      );
    }

    if (aspirasi.rating) {
      return NextResponse.json(
        { error: "Rating dan feedback sudah pernah dikirim" },
        { status: 409 },
      );
    }

    const updated = await prisma.aspirasi.update({
      where: { id: aspirasiId },
      data: {
        rating,
        feedback: feedback || null,
      },
      select: {
        id: true,
        rating: true,
        feedback: true,
      },
    });

    return NextResponse.json({ success: true, aspirasi: updated });
  } catch (error) {
    console.error("Error submitting aspirasi feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
