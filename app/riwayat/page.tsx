import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import RiwayatClient from "./RiwayatClient";

type HistoryItem = {
  key: string;
  id: number;
  type: "bot" | "custom";
  judul: string;
  preview: string;
  updatedAt: Date;
  createdAt: Date;
  status?: string;
};

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id, 10);

  if (Number.isNaN(userId)) {
    redirect("/login");
  }

  const [botChats, customChats] = await Promise.all([
    prisma.chat.findMany({
      where: { user_id: userId },
      orderBy: { diperbarui_pada: "desc" },
      include: {
        messages: {
          orderBy: { dibuat_pada: "desc" },
          take: 1,
        },
      },
    }),
    prisma.customChat.findMany({
      where: { user_id: userId },
      orderBy: { diperbarui_pada: "desc" },
      include: {
        aspirasi: {
          select: { nomor_tiket: true },
        },
        messages: {
          orderBy: { dibuat_pada: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const history: HistoryItem[] = [
    ...botChats.map((chat) => ({
      key: `bot-${chat.id}`,
      id: chat.id,
      type: "bot" as const,
      judul: chat.judul?.trim() || "Chat Bot",
      preview: chat.messages[0]?.konten ?? "Belum ada pesan",
      updatedAt: chat.diperbarui_pada,
      createdAt: chat.dibuat_pada,
    })),
    ...customChats.map((chat) => ({
      key: `custom-${chat.id}`,
      id: chat.id,
      type: "custom" as const,
      judul: chat.aspirasi?.nomor_tiket
        ? `${chat.aspirasi.nomor_tiket} - ${chat.judul}`
        : chat.judul,
      preview: chat.messages[0]?.konten ?? "Belum ada pesan",
      updatedAt: chat.diperbarui_pada,
      createdAt: chat.dibuat_pada,
      status: chat.status,
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const serialized = history.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
  }));

  return <RiwayatClient items={serialized} />;
}
