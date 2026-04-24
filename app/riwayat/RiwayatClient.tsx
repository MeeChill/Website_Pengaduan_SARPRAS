"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Bot, Clock3, MessageSquare, Search } from "lucide-react";

type HistoryItem = {
  key: string;
  id: number;
  type: "bot" | "custom";
  judul: string;
  preview: string;
  updatedAt: string;
  status?: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function RiwayatClient({ items }: { items: HistoryItem[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "bot" | "custom">("all");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchType = typeFilter === "all" || item.type === typeFilter;
      const matchText =
        keyword.length === 0 ||
        item.judul.toLowerCase().includes(keyword) ||
        item.preview.toLowerCase().includes(keyword) ||
        (item.status ?? "").toLowerCase().includes(keyword);
      return matchType && matchText;
    });
  }, [items, search, typeFilter]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Chat
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300">
            <Clock3 className="h-3.5 w-3.5" />
            Riwayat User
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight">Riwayat Percakapan</h1>
        <p className="mb-6 text-sm text-slate-400">
          Cari dan filter riwayat chat NEO-Bot maupun chat tindak lanjut.
        </p>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, isi, atau status..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/40 focus:outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "bot" | "custom")}
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white focus:border-indigo-400/40 focus:outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="bot">NEO-Bot</option>
            <option value="custom">Tindak Lanjut</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
            Tidak ada riwayat yang cocok.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Link
                key={item.key}
                href="/chat"
                className="block rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-indigo-400/40 hover:bg-slate-900"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.judul}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        {item.type === "bot" ? (
                          <>
                            <Bot className="h-3.5 w-3.5" />
                            NEO-Bot
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chat Tindak Lanjut
                          </>
                        )}
                      </span>
                      {item.status ? (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                          {item.status}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="shrink-0 text-[11px] text-slate-500">{formatDate(item.updatedAt)}</p>
                </div>
                <p className="line-clamp-2 text-sm text-slate-300">{item.preview}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
