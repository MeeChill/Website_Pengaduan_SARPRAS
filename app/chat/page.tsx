"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PusherJs from "pusher-js";
import {
  Send,
  Menu,
  Plus,
  User,
  Bot,
  ChevronLeft,
  Trash2,
  Sparkles,
  MessageSquare,
  FileText,
  X,
  Upload,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  LogOut,
  History,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { StatusBadge } from "@/components/Badge";

// ─────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => {
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#f43f5e",
    "#a78bfa",
  ];
  return {
    id: i,
    left: `${(i * 13 + 7) % 100}%`,
    width: 6 + (i % 6),
    height: 6 + (i % 5),
    color: colors[i % colors.length],
    delay: `${(i * 90) % 900}ms`,
    duration: `${1300 + ((i * 130) % 900)}ms`,
    isCircle: i % 3 === 0,
  };
});

function ConfettiEffect() {
  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(600deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {CONFETTI_PIECES.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: "absolute",
              top: "-20px",
              left: piece.left,
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              backgroundColor: piece.color,
              borderRadius: piece.isCircle ? "50%" : "2px",
              animationName: "confetti-fall",
              animationDuration: piece.duration,
              animationDelay: piece.delay,
              animationFillMode: "forwards",
              animationTimingFunction: "linear",
            }}
          />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────
interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  konten: string;
}

interface Chat {
  id: number;
  judul: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

interface CustomChat {
  id: number;
  judul: string;
  status: string;
  prioritas: string;
  dibuat_pada: string;
  diperbarui_pada: string;
  aspirasi?: {
    id: number;
    nomor_tiket: string;
    status: string;
  } | null;
  messages?: CustomChatMessage[];
  user?: { nama: string };
}

interface CustomChatMessage {
  id: number;
  custom_chat_id: number;
  sender_id: number;
  sender_role: string;
  konten: string;
  foto_url?: string | null;
  dibuat_pada: string;
}

interface AspirasiHistory {
  id: number;
  judul: string;
  deskripsi: string;
  lokasi: string;
  nomor_tiket: string;
  status: string;
  tanggal_input: string;
  foto_before?: string | null;
  foto_after?: string | null;
  rating?: number | null;
  feedback?: string | null;
  progres_updates?: {
    id: number;
    deskripsi_update: string;
    tanggal_update: string;
    admin?: { nama: string } | null;
  }[];
}

type LaporanMsg = { role: "bot" | "user"; content: string; imageUrl?: string | null };
type ChatMode = "bot" | "laporan" | "custom";
type LaporanStep = -1 | 0 | 1 | 2 | 3 | 4 | 5;

// ─────────────────────────────────────────────
// Konstanta Bot
// ─────────────────────────────────────────────
const WELCOME_MESSAGE = `Halo! 👋 Selamat datang di **NEO-Bot**!

Saya adalah asisten virtual NEO-SARANA yang siap bantu kamu memahami alur laporan sarana/prasarana sekolah secara cepat.

Silakan pilih template pertanyaan di bawah ini, atau ketik pertanyaanmu sendiri.

💡 Jika tulisanmu mirip salah satu template, saya akan autocorrect ke topik terdekat supaya jawabannya lebih tepat.`;

const TEMPLATE_QUESTIONS = [
  {
    id: 1,
    label: "📝 Panduan buat laporan",
    query: "Bagaimana langkah lengkap membuat laporan pengaduan di NEO-SARANA?",
  },
  {
    id: 2,
    label: "🔍 Cek status tiket",
    query: "Bagaimana cara cek status tiket laporan saya?",
  },
  {
    id: 3,
    label: "📋 Daftar kategori laporan",
    query: "Apa saja kategori laporan yang tersedia di aplikasi?",
  },
  {
    id: 4,
    label: "⏱️ Estimasi waktu proses",
    query: "Berapa estimasi waktu dari laporan masuk sampai selesai?",
  },
  {
    id: 5,
    label: "✅ Syarat laporan valid",
    query: "Apa saja syarat agar laporan saya valid dan cepat diproses?",
  },
  {
    id: 6,
    label: "📸 Aturan upload foto",
    query: "Bagaimana ketentuan upload foto before dan after pada laporan?",
  },
  {
    id: 7,
    label: "🆘 Laporan darurat",
    query: "Jika ada kerusakan darurat, bagaimana cara melapor agar diprioritaskan?",
  },
];

const KATEGORI_OPTIONS = [
  { label: "📚 Sarana Belajar", value: "Sarana Belajar" },
  { label: "🔧 Prasarana Fisik", value: "Prasarana Fisik" },
  { label: "🧹 Kebersihan", value: "Kebersihan" },
  { label: "📷 Keamanan", value: "Keamanan" },
];

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
const generateTicket = () => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ASP-${dateStr}-${rand}`;
};

const formatMsgTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return time;
  return (
    date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    ", " +
    time
  );
};

const LAPORAN_THREADS_KEY = "laporan_threads_v1";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
};

const getTemplateScore = (input: string, template: string) => {
  const source = normalizeText(input);
  const target = normalizeText(template);
  if (!source || !target) return 0;
  if (target.includes(source) || source.includes(target)) return 0.98;
  const sourceWords = new Set(source.split(" "));
  const targetWords = target.split(" ");
  const overlap =
    targetWords.filter((word) => sourceWords.has(word)).length /
    Math.max(targetWords.length, 1);
  const distance = levenshtein(source, target);
  const ratio = 1 - distance / Math.max(source.length, target.length, 1);
  return overlap * 0.6 + Math.max(ratio, 0) * 0.4;
};

// ─────────────────────────────────────────────
// Bot response
// ─────────────────────────────────────────────
function getBotResponse(input: string): string {
  const lower = input.toLowerCase();

  if (
    lower.match(
      /^(halo|hai|hi|hello|selamat\s(pagi|siang|sore|malam)|assalamu|permisi)/,
    )
  ) {
    return `Halo juga! 👋 Senang bertemu denganmu!\n\nSaya NEO-Bot, asisten virtual NEO-SARANA. Saya bisa bantu informasi cepat seputar alur pelaporan sarana/prasarana.\n\nTopik template yang tersedia:\n• 📝 Panduan buat laporan\n• 🔍 Cek status tiket\n• 📋 Daftar kategori laporan\n• ⏱️ Estimasi waktu proses\n• ✅ Syarat laporan valid\n• 📸 Aturan upload foto\n• 🆘 Laporan darurat`;
  }

  if (
    (lower.includes("cara") ||
      lower.includes("langkah") ||
      lower.includes("bagaimana") ||
      lower.includes("gimana")) &&
    (lower.includes("laporan") ||
      lower.includes("pengaduan") ||
      lower.includes("aspirasi") ||
      lower.includes("buat") ||
      lower.includes("kirim"))
  ) {
    return `Berikut langkah lengkap membuat laporan di NEO-SARANA:\n\n1️⃣ Pastikan kamu sudah **login** dengan akun NIPD\n2️⃣ Buka tab 📋 **Buat Laporan** di area chat\n3️⃣ Pilih **kategori** yang sesuai\n4️⃣ Isi **judul**, **lokasi**, dan **deskripsi** masalah dengan jelas\n5️⃣ Upload **foto before** (opsional tapi sangat disarankan)\n6️⃣ Klik **Kirim Laporan**\n\n✅ Setelah terkirim, kamu mendapat **nomor tiket** untuk tracking.\n\n💡 Untuk melihat penanganan yang sudah selesai dari siswa lain, buka halaman **Public Feed**.`;
  }

  if (
    lower.includes("status") ||
    lower.includes("cek") ||
    lower.includes("lacak") ||
    lower.includes("tracking") ||
    lower.includes("track") ||
    lower.includes("progres") ||
    (lower.includes("lihat") && lower.includes("laporan"))
  ) {
    return `Cara cek status tiket laporan:\n\n🔍 **Lewat nomor tiket:**\n• Gunakan nomor tiket yang kamu dapat setelah kirim laporan\n\n📂 **Lewat menu aplikasi:**\n• Buka **Riwayat User** untuk melihat riwayat percakapan\n• Buka **Aspirasi Selesai** untuk daftar laporan yang sudah selesai\n\n📊 **Status tiket:**\n• 🟡 **Pending** — menunggu review admin\n• 🔵 **Dalam Progres** — sedang ditangani\n• 🟢 **Selesai** — pekerjaan selesai + bukti foto after\n\n💡 Update status juga muncul lewat notifikasi otomatis.`;
  }

  if (
    lower.includes("kategori") ||
    lower.includes("jenis") ||
    lower.includes("macam") ||
    (lower.includes("apa") &&
      lower.includes("saja") &&
      lower.includes("pengaduan"))
  ) {
    return `Kategori pengaduan yang tersedia di NEO-SARANA:\n\n📚 **Sarana Belajar**\n   Meja, kursi, proyektor, papan tulis, dll.\n\n🔧 **Prasarana Fisik**\n   Atap bocor, pintu rusak, lantai retak, dll.\n\n🧹 **Kebersihan**\n   Kamar mandi kotor, sampah menumpuk, dll.\n\n📷 **Keamanan**\n   CCTV mati, lampu lorong padam, pagar rusak, dll.\n\n💡 Pilih kategori yang paling sesuai agar laporan dapat ditangani lebih cepat!`;
  }

  if (
    lower.includes("lama") ||
    lower.includes("durasi") ||
    lower.includes("estimasi") ||
    (lower.includes("berapa") &&
      (lower.includes("hari") ||
        lower.includes("waktu") ||
        lower.includes("lama") ||
        lower.includes("proses"))) ||
    (lower.includes("waktu") && lower.includes("penanganan"))
  ) {
    return `Estimasi waktu penanganan laporan di NEO-SARANA:\n\n🕐 **Review Admin:** 1 × 24 jam kerja\n🔧 **Proses Pengerjaan:** 3 – 7 hari kerja\n   *(tergantung tingkat kesulitan & ketersediaan sumber daya)*\n✅ **Verifikasi Selesai:** 1 – 2 hari kerja\n\n📱 Kamu akan mendapat notifikasi **real-time** setiap ada update dari admin!\n\n🚨 Laporan dengan kategori **keamanan/keselamatan** akan diprioritaskan.`;
  }

  if (
    lower.includes("syarat") ||
    lower.includes("persyaratan") ||
    lower.includes("ketentuan") ||
    lower.includes("wajib") ||
    (lower.includes("apa") &&
      lower.includes("saja") &&
      lower.includes("syarat"))
  ) {
    return `Syarat laporan agar valid dan cepat diproses:\n\n✅ **Login wajib** menggunakan akun NIPD aktif\n📝 **Isi data utama lengkap**: kategori, judul, lokasi, deskripsi\n📸 **Foto pendukung disarankan** agar admin lebih cepat validasi\n📍 **Lokasi harus spesifik** (gedung/lantai/ruang)\n\n⚠️ Laporan yang tidak jelas, duplikat, atau tidak relevan bisa ditolak admin.\n\nSemakin lengkap laporanmu, semakin cepat ditindaklanjuti.`;
  }

  if (
    lower.includes("foto") ||
    lower.includes("gambar") ||
    lower.includes("before") ||
    lower.includes("after") ||
    lower.includes("upload")
  ) {
    return `Aturan foto laporan:\n\n📸 **Foto Before (user):**\n• Upload saat membuat laporan\n• Ambil sudut yang jelas, fokus ke kerusakan\n• Hindari blur/gelap agar validasi cepat\n\n🛠️ **Foto After (admin):**\n• Diunggah admin saat status selesai\n• Menjadi bukti hasil penanganan di tiket\n\n💡 Kamu bisa melihat hasil akhir juga di menu **Aspirasi Selesai** dan **Public Feed**.`;
  }

  if (
    lower.includes("darurat") ||
    lower.includes("urgent") ||
    lower.includes("bahaya") ||
    lower.includes("prioritas")
  ) {
    return `Untuk kondisi darurat (berpotensi membahayakan):\n\n1️⃣ Buat laporan dengan judul yang jelas dan beri kata **DARURAT**\n2️⃣ Pilih kategori paling sesuai (umumnya **Keamanan** atau **Prasarana Fisik**)\n3️⃣ Jelaskan risiko yang terjadi (contoh: kabel terbuka, plafon rawan jatuh)\n4️⃣ Upload foto pendukung\n\n🚨 Laporan darurat diprioritaskan untuk review lebih cepat oleh admin.`;
  }

  if (
    lower.includes("login") ||
    lower.includes("masuk") ||
    lower.includes("akun") ||
    lower.includes("nipd") ||
    lower.includes("daftar")
  ) {
    return `Informasi Login di NEO-SARANA:\n\n🔑 **Cara Login:**\n• Klik tombol **"Login NIPD"** di halaman utama\n• Masukkan **Nomor Induk Peserta Didik (NIPD)** sebagai username\n• Masukkan **password** yang sudah terdaftar\n\n👤 **Akun belum ada?**\nHubungi operator atau admin sekolah untuk pendaftaran akun NIPD.\n\n🔒 Keamanan akun sepenuhnya terjaga. Jangan bagikan kredensialmu!`;
  }

  if (
    lower.includes("terima kasih") ||
    lower.includes("makasih") ||
    lower.includes("thanks") ||
    lower.includes("thx") ||
    lower.includes("tengkyu")
  ) {
    return `Sama-sama! 😊 Senang bisa membantu!\n\nJika ada pertanyaan lain, jangan ragu untuk bertanya kapan saja. Saya selalu siap membantu! 🤝\n\nSemoga masalah sarana & prasaramu segera tertangani! 💪`;
  }

  return `Terima kasih atas pertanyaanmu! 😊\n\nSaya belum menemukan jawaban spesifik untuk pertanyaan itu. Kamu bisa pilih template berikut agar jawabannya lebih akurat:\n\n• 📝 **Panduan buat laporan**\n• 🔍 **Cek status tiket**\n• 📋 **Daftar kategori laporan**\n• ⏱️ **Estimasi waktu proses**\n• ✅ **Syarat laporan valid**\n• 📸 **Aturan upload foto**\n• 🆘 **Laporan darurat**\n\nKetik bebas juga boleh, nanti saya coba autocorrect ke template terdekat.`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function MessageContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={line === "" ? "h-2" : ""}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-semibold text-white">
                  {part}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/5 shadow-sm flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── Mode ──────────────────────────────────────
  const [chatMode, setChatMode] = useState<ChatMode>("bot");

  // ── Bot chat state ────────────────────────────
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── Custom chat state ─────────────────────────
  const [customChats, setCustomChats] = useState<CustomChat[]>([]);
  const [selectedCustomChatId, setSelectedCustomChatId] = useState<
    number | null
  >(null);
  const [customMessages, setCustomMessages] = useState<CustomChatMessage[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [isSendingCustom, setIsSendingCustom] = useState(false);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [customUploadUrl, setCustomUploadUrl] = useState<string | null>(null);
  const [isUploadingCustomPhoto, setIsUploadingCustomPhoto] = useState(false);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(
    null,
  );

  // ── Laporan state ─────────────────────────────
  const [laporanStep, setLaporanStep] = useState<LaporanStep>(-1);
  const [laporanData, setLaporanData] = useState({
    kategori: "",
    judul: "",
    lokasi: "",
    deskripsi: "",
    foto: [] as File[],
  });
  const [laporanMessages, setLaporanMessages] = useState<LaporanMsg[]>([]);
  const [laporanInput, setLaporanInput] = useState("");
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [isSubmittingLaporan, setIsSubmittingLaporan] = useState(false);
  const [isLaporanTyping, setIsLaporanTyping] = useState(false);
  const [laporanSuccess, setLaporanSuccess] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [aspirasiHistory, setAspirasiHistory] = useState<AspirasiHistory[]>([]);
  const [selectedLaporanHistoryId, setSelectedLaporanHistoryId] = useState<number | null>(null);
  const [selectedLaporanItem, setSelectedLaporanItem] = useState<AspirasiHistory | null>(null);
  const [laporanRating, setLaporanRating] = useState(0);
  const [laporanFeedbackText, setLaporanFeedbackText] = useState("");
  const [isSubmittingLaporanFeedback, setIsSubmittingLaporanFeedback] = useState(false);

  // ── UI ────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const isSidebarCollapsed = !isSidebarOpen;

  // ── Refs ──────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const laporanTextInputRef = useRef<HTMLInputElement>(null);
  const laporanTextareaRef = useRef<HTMLTextAreaElement>(null);
  const customInputRef = useRef<HTMLTextAreaElement>(null);
  const customFileInputRef = useRef<HTMLInputElement>(null);
  const laporanFileInputRef = useRef<HTMLInputElement>(null);
  const isInitializingRef = useRef(false);
  const pusherRef = useRef<PusherJs | null>(null);
  const channelRef = useRef<ReturnType<PusherJs["subscribe"]> | null>(null);
  const userChannelRef = useRef<ReturnType<PusherJs["subscribe"]> | null>(null);

  // ─────────────────────────────────────────────
  // Auth guard
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const syncViewport = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);
      setIsSidebarOpen(!mobile);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  // ─────────────────────────────────────────────
  // Load data on auth
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (status === "authenticated") {
      loadChats();
      loadCustomChats();
      loadAspirasiHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ─────────────────────────────────────────────
  // Pusher for user updates (progress/status/photo) — no refresh needed
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;
    if (!session?.user?.id) return;

    if (!pusherRef.current) {
      pusherRef.current = new PusherJs(pusherKey, { cluster: pusherCluster });
    }

    const channelName = `user-${session.user.id}`;
    const channel = pusherRef.current.subscribe(channelName);
    userChannelRef.current = channel;

    channel.bind("aspirasi-updated", async () => {
      await loadAspirasiHistory();
    });

    return () => {
      channel.unbind("aspirasi-updated");
      pusherRef.current?.unsubscribe(channelName);
      userChannelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id]);

  // ─────────────────────────────────────────────
  // Auto-scroll
  // ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, laporanMessages, isLaporanTyping, customMessages]);

  // ─────────────────────────────────────────────
  // Load bot chat messages when chat changes
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (currentChatId) loadChatMessages(currentChatId);
  }, [currentChatId]);

  // ─────────────────────────────────────────────
  // Laporan state persistence
  // ─────────────────────────────────────────────
  const saveLaporanState = useCallback(() => {
    try {
      // File objects cannot be serialized, so we only store metadata
      const state = {
        laporanStep,
        laporanData: {
          ...laporanData,
          foto: [], // Don't serialize File objects
        },
        laporanMessages,
        laporanInput,
        fotoPreviews,
        laporanSuccess,
        fotoCount: laporanData.foto.length, // Store count for reference
      };
      sessionStorage.setItem("laporan_state", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save laporan state:", e);
    }
  }, [laporanStep, laporanData, laporanMessages, laporanInput, fotoPreviews, laporanSuccess]);

  const restoreLaporanState = useCallback(() => {
    try {
      const saved = sessionStorage.getItem("laporan_state");
      if (saved) {
        const state = JSON.parse(saved);
        setLaporanStep(state.laporanStep ?? 0);
        setLaporanData({
          kategori: state.laporanData?.kategori ?? "",
          judul: state.laporanData?.judul ?? "",
          lokasi: state.laporanData?.lokasi ?? "",
          deskripsi: state.laporanData?.deskripsi ?? "",
          foto: [], // Files stay in memory, not restored from storage
        });
        setLaporanMessages(state.laporanMessages ?? []);
        setLaporanInput(state.laporanInput ?? "");
        setFotoPreviews(state.fotoPreviews ?? []);
        setLaporanSuccess(state.laporanSuccess ?? null);
        return true;
      }
    } catch (e) {
      console.error("Failed to restore laporan state:", e);
    }
    return false;
  }, []);

  // Save laporan state whenever it changes
  useEffect(() => {
    if (chatMode === "laporan") {
      saveLaporanState();
    }
  }, [laporanStep, laporanData, laporanMessages, laporanInput, fotoPreviews, laporanSuccess, chatMode, saveLaporanState]);

  // ─────────────────────────────────────────────
  // Init laporan mode
  // ─────────────────────────────────────────────
  // Try to restore state first; if no saved state, init fresh
  useEffect(() => {
    if (chatMode === "laporan" && laporanMessages.length === 0) {
      const restored = restoreLaporanState();
      if (!restored) {
        initLaporanMode();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMode]);

  // ─────────────────────────────────────────────
  // Pusher for custom chat
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCustomChatId) {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current = null;
      }
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    if (!pusherRef.current) {
      pusherRef.current = new PusherJs(pusherKey, { cluster: pusherCluster });
    }

    if (channelRef.current) {
      channelRef.current.unbind_all();
    }

    const channelName = `custom-chat-${selectedCustomChatId}`;
    const channel = pusherRef.current.subscribe(channelName);
    channel.bind("new-message", (data: { message: CustomChatMessage }) => {
      setCustomMessages((prev) => {
        const exists = prev.some((m) => m.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    });
    channelRef.current = channel;

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [selectedCustomChatId]);

  // ─────────────────────────────────────────────
  // Custom chat polling (sidebar) every 15s
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;
    const interval = setInterval(loadCustomChats, 15_000);
    return () => clearInterval(interval);
  }, [status]);

  const templateSuggestions = useMemo(() => {
    const keyword = input.trim();
    if (!keyword) return TEMPLATE_QUESTIONS.slice(0, 4);
    return TEMPLATE_QUESTIONS.map((item) => ({
      ...item,
      score: getTemplateScore(keyword, item.query),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [input]);

  // ─────────────────────────────────────────────
  // Bot Chat Functions
  // ─────────────────────────────────────────────
  const loadChats = async () => {
    try {
      const res = await fetch("/api/chat");
      if (!res.ok) return;
      const data = await res.json();
      setChats(data.chats ?? []);
      if (data.chats?.length > 0) {
        setCurrentChatId(data.chats[0].id);
      } else if (!isInitializingRef.current) {
        isInitializingRef.current = true;
        await createNewChatInternal();
      }
    } catch (err) {
      console.error("Error loading chats:", err);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/chat/${chatId}`);
      if (!res.ok) return;
      const data = await res.json();
      const chatMessages = data.chat.messages ?? [];
      if (chatMessages.length === 0) {
        const welcomeMsg: ChatMessage = {
          role: "assistant",
          konten: WELCOME_MESSAGE,
        };
        setMessages([welcomeMsg]);
        await saveMessage(chatId, "assistant", WELCOME_MESSAGE);
      } else {
        setMessages(chatMessages);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const saveMessage = async (chatId: number, role: string, konten: string) => {
    await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, konten }),
    });
  };

  const updateChatTitle = async (chatId: number, title: string) => {
    try {
      await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: title }),
      }).catch(() => {});
    } catch {
      /* optional */
    }
  };

  const createNewChatInternal = useCallback(async (): Promise<Chat | null> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: "Chat Baru" }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newChat: Chat = data.chat;
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      const welcomeMsg: ChatMessage = {
        role: "assistant",
        konten: WELCOME_MESSAGE,
      };
      setMessages([welcomeMsg]);
      await saveMessage(newChat.id, "assistant", WELCOME_MESSAGE);
      return newChat;
    } catch (err) {
      console.error("Error creating chat:", err);
      return null;
    }
  }, []);

  const createNewChat = async () => {
    if (chatMode === "laporan") {
      // Reset form laporan and clear session storage
      sessionStorage.removeItem("laporan_state");
      initLaporanMode();
      return;
    }
    if (chatMode === "custom") {
      // Buat custom chat baru
      handleNewCustomChat();
      return;
    }
    // Bot mode: buat chat baru
    setMessages([]);
    await createNewChatInternal();
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSend = async (overrideText?: string) => {
    const originalText = (overrideText ?? input).trim();
    const bestTemplate = TEMPLATE_QUESTIONS.map((item) => ({
      ...item,
      score: getTemplateScore(originalText, item.query),
    })).sort((a, b) => b.score - a.score)[0];
    const shouldAutoCorrect =
      !overrideText && !!bestTemplate && bestTemplate.score >= 0.84;
    const text = shouldAutoCorrect ? bestTemplate.query : originalText;
    if (!text || !currentChatId || isLoading) return;
    setIsLoading(true);
    if (!overrideText) setInput("");
    const userMsg: ChatMessage = { role: "user", konten: text };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const isFirstUserMessage =
        messages.filter((m) => m.role === "user").length === 0;
      if (isFirstUserMessage) {
        const shortTitle = text.length > 40 ? text.slice(0, 40) + "..." : text;
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId ? { ...c, judul: shortTitle } : c,
          ),
        );
        await updateChatTitle(currentChatId, shortTitle);
      }
      await saveMessage(currentChatId, "user", text);
      setIsTyping(true);
      const delay = 700 + Math.random() * 600;
      setTimeout(async () => {
        setIsTyping(false);
        const autoCorrectInfo =
          shouldAutoCorrect && text !== originalText
            ? `Saya autocorrect pertanyaanmu ke template terdekat: **${bestTemplate.label}**.\n\n`
            : "";
        const botKonten = `${autoCorrectInfo}${getBotResponse(text)}`;
        const botMsg: ChatMessage = { role: "assistant", konten: botKonten };
        setMessages((prev) => [...prev, botMsg]);
        try {
          await saveMessage(currentChatId, "assistant", botKonten);
        } catch (err) {
          console.error("Error saving bot message:", err);
        }
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, delay);
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const deleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
      if (!res.ok) return;
      const remaining = chats.filter((c) => c.id !== chatId);
      setChats(remaining);
      if (currentChatId === chatId) {
        if (remaining.length > 0) {
          setCurrentChatId(remaining[0].id);
        } else {
          setCurrentChatId(null);
          setMessages([]);
          isInitializingRef.current = false;
          await createNewChatInternal();
        }
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  // ─────────────────────────────────────────────
  // Custom Chat Functions
  // ─────────────────────────────────────────────
  const loadCustomChats = async () => {
    try {
      const res = await fetch("/api/custom-chat");
      if (!res.ok) return;
      const data = await res.json();
      setCustomChats(data.customChats ?? []);
    } catch (err) {
      console.error("Error loading custom chats:", err);
    }
  };

  const loadAspirasiHistory = async () => {
    try {
      const res = await fetch("/api/aspirasi");
      if (!res.ok) return;
      const data = await res.json();
      setAspirasiHistory(data.aspirasi ?? []);
    } catch (err) {
      console.error("Error loading aspirasi history:", err);
    }
  };

  const openLaporanHistory = (item: AspirasiHistory) => {
    const getSavedThread = (ticket: string): LaporanMsg[] => {
      try {
        const raw = localStorage.getItem(LAPORAN_THREADS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Record<string, LaporanMsg[]>;
        const thread = parsed[ticket];
        return Array.isArray(thread) ? thread : [];
      } catch {
        return [];
      }
    };

    const savedMessages = getSavedThread(item.nomor_tiket);
    const progressMessages: LaporanMsg[] = (item.progres_updates ?? []).map((p) => ({
      role: "bot",
      content: `🔔 **Update Admin** (${new Date(p.tanggal_update).toLocaleString("id-ID")}):\n${p.deskripsi_update}${p.admin?.nama ? `\n\n— ${p.admin.nama}` : ""}`,
    }));

    const firstProgressTime =
      item.progres_updates && item.progres_updates.length > 0
        ? item.progres_updates[0].tanggal_update
        : item.tanggal_input;
    const timelineMessages: LaporanMsg[] = [
      {
        role: "bot",
        content: `🧾 Tiket **${item.nomor_tiket}** berhasil dibuat pada ${new Date(item.tanggal_input).toLocaleString("id-ID")} dan menunggu konfirmasi admin.`,
      },
      ...(item.status !== "pending"
        ? [
            {
              role: "bot" as const,
              content: `✅ Tiket dikonfirmasi admin pada ${new Date(firstProgressTime).toLocaleString("id-ID")} dan masuk tahap **dalam proses**.`,
            },
          ]
        : []),
    ];

    const completionMessages: LaporanMsg[] =
      item.status === "selesai"
        ? [
            {
              role: "bot",
              content: `📋 **Rangkuman Laporan**\n\n🎫 **Nomor Tiket:** ${item.nomor_tiket}\n📝 **Judul:** ${item.judul}\n📍 **Lokasi:** ${item.lokasi}\n📌 **Status:** ${item.status}`,
            },
            ...(item.foto_before
              ? [
                  {
                    role: "bot" as const,
                    content: "📷 **Foto Before** (foto awal dari pelapor):",
                    imageUrl: item.foto_before,
                  },
                ]
              : []),
            ...(item.foto_after
              ? [
                  {
                    role: "bot" as const,
                    content: "✅ **Foto After** (hasil perbaikan dari admin):",
                    imageUrl: item.foto_after,
                  },
                ]
              : []),
          ]
        : [];

    setSelectedLaporanHistoryId(item.id);
    setSelectedLaporanItem(item);
    setLaporanRating(item.rating ?? 0);
    setLaporanFeedbackText(item.feedback ?? "");
    setChatMode("laporan");
    setLaporanStep(-1);
    setLaporanData({
      kategori: "",
      judul: item.judul,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi,
      foto: [],
    });
    const merged =
      savedMessages.length > 0
        ? [...savedMessages, ...timelineMessages, ...progressMessages, ...completionMessages]
        : [...timelineMessages, ...progressMessages, ...completionMessages];
    const deduped = merged.filter(
      (msg, idx, arr) =>
        arr.findIndex(
          (x) => x.content === msg.content && (x.imageUrl ?? "") === (msg.imageUrl ?? ""),
        ) === idx,
    );
    setLaporanMessages(deduped);
    setLaporanSuccess(item.nomor_tiket);
    setFotoPreviews([]);
    setLaporanInput("");
  };

  const saveLaporanThread = (ticket: string, msgs: LaporanMsg[]) => {
    try {
      const raw = localStorage.getItem(LAPORAN_THREADS_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, LaporanMsg[]>) : {};
      parsed[ticket] = msgs;
      localStorage.setItem(LAPORAN_THREADS_KEY, JSON.stringify(parsed));
    } catch (err) {
      console.error("Failed to save laporan thread:", err);
    }
  };

  const handleSelectCustomChat = async (chatId: number) => {
    setChatMode("custom");
    setSelectedCustomChatId(chatId);
    setIsLoadingCustom(true);
    try {
      const res = await fetch(`/api/custom-chat/${chatId}`);
      if (!res.ok) return;
      const data = await res.json();
      setCustomMessages(data.customChat.messages ?? []);
    } catch (err) {
      console.error("Error loading custom chat:", err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const handleNewCustomChat = () => {
    setChatMode("custom");
    setSelectedCustomChatId(null);
    setCustomMessages([]);
    setCustomInput("");
    setCustomUploadUrl(null);
    setCustomPhotoPreview(null);
  };

  const handleSendCustomMessage = async () => {
    const text = customInput.trim();
    if ((!text && !customUploadUrl) || isSendingCustom) return;
    setIsSendingCustom(true);
    const sentText = text;
    const sentPhoto = customUploadUrl;
    setCustomInput("");
    setCustomUploadUrl(null);
    setCustomPhotoPreview(null);

    try {
      // ── Buat chat baru jika belum ada ──────────────────────
      let chatId = selectedCustomChatId;
      if (!chatId) {
        const autoTitle =
          sentText.length > 55
            ? sentText.slice(0, 55) + "…"
            : sentText || "Chat Baru";
        const createRes = await fetch("/api/custom-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            judul: autoTitle,
            pesan_awal: sentText || "[Foto]",
            foto_url: sentPhoto || undefined,
          }),
        });
        if (!createRes.ok) throw new Error("Gagal membuat chat");
        const createData = await createRes.json();
        const newChat = createData.customChat;
        chatId = newChat.id;
        setCustomChats((prev) => [newChat, ...prev]);
        setSelectedCustomChatId(chatId);
        setCustomMessages(newChat.messages ?? []);
        setIsSendingCustom(false);
        setTimeout(() => customInputRef.current?.focus(), 100);
        return;
      }

      // ── Kirim pesan ke chat yang sudah ada ─────────────────
      const res = await fetch(`/api/custom-chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          konten: sentText || "[Foto]",
          foto_url: sentPhoto || undefined,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengirim pesan");
      const data = await res.json();
      setCustomMessages((prev) => {
        const exists = prev.some((m) => m.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    } catch (err) {
      console.error("Error sending custom message:", err);
    } finally {
      setIsSendingCustom(false);
      setTimeout(() => customInputRef.current?.focus(), 100);
    }
  };

  const handleCustomPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsUploadingCustomPhoto(true);
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Upload
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCustomUploadUrl(data.url);
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      setCustomPhotoPreview(null);
    } finally {
      setIsUploadingCustomPhoto(false);
    }
  };

  const handleCustomFormKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendCustomMessage();
    }
  };

  // ─────────────────────────────────────────────
  // Laporan Functions
  // ─────────────────────────────────────────────
  const initLaporanMode = () => {
    setSelectedLaporanHistoryId(null);
    setSelectedLaporanItem(null);
    setLaporanRating(0);
    setLaporanFeedbackText("");
    setLaporanStep(-1);
    setLaporanData({
      kategori: "",
      judul: "",
      lokasi: "",
      deskripsi: "",
      foto: [],
    });
    setLaporanMessages([
      {
        role: "bot",
        content: `Halo! 👋 Saya akan bantu proses laporan pengaduan sarana & prasarana.\n\nApakah kamu ingin **mengajukan laporan baru** sekarang?`,
      },
    ]);
    setLaporanInput("");
    setFotoPreviews([]);
    setLaporanSuccess(null);
    setIsLaporanTyping(false);
  };

  const addBotLaporanMsg = (content: string, delay = 450) => {
    setIsLaporanTyping(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsLaporanTyping(false);
        setLaporanMessages((prev) => [...prev, { role: "bot", content }]);
        resolve();
      }, delay);
    });
  };

  const handleSelectKategori = async (kategori: string) => {
    setLaporanData((prev) => ({ ...prev, kategori }));
    setLaporanMessages((prev) => [
      ...prev,
      { role: "user", content: `Kategori: ${kategori}` },
    ]);
    await addBotLaporanMsg(
      `Kategori **${kategori}** dipilih! ✅\n\nSekarang, berikan **judul** laporan yang singkat dan jelas.\n\n_Contoh: "AC rusak di Lab Komputer"_`,
    );
    setLaporanStep(1);
    setTimeout(() => laporanTextInputRef.current?.focus(), 100);
  };

  const handleLaporanIntent = async (shouldCreate: boolean) => {
    setLaporanMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: shouldCreate ? "Ya, saya ingin mengajukan laporan." : "Belum, tidak sekarang.",
      },
    ]);

    if (!shouldCreate) {
      await addBotLaporanMsg(
        "Baik, tidak masalah. Kalau sudah siap membuat laporan, klik **Buat Laporan** lagi kapan saja ya.",
      );
      setLaporanStep(-1);
      return;
    }

    await addBotLaporanMsg(
      "Siap! ✅\n\nSilakan pilih **kategori** masalah yang ingin kamu laporkan:",
    );
    setLaporanStep(0);
  };

  const handleLaporanTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = laporanInput.trim();
    if (!value) return;

    if (laporanStep === 3 && value.length < 20) return; // min 20 chars

    setLaporanInput("");
    setLaporanMessages((prev) => [...prev, { role: "user", content: value }]);

    if (laporanStep === 1) {
      setLaporanData((prev) => ({ ...prev, judul: value }));
      await addBotLaporanMsg(
        `Judul **"${value}"** tercatat! ✅\n\nSekarang masukkan **lokasi** yang lebih spesifik.\n\n_Contoh: "Gedung B, Lantai 2, Ruang 201"_`,
      );
      setLaporanStep(2);
    } else if (laporanStep === 2) {
      setLaporanData((prev) => ({ ...prev, lokasi: value }));
      await addBotLaporanMsg(
        `Lokasi **${value}** tercatat! ✅\n\nJelaskan **detail masalah** dengan lengkap (minimal 20 karakter):`,
      );
      setLaporanStep(3);
      setTimeout(() => laporanTextareaRef.current?.focus(), 100);
    } else if (laporanStep === 3) {
      setLaporanData((prev) => ({ ...prev, deskripsi: value }));
      await addBotLaporanMsg(
        `Deskripsi tercatat! ✅\n\nTambahkan **foto bukti** kondisi yang bermasalah (opsional, maks. 3 foto):\n\n📷 Foto membantu admin memahami & menangani masalah lebih cepat.`,
      );
      setLaporanStep(4);
    }

    setTimeout(() => laporanTextInputRef.current?.focus(), 100);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    setLaporanData((prev) => ({ ...prev, foto: files }));
    if (files.length === 0) {
      setFotoPreviews([]);
      return;
    }
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) =>
              resolve((ev.target?.result as string) ?? "");
            reader.readAsDataURL(file);
          }),
      ),
    ).then(setFotoPreviews);
  };

  const handleLaporanFotoNext = async () => {
    const count = laporanData.foto.length;
    const userContent =
      count > 0
        ? `Foto dilampirkan: ${count} file 📎`
        : "Melanjutkan tanpa foto";
    setLaporanMessages((prev) => [
      ...prev,
      { role: "user", content: userContent },
    ]);

    // We need access to the latest laporanData, but since we already updated it,
    // we read it from the current state closure (it might be stale for foto, use count/files directly)
    const currentData = { ...laporanData };
    await addBotLaporanMsg(
      `📋 **Ringkasan Laporan:**\n\n📌 **Kategori:** ${currentData.kategori}\n📝 **Judul:** ${currentData.judul}\n📍 **Lokasi:** ${currentData.lokasi}\n📄 **Deskripsi:** ${currentData.deskripsi}${count > 0 ? `\n📷 **Foto:** ${count} file dilampirkan` : "\n📷 **Foto:** Tidak ada"}\n\nSilakan konfirmasi untuk mengirimkan laporan kamu:`,
    );
    setLaporanStep(5);
  };

  const handleSubmitLaporan = async () => {
    setIsSubmittingLaporan(true);
    const ticket = generateTicket();
    try {
      const formData = new FormData();
      formData.append("judul", laporanData.judul);
      formData.append("lokasi", laporanData.lokasi);
      formData.append("deskripsi", laporanData.deskripsi);
      formData.append("nomor_tiket", ticket);
      formData.append("kategori_id", "1");
      formData.append("riwayat_chat", JSON.stringify(laporanMessages));
      laporanData.foto.forEach((f) => formData.append("foto", f));

      const res = await fetch("/api/aspirasi", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim laporan");

      const nomor = data.nomor_tiket ?? ticket;
      setLaporanSuccess(nomor);
      setLaporanMessages((prev) => [
        ...prev,
        ...(data.aspirasi?.foto_before
          ? [
              {
                role: "bot" as const,
                content: "📷 Foto laporan kamu sudah terkirim ke admin:",
                imageUrl: data.aspirasi.foto_before as string,
              },
            ]
          : []),
        {
          role: "bot" as const,
          content: `🎉 **Laporan berhasil dikirim!**\n\nNomor tiket kamu:\n**${nomor}**\n\nRiwayat percakapan laporan ini sudah disimpan dan tetap berada di tab **Buat Laporan**.\n\nTerima kasih telah melaporkan! 🙏`,
        },
      ]);
      const finalMessages: LaporanMsg[] = [
        ...laporanMessages,
        ...(data.aspirasi?.foto_before
          ? [
              {
                role: "bot" as const,
                content: "📷 Foto laporan kamu sudah terkirim ke admin:",
                imageUrl: data.aspirasi.foto_before as string,
              },
            ]
          : []),
        {
          role: "bot" as const,
          content: `🎉 **Laporan berhasil dikirim!**\n\nNomor tiket kamu:\n**${nomor}**\n\nRiwayat percakapan laporan ini sudah disimpan dan tetap berada di tab **Buat Laporan**.\n\nTerima kasih telah melaporkan! 🙏`,
        },
      ];
      saveLaporanThread(nomor, finalMessages);
      await loadAspirasiHistory();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      
      // Clear laporan state after successful submission
      sessionStorage.removeItem("laporan_state");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setLaporanMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `❌ **Gagal mengirim laporan.**\n\n${msg}\n\nSilakan coba lagi.`,
        },
      ]);
    } finally {
      setIsSubmittingLaporan(false);
    }
  };

  const handleLaporanFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = laporanInput.trim();
    if (!text) return;
    setLaporanInput("");
    setLaporanMessages((prev) => [...prev, { role: "user", content: text }]);
    await addBotLaporanMsg(
      `Pesanmu terkait laporan **${laporanSuccess ?? ""}** sudah dicatat.\n\nKamu bisa lanjutkan percakapan di tab **Buat Laporan** ini kapan saja.`,
      350,
    );
    if (laporanSuccess) {
      setLaporanMessages((prev) => {
        saveLaporanThread(laporanSuccess, prev);
        return prev;
      });
    }
  };

  const handleSubmitLaporanFeedback = async () => {
    if (
      !selectedLaporanItem ||
      selectedLaporanItem.status !== "selesai" ||
      laporanRating < 1 ||
      selectedLaporanItem.rating
    ) {
      return;
    }
    setIsSubmittingLaporanFeedback(true);
    try {
      const res = await fetch(`/api/aspirasi/${selectedLaporanItem.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: laporanRating,
          feedback: laporanFeedbackText.trim(),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan feedback");
      setSelectedLaporanItem((prev) =>
        prev ? { ...prev, rating: laporanRating, feedback: laporanFeedbackText.trim() || null } : prev,
      );
      setLaporanMessages((prev) => {
        const thanksMsg = `Terima kasih! ⭐ Penilaian ${laporanRating}/5 dan feedback kamu sudah tersimpan.`;
        const alreadyExists = prev.some((m) => m.content === thanksMsg);
        if (alreadyExists) return prev;
        return [
          ...prev,
          {
            role: "bot",
            content: thanksMsg,
          },
        ];
      });
      await loadAspirasiHistory();
    } catch (err) {
      setLaporanMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `❌ Gagal menyimpan rating/feedback. Coba lagi ya.`,
        },
      ]);
      console.error("Error submitting laporan feedback:", err);
    } finally {
      setIsSubmittingLaporanFeedback(false);
    }
  };

  const handleLogout = async () => {
    const ok = window.confirm("Yakin ingin logout?");
    if (!ok) return;
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  // ─────────────────────────────────────────────
  // Loading / Unauth states
  // ─────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Memuat sesi...</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  const selectedCustomChat = customChats.find(
    (c) => c.id === selectedCustomChatId,
  );
  const showAdminWaitingIndicator =
    !!selectedCustomChatId &&
    !isLoadingCustom &&
    selectedCustomChat?.status !== "closed" &&
    customMessages.length > 0 &&
    customMessages[customMessages.length - 1]?.sender_role === "user";

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Confetti */}
      {showConfetti && <ConfettiEffect />}
      {isMobileViewport && isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/60"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className={`
          ${isSidebarOpen ? "w-[85vw] max-w-72 translate-x-0" : "w-[85vw] max-w-72 -translate-x-full md:w-20 md:translate-x-0"}
          transition-all duration-300 ease-in-out flex flex-col
          bg-slate-950/60 border-r border-white/5 backdrop-blur-xl
          absolute md:relative z-20 h-full shrink-0
        `}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Back link */}
          <Link
            href="/"
            className={`flex items-center mb-6 text-indigo-400 hover:text-indigo-300 transition-colors group ${isSidebarCollapsed ? "justify-center" : "gap-2 w-fit"}`}
            title="Kembali ke Beranda"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {!isSidebarCollapsed && (
              <span className="font-semibold tracking-wide">
                Kembali ke Beranda
              </span>
            )}
          </Link>
          {/* ── New Chat button ── */}
          <button
            onClick={createNewChat}
            className={`w-full p-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition-all active:scale-[0.98] shrink-0 ${isSidebarCollapsed ? "flex items-center justify-center" : "flex items-center gap-3 hover:scale-[1.02]"}`}
            title="Chat Baru"
          >
            <Plus className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-medium">Chat Baru</span>}
          </button>
          <div className="mt-3 mb-2 shrink-0">
            {!isSidebarCollapsed && (
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Navigasi Cepat
              </p>
            )}
            <div className="grid gap-2">
            <Link
              href="/riwayat"
              className={`rounded-xl border transition-all ${
                isSidebarCollapsed
                  ? "flex items-center justify-center p-2.5 border-indigo-400/40 bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/40"
                  : "flex items-center gap-2 p-2.5 border-indigo-400/40 bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/40"
              }`}
              title="Riwayat User"
            >
              <History className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Riwayat User</span>}
            </Link>
            <Link
              href="/aspirasi-selesai"
              className={`rounded-xl border transition-all ${
                isSidebarCollapsed
                  ? "flex items-center justify-center p-2.5 border-emerald-400/40 bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35"
                  : "flex items-center gap-2 p-2.5 border-emerald-400/40 bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35"
              }`}
              title="Aspirasi Selesai"
            >
              <CheckCircle className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Aspirasi Selesai</span>}
            </Link>
            </div>
          </div>

          {/* ── Unified History ── */}
          <div className="mt-4 shrink-0">
            {!isSidebarCollapsed ? (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                Riwayat
              </p>
            ) : (
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 text-center">
                List
              </p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
            {(() => {
              // Gabung bot chats + custom chats, urutkan by diperbarui_pada desc
              const botItems = chats.map((c) => ({
                type: "bot" as const,
                id: c.id,
                judul: c.judul,
                updatedAt: c.diperbarui_pada,
                status: undefined as string | undefined,
              }));
              const customItems = customChats.map((c) => ({
                type: "custom" as const,
                id: c.id,
                judul: c.aspirasi?.nomor_tiket
                  ? `${c.aspirasi.nomor_tiket} - ${c.judul}`
                  : c.judul,
                updatedAt: c.diperbarui_pada,
                status: c.status,
              }));
              const laporanItems = aspirasiHistory.map((a) => ({
                type: "laporan" as const,
                id: a.id,
                judul: `${a.nomor_tiket} - ${a.judul}`,
                updatedAt: a.tanggal_input,
                status: a.status,
              }));
              const allItems = [...botItems, ...customItems, ...laporanItems].sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              );

              if (allItems.length === 0) {
                return (
                  <p className="text-xs text-slate-600 px-2 py-2 text-center">
                    Belum ada riwayat chat
                  </p>
                );
              }

              return allItems.map((item) => {
                const isActive =
                  item.type === "bot"
                    ? chatMode === "bot" && currentChatId === item.id
                    : item.type === "custom"
                      ? chatMode === "custom" && selectedCustomChatId === item.id
                      : chatMode === "laporan" && selectedLaporanHistoryId === item.id;

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      if (item.type === "bot") {
                        setSelectedLaporanHistoryId(null);
                        setChatMode("bot");
                        setCurrentChatId(item.id);
                      } else if (item.type === "custom") {
                        setSelectedLaporanHistoryId(null);
                        handleSelectCustomChat(item.id);
                      } else {
                        const selected = aspirasiHistory.find((a) => a.id === item.id);
                        if (selected) openLaporanHistory(selected);
                      }
                      if (isMobileViewport) setIsSidebarOpen(false);
                    }}
                    title={item.judul}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-sm
                      transition-colors flex items-center group
                      ${
                        isActive
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "hover:bg-white/5 text-slate-300 border border-transparent"
                      }
                      ${isSidebarCollapsed ? "justify-center" : "text-left gap-2"}
                    `}
                  >
                    {/* Icon type */}
                    <span className="shrink-0 text-[11px]">
                      {item.type === "bot" ? "🤖" : item.type === "custom" ? "💬" : "📋"}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-[13px]">{item.judul}</span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isSidebarCollapsed && item.type !== "bot" && item.status && (
                        <StatusBadge status={item.status} size="xs" />
                      )}
                      {!isSidebarCollapsed && item.type === "bot" && (
                        <button
                          onClick={(e) => deleteChat(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
                          title="Hapus chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          {/* Dummy untuk kompatibilitas — custom chats sudah masuk ke unified history */}
          <div style={{ display: "none" }}>
            {customChats.length === 0 ? (
              <p className="text-xs text-slate-600 px-2 py-2 text-center">
                Belum ada custom chat
              </p>
            ) : (
              customChats.map((cc) => (
                <button
                  key={cc.id}
                  onClick={() => handleSelectCustomChat(cc.id)}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg text-sm
                    transition-colors flex flex-col gap-1
                    ${
                      chatMode === "custom" && selectedCustomChatId === cc.id
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "hover:bg-white/5 text-slate-300 border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate flex-1 text-xs font-medium">
                      {cc.judul}
                    </span>
                    <StatusBadge status={cc.status} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User info */}
          <div className="mt-auto pt-4 border-t border-white/5 shrink-0">
            <div
              className={`flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}
              title={session?.user?.name ?? "User"}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`mt-2 w-full p-2.5 rounded-lg border border-red-500/20 text-red-300 hover:text-white hover:bg-red-500/20 transition-colors ${isSidebarCollapsed ? "flex items-center justify-center" : "flex items-center gap-2.5"}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>

          {isSidebarCollapsed && (
            <div className="mt-3 text-[10px] text-slate-600 text-center">
              Mini Sidebar
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════ MAIN AREA ══════════════ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black">
        {/* Header */}
        <header className="h-16 flex items-center px-3 sm:px-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-sm z-10 sticky top-0 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors mr-2 sm:mr-4"
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${
                chatMode === "laporan"
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                  : chatMode === "custom"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
              }`}
            >
              {chatMode === "laporan" ? (
                <FileText className="w-5 h-5 text-white" />
              ) : chatMode === "custom" ? (
                <MessageSquare className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-none truncate">
                {chatMode === "laporan"
                  ? "Buat Laporan"
                  : chatMode === "custom"
                    ? selectedCustomChat
                      ? selectedCustomChat.aspirasi?.nomor_tiket
                        ? `${selectedCustomChat.aspirasi.nomor_tiket} - ${selectedCustomChat.judul}`
                        : selectedCustomChat.judul
                      : "Custom Chat"
                    : "NEO-Bot"}
              </h1>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                {chatMode === "laporan"
                  ? "Mode Laporan"
                  : chatMode === "custom"
                    ? selectedCustomChat
                      ? selectedCustomChat.aspirasi?.status
                        ? `Status tiket: ${selectedCustomChat.aspirasi.status}`
                        : `Status: ${selectedCustomChat.status}`
                      : "Tanya Admin"
                    : "Online"}
              </p>
            </div>
          </div>

          {/* Notification bell */}
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell role="user" />
          </div>
        </header>

        {/* ══ Messages area ══ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          {/* ── BOT MODE ── */}
          {chatMode === "bot" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {!currentChatId && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/5 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-slate-400 font-medium">Memuat chat...</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={msg.id ?? idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
                        : "bg-slate-800 border border-white/10"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-900/20"
                        : "bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-sm shadow-sm"
                    }`}
                  >
                    <MessageContent text={msg.konten} />
                  </div>
                </div>
              ))}

              {/* Template questions (always visible in NEO-Bot tab) */}
              <div className="pl-11 animate-fade-in">
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
                  Template Pertanyaan NEO-Bot
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_QUESTIONS.map((tq) => (
                    <button
                      key={tq.id}
                      onClick={() => handleSend(tq.query)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tq.label}
                    </button>
                  ))}
                </div>
              </div>

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── LAPORAN MODE ── */}
          {chatMode === "laporan" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {laporanMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      msg.role === "bot"
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                        : "bg-slate-800 border border-white/10"
                    }`}
                  >
                    {msg.role === "bot" ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-900/20"
                        : "bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageUrl}
                          alt="Lampiran laporan"
                          className="max-w-full max-h-64 object-cover w-full cursor-pointer"
                          onClick={() => window.open(msg.imageUrl!, "_blank")}
                        />
                      </div>
                    )}
                    <MessageContent text={msg.content} />
                  </div>
                </div>
              ))}

              {/* Category picker — step 0 */}
              {laporanStep === -1 && !laporanSuccess && (
                <div className="pl-11 animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleLaporanIntent(true)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-600/15 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      Ya, Ajukan Laporan
                    </button>
                    <button
                      onClick={() => handleLaporanIntent(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      Tidak Sekarang
                    </button>
                  </div>
                </div>
              )}

              {/* Category picker — step 0 */}
              {laporanStep === 0 && !laporanSuccess && (
                <div className="pl-11 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    {KATEGORI_OPTIONS.map((k) => (
                      <button
                        key={k.value}
                        onClick={() => handleSelectKategori(k.value)}
                        className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white hover:bg-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-left"
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Foto previews — step 4 */}
              {laporanStep === 4 && fotoPreviews.length > 0 && (
                <div className="pl-11 animate-fade-in">
                  <div className="flex gap-2 flex-wrap">
                    {fotoPreviews.map((src, i) => (
                      <div
                        key={i}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-md"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLaporanTyping && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/5 shadow-sm flex items-center gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── CUSTOM CHAT MODE ── */}
          {chatMode === "custom" && (
            <div className="max-w-3xl mx-auto h-full">
              {/* Loading */}
              {isLoadingCustom && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              )}

              {/* Welcome state — belum ada chat dipilih */}
              {!isLoadingCustom && !selectedCustomChatId && (
                <div className="flex flex-col items-center justify-center py-16 animate-fade-in text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-600/15 border border-white/8 flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/20">
                    <MessageSquare className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2">
                    Chat dengan Admin
                  </h2>
                  <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                    Ketik pesanmu di bawah. Admin akan membalas secepatnya dan
                    balasan akan muncul langsung di sini.
                  </p>
                  <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                    {customChats.length === 0 ? (
                      <p className="text-xs text-slate-600">
                        Belum ada percakapan sebelumnya.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-500 mb-1">
                          Atau lanjutkan percakapan sebelumnya:
                        </p>
                        {customChats.slice(0, 3).map((cc) => (
                          <button
                            key={cc.id}
                            onClick={() => handleSelectCustomChat(cc.id)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-white/8 text-left transition-all group"
                          >
                            <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-sm text-slate-300 truncate flex-1">
                              {cc.judul}
                            </span>
                            <StatusBadge status={cc.status} size="xs" />
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {!isLoadingCustom && selectedCustomChatId && (
                <div className="space-y-5 pb-2">
                  {customMessages.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-slate-600 text-sm">
                        Pesanmu terkirim. Tunggu balasan dari admin ya!
                      </p>
                    </div>
                  )}
                  {customMessages.map((msg, idx) => {
                    const isUser = msg.sender_role === "user";
                    return (
                      <div
                        key={msg.id ?? idx}
                        className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-0.5 ${
                            isUser
                              ? "bg-slate-800 border border-white/10"
                              : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                          }`}
                        >
                          {isUser ? (
                            <User className="w-4 h-4 text-slate-300" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[78%] sm:max-w-[68%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                        >
                          <span
                            className={`text-[10px] font-semibold px-1 ${isUser ? "text-slate-500" : "text-emerald-400"}`}
                          >
                            {isUser ? "Kamu" : "NEO-Bot"}
                          </span>
                          <div
                            className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                              isUser
                                ? "bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-900/20"
                                : "bg-slate-800/80 text-slate-200 border border-white/8 rounded-tl-sm shadow-sm"
                            }`}
                          >
                            {msg.foto_url && (
                              <div className="mb-2 rounded-xl overflow-hidden border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={msg.foto_url}
                                  alt="Foto lampiran"
                                  className="max-w-full max-h-56 object-cover w-full cursor-pointer"
                                  onClick={() =>
                                    window.open(msg.foto_url!, "_blank")
                                  }
                                />
                              </div>
                            )}
                            <MessageContent text={msg.konten} />
                          </div>
                          <span
                            className={`text-[10px] text-slate-600 px-1 ${isUser ? "text-right" : ""}`}
                          >
                            {formatMsgTime(msg.dibuat_pada)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {showAdminWaitingIndicator && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-0.5 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="max-w-[78%] sm:max-w-[68%] flex flex-col gap-1 items-start">
                        <span className="text-[10px] font-semibold px-1 text-emerald-400">
                          NEO-Bot
                        </span>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800/80 text-slate-200 border border-white/8 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                            <span className="text-[13px]">
                              Admin sedang menyiapkan balasan...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ Mode Switcher ══ */}
        <div className="px-4 sm:px-6 pt-3 pb-1 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-1 bg-slate-800/50 border border-white/5 rounded-xl p-1">
            {[
              { mode: "bot" as ChatMode, icon: "🤖", label: "NEO-Bot" },
              {
                mode: "laporan" as ChatMode,
                icon: "📋",
                label: "Buat Laporan",
              },
              { mode: "custom" as ChatMode, icon: "💬", label: "Chat Custom" },
            ].map((tab) => (
              <button
                key={tab.mode}
                onClick={() => setChatMode(tab.mode)}
                className={`
                  flex-1 py-1.5 px-2 rounded-lg text-sm font-medium transition-all duration-200
                  flex items-center justify-center gap-1.5
                  ${
                    chatMode === tab.mode
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/50"
                      : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══ Input Area ══ */}
        <div className="px-4 sm:px-6 pb-4 pt-2 shrink-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            {/* ── Bot input ── */}
            {chatMode === "bot" && (
              <div className="space-y-2">
                <form onSubmit={handleFormSubmit} className="relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      currentChatId
                        ? "Ketik pesanmu ke NEO-Bot..."
                        : "Menginisialisasi chat..."
                    }
                    disabled={!currentChatId || isLoading}
                    autoComplete="off"
                    className="w-full bg-slate-800/60 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-800 transition-all shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || !currentChatId || isLoading}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95"
                    title="Kirim pesan"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className="text-[11px] text-slate-500">Auto-correct template:</span>
                  {templateSuggestions.map((item) => (
                    <button
                      key={`suggest-${item.id}`}
                      type="button"
                      disabled={!currentChatId || isLoading}
                      onClick={() => handleSend(item.query)}
                      className="rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2.5 py-1 text-[11px] text-indigo-200 transition hover:bg-indigo-500/20 disabled:opacity-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Laporan input (changes per step) ── */}
            {chatMode === "laporan" && (
              <div>
                {/* Step 0: waiting for category click */}
                {laporanStep === -1 && !laporanSuccess && (
                  <div className="flex items-center justify-center py-3 px-4 bg-slate-800/40 border border-white/5 rounded-2xl">
                    <p className="text-slate-500 text-sm">
                      ☝️ Pilih dulu apakah mau ajukan laporan
                    </p>
                  </div>
                )}

                {/* Step 0: waiting for category click */}
                {laporanStep === 0 && !laporanSuccess && (
                  <div className="flex items-center justify-center py-3 px-4 bg-slate-800/40 border border-white/5 rounded-2xl">
                    <p className="text-slate-500 text-sm">
                      ☝️ Pilih kategori di atas untuk melanjutkan
                    </p>
                  </div>
                )}

                {/* Step 1 & 2: text input */}
                {(laporanStep === 1 || laporanStep === 2) &&
                  !laporanSuccess && (
                    <form
                      onSubmit={handleLaporanTextSubmit}
                      className="relative group"
                    >
                      <input
                        ref={laporanTextInputRef}
                        type="text"
                        value={laporanInput}
                        onChange={(e) => setLaporanInput(e.target.value)}
                        placeholder={
                          laporanStep === 1
                            ? "Judul laporan, contoh: AC rusak di Lab Komputer"
                            : "Lokasi, contoh: Gedung B, Lantai 2, Ruang Lab"
                        }
                        disabled={isLaporanTyping}
                        autoComplete="off"
                        className="w-full bg-slate-800/60 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-slate-800 transition-all shadow-xl text-[15px] disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!laporanInput.trim() || isLaporanTyping}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </form>
                  )}

                {/* Step 3: textarea deskripsi */}
                {laporanStep === 3 && !laporanSuccess && (
                  <form
                    onSubmit={handleLaporanTextSubmit}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <textarea
                        ref={laporanTextareaRef}
                        value={laporanInput}
                        onChange={(e) => setLaporanInput(e.target.value)}
                        placeholder="Jelaskan detail masalah secara lengkap dan jelas..."
                        disabled={isLaporanTyping}
                        rows={3}
                        className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-slate-800 transition-all shadow-xl text-[15px] resize-none disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={
                          laporanInput.trim().length < 20 || isLaporanTyping
                        }
                        className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <p
                        className={`text-xs ${laporanInput.trim().length >= 20 ? "text-emerald-400" : "text-slate-500"}`}
                      >
                        {laporanInput.trim().length} / 20 karakter minimum
                        {laporanInput.trim().length >= 20 && (
                          <span className="ml-1">✓</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-600">
                        Shift+Enter untuk baris baru
                      </p>
                    </div>
                  </form>
                )}

                {/* Step 4: foto upload */}
                {laporanStep === 4 && !laporanSuccess && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        ref={laporanFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFotoChange}
                        className="hidden"
                        id="laporan-foto-input"
                      />
                      <label
                        htmlFor="laporan-foto-input"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 hover:bg-slate-700/60 hover:border-white/20 text-slate-300 hover:text-white cursor-pointer transition-all text-sm font-medium flex-1 justify-center"
                      >
                        <Upload className="w-4 h-4" />
                        {laporanData.foto.length > 0
                          ? `${laporanData.foto.length} foto dipilih (maks. 3)`
                          : "Pilih Foto (Opsional)"}
                      </label>
                      <button
                        onClick={handleLaporanFotoNext}
                        disabled={isLaporanTyping}
                        className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        Lanjutkan
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 text-center">
                      Format gambar saja · Maks. 3 foto · Opsional
                    </p>
                  </div>
                )}

                {/* Step 5: submit confirmation */}
                {laporanStep === 5 && !laporanSuccess && (
                  <button
                    onClick={handleSubmitLaporan}
                    disabled={isSubmittingLaporan}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
                  >
                    {isSubmittingLaporan ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengirim Laporan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Kirim Laporan Sekarang
                      </>
                    )}
                  </button>
                )}

                {/* Success: reset button */}
                {laporanSuccess && (
                  <div className="space-y-3">
                    {selectedLaporanItem?.status !== "selesai" ? (
                      <form onSubmit={handleLaporanFollowUpSubmit} className="relative group">
                        <input
                          type="text"
                          value={laporanInput}
                          onChange={(e) => setLaporanInput(e.target.value)}
                          placeholder="Lanjutkan percakapan terkait laporan ini..."
                          className="w-full bg-slate-800/60 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-slate-800 transition-all shadow-xl text-[15px]"
                        />
                        <button
                          type="submit"
                          disabled={!laporanInput.trim()}
                          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition-all"
                        >
                          <Send className="w-4 h-4 ml-0.5" />
                        </button>
                      </form>
                    ) : (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-3">
                        <p className="text-sm text-emerald-200">
                          Laporan sudah <strong>selesai</strong>. Silakan beri rating dan feedback.
                        </p>
                        {selectedLaporanItem?.rating ? (
                          <p className="text-xs text-emerald-300">
                            Rating & feedback sudah dikirim ({selectedLaporanItem.rating}/5).
                          </p>
                        ) : null}
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setLaporanRating(n)}
                              disabled={!!selectedLaporanItem?.rating}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                                laporanRating >= n
                                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                                  : "bg-slate-800/60 border-white/10 text-slate-400"
                              } ${selectedLaporanItem?.rating ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              {n}★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={laporanFeedbackText}
                          onChange={(e) => setLaporanFeedbackText(e.target.value)}
                          placeholder="Tulis feedback kamu (opsional)..."
                          rows={3}
                          disabled={!!selectedLaporanItem?.rating}
                          className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 text-sm resize-none"
                        />
                        <button
                          onClick={handleSubmitLaporanFeedback}
                          disabled={laporanRating < 1 || isSubmittingLaporanFeedback || !!selectedLaporanItem?.rating}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {selectedLaporanItem?.rating
                            ? "Rating & Feedback Sudah Terkirim"
                            : isSubmittingLaporanFeedback
                              ? "Menyimpan..."
                              : "Kirim Rating & Feedback"}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={initLaporanMode}
                      className="w-full py-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Buat Laporan Baru
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Custom chat input ── */}
            {chatMode === "custom" && !isLoadingCustom && (
              <div className="space-y-2">
                {/* Photo preview */}
                {customPhotoPreview && (
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={customPhotoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {isUploadingCustomPhoto && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setCustomPhotoPreview(null);
                        setCustomUploadUrl(null);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  {/* File upload button */}
                  <input
                    ref={customFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomPhotoUpload}
                    className="hidden"
                    id="custom-foto-input"
                  />
                  <label
                    htmlFor="custom-foto-input"
                    className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                      isUploadingCustomPhoto
                        ? "bg-slate-700/50 border-white/5 text-slate-500 cursor-not-allowed"
                        : "bg-slate-800/60 border-white/10 hover:bg-slate-700/60 hover:border-white/20 text-slate-400 hover:text-white"
                    }`}
                    title="Lampirkan foto"
                  >
                    {isUploadingCustomPhoto ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </label>

                  {/* Textarea */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={customInputRef}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={handleCustomFormKeyDown}
                      placeholder={
                        selectedCustomChatId
                          ? "Ketik pesanmu..."
                          : "Ketik pesanmu, admin akan membalas secepatnya..."
                      }
                      disabled={isSendingCustom}
                      rows={1}
                      className="w-full bg-slate-800/60 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 focus:bg-slate-800 transition-all text-[15px] resize-none disabled:opacity-50 min-h-12 max-h-40"
                      style={{ height: "auto" }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                      }}
                    />
                    <button
                      onClick={handleSendCustomMessage}
                      disabled={
                        (!customInput.trim() && !customUploadUrl) ||
                        isSendingCustom ||
                        isUploadingCustomPhoto
                      }
                      className="absolute right-2 bottom-1.5 w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
                      title="Kirim pesan (Enter)"
                    >
                      {isSendingCustom ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 text-center">
                  Enter untuk kirim · Shift+Enter baris baru
                </p>
              </div>
            )}

            {/* Footer note for bot mode */}
            {chatMode === "bot" && (
              <p className="text-center mt-3 text-xs text-slate-600">
                NEO-Bot memberikan informasi umum. Untuk masalah spesifik,
                gunakan{" "}
                <button
                  onClick={() => setChatMode("custom")}
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Chat Custom
                </button>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
