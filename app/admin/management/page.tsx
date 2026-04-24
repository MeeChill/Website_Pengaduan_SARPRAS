"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Eye, ChevronLeft, Clock } from "lucide-react";
import { ManagementStatusBadge } from "@/components/Badge";
import Link from "next/link";

interface Aspirasi {
  id: number;
  nomor_tiket: string;
  judul: string;
  deskripsi: string;
  lokasi: string;
  foto_before: string | null;
  foto_after: string | null;
  status: string;
  tanggal_input: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  user: {
    nama: string;
    username: string;
  };
  kategori: {
    nama_kategori: string;
  };
  admin_id: number | null;
}

export default function ComplaintsManagement() {
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAspirasi();
  }, []);

  const fetchAspirasi = async () => {
    try {
      const response = await fetch("/api/aspirasi");
      const data = await response.json();
      setAspirasi(data.aspirasi);
    } catch (error) {
      console.error("Error fetching aspirasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAspirasi = aspirasi.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor_tiket.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 mb-6 text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Kembali ke Dashboard</span>
          </Link>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 p-5 sm:p-8 border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-glow"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse-glow delay-1000"></div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight mb-2">
                Manajemen Pengaduan
              </h1>
              <p className="text-indigo-200/80 text-sm sm:text-lg font-medium">
                Kelola, pantau, dan selesaikan semua pengaduan dengan efisien.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="mb-6 flex flex-col md:flex-row gap-4 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Cari pengaduan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-lg backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center gap-2 group">
            <Filter className="text-slate-400 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-lg backdrop-blur-sm appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="dalam_progres">Dalam Proses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div
          className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="hidden md:block overflow-x-auto min-w-full">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-900/80 border-b border-white/10 backdrop-blur-xl">
                <tr>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs whitespace-nowrap">
                    Nomor Tiket
                  </th>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                    Judul & Deskripsi
                  </th>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                    Lokasi
                  </th>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                    Pengguna
                  </th>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                    Tanggal
                  </th>
                  <th className="text-left p-5 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/30">
                {filteredAspirasi.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-indigo-500/5 transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <td className="p-5 whitespace-nowrap">
                      <span className="inline-flex items-center font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors whitespace-nowrap">
                        {item.nomor_tiket}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="max-w-xs">
                        <p className="text-white font-bold truncate group-hover:text-indigo-300 transition-colors">
                          {item.judul}
                        </p>
                        <p className="text-slate-400 text-sm truncate mt-1 leading-relaxed">
                          {item.deskripsi}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                          <span className="text-xs">📍</span>
                        </div>
                        {item.lokasi}
                      </div>
                    </td>
                    <td className="p-5 text-slate-300 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {item.user.nama.charAt(0).toUpperCase()}
                        </div>
                        {item.user.nama}
                      </div>
                    </td>
                    <td className="p-5">
                      <ManagementStatusBadge status={item.status} />
                    </td>
                    <td className="p-5 text-slate-400 text-sm font-medium">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.tanggal_input).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <Link
                        href={`/admin/management/${item.id}`}
                        className="bg-indigo-600/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-4 py-2 rounded-xl text-sm font-bold border border-indigo-500/20 hover:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 w-fit"
                      >
                        <Eye className="w-4 h-4" />
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAspirasi.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-xl font-bold text-white mb-2">
                  Tidak ada pengaduan ditemukan
                </p>
                <p className="text-slate-400 max-w-sm">
                  Coba sesuaikan filter atau kata kunci pencarian Anda untuk
                  menemukan pengaduan yang dicari.
                </p>
              </div>
            )}
          </div>
          <div className="md:hidden p-3 space-y-3">
            {filteredAspirasi.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-slate-500" />
                </div>
                <p className="text-base font-bold text-white mb-1">
                  Tidak ada pengaduan ditemukan
                </p>
                <p className="text-slate-400 text-sm">
                  Ubah filter atau kata kunci pencarian.
                </p>
              </div>
            )}
            {filteredAspirasi.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                    {item.nomor_tiket}
                  </span>
                  <ManagementStatusBadge status={item.status} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.judul}</p>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                    {item.deskripsi}
                  </p>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>📍 {item.lokasi}</p>
                  <p>👤 {item.user.nama}</p>
                </div>
                <Link
                  href={`/admin/management/${item.id}`}
                  className="inline-flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-indigo-500/20 hover:border-indigo-500 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Kelola
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
