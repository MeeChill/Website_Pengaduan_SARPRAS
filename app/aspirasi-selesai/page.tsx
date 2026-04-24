import prisma from "@/lib/prisma";
import AspirasiSelesaiClient from "./AspirasiSelesaiClient";

export default async function AspirasiSelesaiPage() {
  const aspirasi = await prisma.aspirasi.findMany({
    where: { status: "selesai" },
    include: {
      kategori: { select: { nama_kategori: true } },
    },
    orderBy: { tanggal_selesai: "desc" },
  });

  const items = aspirasi.map((a) => ({
    id: a.id,
    nomor_tiket: a.nomor_tiket,
    judul: a.judul,
    lokasi: a.lokasi,
    kategori: a.kategori.nama_kategori,
    tanggal_selesai: (a.tanggal_selesai ?? a.tanggal_input).toISOString(),
    foto_after: a.foto_after,
  }));

  return <AspirasiSelesaiClient items={items} />;
}
