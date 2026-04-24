import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PublicFeedClient from "./PublicFeedClient";

export default async function PublicFeedPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  const aspirasi = await prisma.aspirasi.findMany({
    where: {
      status: "selesai",
      ...(session?.user?.role === "user" && Number.isFinite(userId)
        ? { user_id: { not: userId as number } }
        : {}),
    },
    include: {
      kategori: { select: { nama_kategori: true } },
      user: { select: { nama: true } },
    },
    orderBy: { tanggal_selesai: "desc" },
  });

  const items = aspirasi.map((item) => ({
    id: item.id,
    nomor_tiket: item.nomor_tiket,
    judul: item.judul,
    lokasi: item.lokasi,
    kategori: item.kategori?.nama_kategori || "Umum",
    pelapor: item.user?.nama || "Siswa",
    tanggal_selesai: (item.tanggal_selesai ?? item.tanggal_input).toISOString(),
    foto_after: item.foto_after,
  }));

  return <PublicFeedClient items={items} />;
}
