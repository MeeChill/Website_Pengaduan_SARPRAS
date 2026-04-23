"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  User,
  Calendar,
  Tag,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  ImagePlus,
  Send,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  X,
  ZoomIn,
} from "lucide-react";
import { ManagementStatusBadge } from "@/components/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgresUpdate {
  id: number;
  deskripsi_update: string;
  foto_url: string | null;
  tanggal_update: string;
  admin: { nama: string; username: string };
}

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
  user: { nama: string; username: string; kelas?: string | null; nisn?: string | null };
  kategori: { nama_kategori: string };
  progres_updates: ProgresUpdate[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({
  src,
  label,
  accent,
}: {
  src: string;
  label: string;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <Lightbox src={src} onClose={() => setOpen(false)} />}
      <div className="flex flex-col gap-2">
        <p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>
          {label}
        </p>
        <div
          className="relative group rounded-2xl overflow-hidden border border-white/10 cursor-pointer bg-slate-800"
          onClick={() => setOpen(true)}
        >
          <img
            src={src}
            alt={label}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Status Selector ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  {
    key: "pending",
    label: "Menunggu",
    desc: "Belum ditindaklanjuti",
    dot: "bg-amber-400",
    ring: "ring-amber-500/40",
    active: "bg-amber-500/15 border-amber-500/50 text-amber-300",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:border-amber-500/30 hover:text-amber-300",
  },
  {
    key: "dalam_progres",
    label: "Dalam Proses",
    desc: "Sedang ditangani tim",
    dot: "bg-blue-400",
    ring: "ring-blue-500/40",
    active: "bg-blue-500/15 border-blue-500/50 text-blue-300",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-blue-300",
  },
  {
    key: "selesai",
    label: "Selesai",
    desc: "Pengaduan telah tuntas",
    dot: "bg-emerald-400",
    ring: "ring-emerald-500/40",
    active: "bg-emerald-500/15 border-emerald-500/50 text-emerald-300",
    idle: "bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-300",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [aspirasi, setAspirasi] = useState<Aspirasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Progress update
  const [progressText, setProgressText] = useState("");
  const [progressPhoto, setProgressPhoto] = useState<File | null>(null);
  const [progressPhotoPreview, setProgressPhotoPreview] = useState<string | null>(null);
  const [progressPhotoUrl, setProgressPhotoUrl] = useState<string | null>(null);
  const [uploadingProgressPhoto, setUploadingProgressPhoto] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const progressFileRef = useRef<HTMLInputElement>(null);

  // After photo
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string | null>(null);
  const [uploadingAfterPhoto, setUploadingAfterPhoto] = useState(false);
  const afterFileRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAspirasi = async () => {
    try {
      const res = await fetch(`/api/aspirasi?id=${id}`);
      if (!res.ok) throw new Error("Tidak ditemukan");
      const data = await res.json();
      setAspirasi(data.aspirasi);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirasi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Upload helper ──────────────────────────────────────────────────────────

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  };

  // ── Progress photo select ──────────────────────────────────────────────────

  const handleProgressPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setProgressPhoto(file);
    setProgressPhotoPreview(URL.createObjectURL(file));
    setUploadingProgressPhoto(true);
    const url = await uploadFile(file);
    setProgressPhotoUrl(url);
    setUploadingProgressPhoto(false);
  };

  const clearProgressPhoto = () => {
    setProgressPhoto(null);
    if (progressPhotoPreview) URL.revokeObjectURL(progressPhotoPreview);
    setProgressPhotoPreview(null);
    setProgressPhotoUrl(null);
  };

  // ── Submit progress update ─────────────────────────────────────────────────

  const handleSubmitProgress = async () => {
    if (!progressText.trim() || !aspirasi) return;
    setSubmittingProgress(true);
    try {
      const res = await fetch(`/api/aspirasi/${aspirasi.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deskripsi_update: progressText.trim(),
          foto_url: progressPhotoUrl || undefined,
        }),
      });
      if (res.ok) {
        setProgressText("");
        clearProgressPhoto();
        await fetchAspirasi();
      }
    } finally {
      setSubmittingProgress(false);
    }
  };

  // ── After photo ────────────────────────────────────────────────────────────

  const handleAfterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAfterPhotoFile(file);
    setAfterPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadAfterPhoto = async () => {
    if (!afterPhotoFile || !aspirasi) return;
    setUploadingAfterPhoto(true);
    try {
      const fd = new FormData();
      fd.append("foto_after", afterPhotoFile);
      const res = await fetch(`/api/aspirasi/${aspirasi.id}/photo`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        setAfterPhotoFile(null);
        if (afterPhotoPreview) URL.revokeObjectURL(afterPhotoPreview);
        setAfterPhotoPreview(null);
        await fetchAspirasi();
      }
    } finally {
      setUploadingAfterPhoto(false);
    }
  };

  // ── Update status ──────────────────────────────────────────────────────────

  const handleUpdateStatus = async (newStatus: string) => {
    if (!aspirasi || aspirasi.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/aspirasi/${aspirasi.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAspirasi((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Memuat data pengaduan...</p>
        </div>
      </div>
    );
  }

  if (error || !aspirasi) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Pengaduan tidak ditemukan</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link
            href="/admin/management"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }

  const isSelesai = aspirasi.status === "selesai";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-16">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/admin/management"
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-xs sm:text-sm">Kembali ke Manajemen</span>
          </Link>

          <div className="flex items-center gap-3">
            <ManagementStatusBadge status={aspirasi.status} />
            <button
              onClick={fetchAspirasi}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">

        {/* ── Page header ───────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-950 border border-white/8 p-5 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-indigo-500/8 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                    <Hash className="w-3 h-3" />
                    {aspirasi.nomor_tiket}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-full border border-white/5">
                    {aspirasi.kategori.nama_kategori}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug mb-2">
                  {aspirasi.judul}
                </h1>
                <p className="text-slate-400 leading-relaxed max-w-2xl">
                  {aspirasi.deskripsi}
                </p>
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium text-slate-300">{aspirasi.user.nama}</span>
                {aspirasi.user.kelas && (
                  <span className="text-slate-600">· {aspirasi.user.kelas}</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                {aspirasi.lokasi}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                Masuk: {fmtShort(aspirasi.tanggal_input)}
              </span>
              {aspirasi.tanggal_mulai && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  Mulai: {fmtShort(aspirasi.tanggal_mulai)}
                </span>
              )}
              {aspirasi.tanggal_selesai && (
                <span className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Selesai: {fmtShort(aspirasi.tanggal_selesai)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT column (actions) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Status Selector */}
            <section className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                Perbarui Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = aspirasi.status === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleUpdateStatus(opt.key)}
                      disabled={updatingStatus || isActive}
                      className={[
                        "relative flex flex-col items-start gap-1 px-4 py-3.5 rounded-xl border text-left transition-all duration-200",
                        "disabled:cursor-default",
                        isActive
                          ? `${opt.active} ring-2 ${opt.ring} shadow-sm`
                          : opt.idle,
                        !isActive && !updatingStatus ? "hover:scale-[1.02] active:scale-[0.98]" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={["w-2 h-2 rounded-full shrink-0", opt.dot, isActive ? "animate-pulse" : "opacity-50"].join(" ")} />
                        <span className="font-semibold text-sm">{opt.label}</span>
                        {isActive && updatingStatus && (
                          <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                        )}
                        {isActive && !updatingStatus && (
                          <CheckCircle className="w-3.5 h-3.5 ml-auto opacity-70" />
                        )}
                      </div>
                      <span className="text-[11px] opacity-60 pl-4">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Progress Update Form */}
            <section className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Tambah Update Progress
              </h2>

              <div className="space-y-3">
                <textarea
                  value={progressText}
                  onChange={(e) => setProgressText(e.target.value)}
                  placeholder="Tuliskan update progress pengaduan ini secara detail..."
                  rows={4}
                  className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none text-sm"
                />

                {/* Progress photo preview */}
                {progressPhotoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={progressPhotoPreview}
                      alt="Preview"
                      className="h-24 rounded-xl border border-white/10 object-cover bg-slate-800"
                    />
                    {uploadingProgressPhoto && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                    {!uploadingProgressPhoto && (
                      <button
                        onClick={clearProgressPhoto}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {/* Attach photo */}
                  <input
                    ref={progressFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProgressPhotoChange}
                  />
                  <button
                    onClick={() => progressFileRef.current?.click()}
                    disabled={uploadingProgressPhoto || !!progressPhotoPreview}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-white/10 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Lampirkan Foto
                  </button>

                  <button
                    onClick={handleSubmitProgress}
                    disabled={!progressText.trim() || submittingProgress || uploadingProgressPhoto}
                    className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed sm:ml-auto"
                  >
                    {submittingProgress ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Kirim Update
                  </button>
                </div>
              </div>
            </section>

            {/* Upload After Photo */}
            <section className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-emerald-400" />
                Foto Sesudah (After)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Upload foto hasil penyelesaian pengaduan sebagai bukti perbaikan.
              </p>

              {aspirasi.foto_after ? (
                <div className="space-y-3">
                  <PhotoCard src={aspirasi.foto_after} label="Foto After (sudah diupload)" accent="text-emerald-400" />
                  <p className="text-xs text-slate-600">
                    Foto after sudah ada. Upload baru untuk mengganti.
                  </p>
                </div>
              ) : null}

              {/* Upload new after photo */}
              <input
                ref={afterFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAfterPhotoChange}
              />

              {afterPhotoPreview ? (
                <div className="space-y-3 mt-3">
                  <div className="relative inline-block">
                    <img
                      src={afterPhotoPreview}
                      alt="After preview"
                      className="h-40 rounded-xl border border-white/10 object-cover bg-slate-800"
                    />
                    <button
                      onClick={() => {
                        setAfterPhotoFile(null);
                        if (afterPhotoPreview) URL.revokeObjectURL(afterPhotoPreview);
                        setAfterPhotoPreview(null);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <button
                    onClick={handleUploadAfterPhoto}
                    disabled={uploadingAfterPhoto}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    {uploadingAfterPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingAfterPhoto ? "Mengupload..." : "Upload Foto After"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => afterFileRef.current?.click()}
                  className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 text-slate-500 hover:text-emerald-400 text-sm font-medium transition-all w-full justify-center hover:bg-emerald-500/5"
                >
                  <Upload className="w-4 h-4" />
                  Pilih foto after
                </button>
              )}
            </section>
          </div>

          {/* RIGHT column (info + photos + timeline) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Before / After Photos */}
            {(aspirasi.foto_before || aspirasi.foto_after) && (
              <section className="bg-slate-900/60 border border-white/8 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Dokumentasi Foto
                </h2>
                <div className="space-y-4">
                  {aspirasi.foto_before && (
                    <PhotoCard
                      src={aspirasi.foto_before}
                      label="Before"
                      accent="text-amber-400"
                    />
                  )}
                  {aspirasi.foto_after && (
                    <PhotoCard
                      src={aspirasi.foto_after}
                      label="After"
                      accent="text-emerald-400"
                    />
                  )}
                </div>
              </section>
            )}

            {/* Progress Timeline */}
            <section className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Riwayat Progress
                {aspirasi.progres_updates.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {aspirasi.progres_updates.length} update
                  </span>
                )}
              </h2>

              {aspirasi.progres_updates.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-slate-600">
                  <Clock className="w-8 h-8 opacity-20" />
                  <p className="text-sm text-center">Belum ada update progress</p>
                </div>
              ) : (
                <ol className="relative border-l border-white/8 space-y-6 ml-2">
                  {aspirasi.progres_updates.map((update, i) => (
                    <li key={update.id} className="ml-5">
                      {/* Dot */}
                      <span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-950 mt-1" />

                      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-indigo-300">
                            {update.admin.nama}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {fmtDate(update.tanggal_update)}
                          </span>
                        </div>
                        {/* Text */}
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {update.deskripsi_update}
                        </p>
                        {/* Photo */}
                        {update.foto_url && (
                          <PhotoCard
                            src={update.foto_url}
                            label="Foto Progress"
                            accent="text-blue-400"
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
