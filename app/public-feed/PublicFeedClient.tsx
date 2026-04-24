"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Search, Users } from "lucide-react";

type FeedItem = {
  id: number;
  nomor_tiket: string;
  judul: string;
  lokasi: string;
  kategori: string;
  pelapor: string;
  tanggal_selesai: string;
  foto_after?: string | null;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function PublicFeedClient({ items }: { items: FeedItem[] }) {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item) => item.kategori)))],
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchCategory = kategori === "all" || item.kategori === kategori;
      const matchText =
        q.length === 0 ||
        item.judul.toLowerCase().includes(q) ||
        item.nomor_tiket.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q) ||
        item.pelapor.toLowerCase().includes(q);
      return matchCategory && matchText;
    });
  }, [items, search, kategori]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Public Feed Aspirasi</h1>
            <p className="mt-1 text-sm text-slate-400">
              Menampilkan aspirasi siswa yang sudah selesai ditangani.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            <Users className="h-3.5 w-3.5" />
            Feed Publik
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, tiket, lokasi, pelapor..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/40 focus:outline-none"
            />
          </div>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white focus:border-indigo-400/40 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Semua Kategori" : c}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
            Tidak ada data aspirasi selesai yang cocok.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                    Selesai
                  </span>
                  <span className="text-[11px] text-slate-500">{formatDate(item.tanggal_selesai)}</span>
                </div>

                <p className="mb-1 text-sm font-semibold text-white">{item.judul}</p>
                <p className="mb-2 text-xs text-slate-400">{item.nomor_tiket}</p>
                <p className="mb-2 text-xs text-slate-500">{item.lokasi}</p>
                <p className="mb-3 text-xs text-slate-400">Pelapor: {item.pelapor}</p>

                <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-300">
                  <CheckCircle2 className="h-3 w-3" />
                  {item.kategori}
                </div>

                {item.foto_after ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.foto_after}
                    alt={`Foto after ${item.nomor_tiket}`}
                    className="h-36 w-full rounded-xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="h-36 w-full rounded-xl border border-dashed border-white/10 bg-slate-800/40" />
                )}
              </article>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/chat"
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Kembali ke Chat
          </Link>
        </div>
      </div>
    </main>
  );
}
