"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  BookOpen,
  PenTool,
  CheckCircle2,
  ChevronRight,
  Wrench,
  Trash2,
  Camera,
  MessageCircle,
  Bell,
  Star,
  ChevronDown,
  Menu,
  Check,
  X,
  Clock,
  Users,
  TrendingUp,
  Award,
  Smartphone,
  Bot,
  User,
  Send,
  Wifi,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  isLoggedIn: boolean;
  userName: string | null;
}

// ─── Animated Chat Mockup ─────────────────────────────────────────────────────

const CHAT_MESSAGES = [
  {
    role: "bot",
    text: "Halo! 👋 Selamat datang di NEO-Bot! Ada yang bisa saya bantu?",
    delay: 0,
  },
  {
    role: "user",
    text: "Proyektor di Lab Komputer mati sejak kemarin",
    delay: 1200,
  },
  {
    role: "bot",
    text: "Oke, saya catat! Mohon lengkapi detail lokasinya ya 📍",
    delay: 2200,
  },
  { role: "user", text: "Gedung C, Lantai 2, Lab Komputer 1", delay: 3200 },
  {
    role: "bot",
    text: "✅ Laporan dikirim! Nomor tiket: ASP-20260422-017\nAdmin akan menangani dalam 24 jam.",
    delay: 4200,
  },
];

function ChatMockup() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setVisibleCount(0);
      setShowTyping(false);

      CHAT_MESSAGES.forEach((msg, i) => {
        if (msg.role === "bot" && i > 0) {
          const t1 = setTimeout(() => setShowTyping(true), msg.delay - 600);
          timeouts.push(t1);
        }
        const t2 = setTimeout(() => {
          setShowTyping(false);
          setVisibleCount(i + 1);
        }, msg.delay);
        timeouts.push(t2);
      });

      // Loop setelah selesai
      const total = setTimeout(
        () => run(),
        CHAT_MESSAGES[CHAT_MESSAGES.length - 1].delay + 3500,
      );
      timeouts.push(total);
    };

    const start = setTimeout(run, 800);
    timeouts.push(start);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="relative bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl shadow-indigo-500/10 overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900/80 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-none">
                NEO-Bot
              </p>
              <p className="text-emerald-400 text-[9px] flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Wifi className="w-3 h-3" />
            <Bell className="w-3 h-3" />
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-3 min-h-[320px] bg-gradient-to-b from-slate-900 to-slate-950">
          {CHAT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
            >
              {msg.role === "bot" && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {showTyping && (
            <div className="flex gap-2 animate-fade-in">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-slate-800 border border-white/5 flex items-center gap-1">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-3 py-3 border-t border-white/5 bg-slate-900/80 flex items-center gap-2">
          <div className="flex-1 bg-slate-800 rounded-xl px-3 py-2 text-slate-500 text-[11px]">
            Ketik pesan...
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="hidden sm:block absolute -top-4 -right-4 bg-slate-800 border border-white/10 rounded-2xl px-3 py-2.5 shadow-xl animate-float">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white text-[10px] font-bold">
              Laporan Diterima!
            </p>
            <p className="text-slate-400 text-[9px]">Admin memproses...</p>
          </div>
        </div>
      </div>

      {/* Floating ticket */}
      <div
        className="hidden sm:block absolute -bottom-3 -left-4 bg-slate-800 border border-indigo-500/20 rounded-2xl px-3 py-2 shadow-xl animate-float"
        style={{ animationDelay: "1s" }}
      >
        <p className="text-indigo-400 font-mono text-[9px] font-bold">
          🎫 ASP-20260422-017
        </p>
        <p className="text-slate-400 text-[9px]">Dalam proses pengerjaan</p>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Siapa saja yang bisa menggunakan NEO-SARANA?",
    a: "NEO-SARANA dapat digunakan oleh seluruh siswa yang memiliki akun NIPD (Nomor Induk Peserta Didik) yang terdaftar di sistem sekolah. Admin sekolah bertugas mengelola dan menindaklanjuti laporan.",
  },
  {
    q: "Berapa lama laporan saya akan diproses?",
    a: "Review awal dilakukan dalam 1×24 jam kerja. Proses pengerjaan berlangsung 3–7 hari kerja tergantung tingkat kompleksitas. Laporan kategori keamanan/darurat diprioritaskan.",
  },
  {
    q: "Apakah saya bisa memantau progres laporan?",
    a: "Ya! Setiap perubahan status laporan akan langsung muncul sebagai notifikasi real-time di aplikasi. Kamu juga bisa melacak dengan nomor tiket yang diberikan saat pengiriman.",
  },
  {
    q: "Apa yang dimaksud dengan foto Before & After?",
    a: "Foto Before adalah foto kondisi kerusakan yang kamu upload saat melapor. Foto After adalah bukti foto yang diupload admin setelah perbaikan selesai, sebagai standar akuntabilitas.",
  },
  {
    q: "Bagaimana jika laporan saya ditolak?",
    a: "Laporan yang tidak memenuhi syarat (tidak lengkap, tidak relevan, atau duplikat) dapat ditolak oleh admin. Kamu akan mendapat notifikasi beserta alasannya, dan bisa membuat laporan baru.",
  },
  {
    q: "Apakah ada batas jumlah laporan yang bisa dibuat?",
    a: "Tidak ada batas. Kamu bebas membuat laporan sebanyak yang diperlukan, selama setiap laporan valid dan sesuai dengan ketentuan yang berlaku.",
  },
];

function FAQItem({
  item,
  index,
}: {
  item: (typeof FAQ_ITEMS)[0];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`faq-item border rounded-2xl overflow-hidden transition-all duration-300 ${open ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-slate-900/40 hover:border-white/10"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-white text-[15px] leading-snug">
          {item.q}
        </span>
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${open ? "border-indigo-500/50 bg-indigo-500/20 rotate-180" : "border-white/10 bg-white/5"}`}
        >
          <ChevronDown
            className={`w-4 h-4 ${open ? "text-indigo-400" : "text-slate-400"}`}
          />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48" : "max-h-0"}`}
      >
        <p className="px-6 pb-5 text-slate-400 leading-relaxed text-sm">
          {item.a}
        </p>
      </div>
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
  color,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCounter(value, 1800, triggered);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="stat-card relative group p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} blur-2xl`}
      />
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color.replace("from-", "bg-").split(" ")[0]}/20`}
        >
          <Icon className="w-5 h-5 text-white/70" />
        </div>
        <div className="text-3xl font-black text-white mb-1">
          {count}
          {suffix}
        </div>
        <div className="text-sm text-slate-400 font-medium">{label}</div>
      </div>
    </div>
  );
}

// ─── Marquee Ticker ────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "✅ Laporan Diproses Real-time",
  "📸 Bukti Foto Before & After",
  "🔔 Notifikasi Instan",
  "🤖 AI-powered Chatbot",
  "📊 Dashboard Admin Lengkap",
  "🔒 Data Aman & Terenkripsi",
  "⚡ Respon Cepat 24 Jam",
  "📱 Mobile Friendly",
];

function Ticker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    gsap.to(el, {
      xPercent: -50,
      duration: 25,
      ease: "none",
      repeat: -1,
    });
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden border-y border-white/5 bg-slate-950/80 py-3">
      <div ref={trackRef} className="flex gap-12 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-sm font-medium text-slate-400 flex items-center gap-2"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LandingPageClient({ isLoggedIn, userName }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nav scroll effect
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    // Prevent background scroll when mobile menu is open.
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Navbar */
      gsap.from(".nav-anim", {
        y: -70,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      /* Hero */
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(".hero-badge", {
        opacity: 0,
        scale: 0.7,
        duration: 0.55,
        ease: "back.out(2.5)",
      })
        .from(
          ".hero-title-1",
          { opacity: 0, y: 60, duration: 0.65, ease: "power3.out" },
          "-=0.25",
        )
        .from(
          ".hero-title-2",
          { opacity: 0, y: 60, duration: 0.65, ease: "power3.out" },
          "-=0.45",
        )
        .from(
          ".hero-sub",
          { opacity: 0, y: 35, duration: 0.55, ease: "power3.out" },
          "-=0.4",
        )
        .from(
          ".hero-cta",
          {
            opacity: 0,
            y: 20,
            duration: 0.45,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.35",
        )
        .from(
          ".hero-mockup",
          { opacity: 0, x: 60, duration: 0.8, ease: "power3.out" },
          "-=0.7",
        );

      /* Orbs float */
      gsap.to(".orb-1", {
        y: -28,
        x: 12,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orb-2", {
        y: 22,
        x: -16,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });
      gsap.to(".orb-3", {
        y: -18,
        x: 10,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3,
      });

      /* Features */
      gsap.from(".feat-label", {
        scrollTrigger: { trigger: ".feat-section", start: "top 82%" },
        opacity: 0,
        y: 25,
        duration: 0.5,
      });
      gsap.from(".feat-card", {
        scrollTrigger: { trigger: ".feat-section", start: "top 74%" },
        opacity: 0,
        y: 55,
        duration: 0.6,
        stagger: 0.14,
        ease: "power3.out",
      });

      /* How It Works */
      gsap.from(".how-label", {
        scrollTrigger: { trigger: ".how-section", start: "top 82%" },
        opacity: 0,
        y: 25,
        duration: 0.5,
      });
      gsap.from(".how-card", {
        scrollTrigger: { trigger: ".how-section", start: "top 74%" },
        opacity: 0,
        y: 60,
        duration: 0.65,
        stagger: 0.2,
        ease: "power3.out",
      });
      gsap.from(".how-line", {
        scrollTrigger: { trigger: ".how-section", start: "top 68%" },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "power2.out",
        delay: 0.3,
      });

      /* Preview */
      gsap.from(".preview-left", {
        scrollTrigger: { trigger: ".preview-section", start: "top 78%" },
        opacity: 0,
        x: -50,
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.from(".preview-right", {
        scrollTrigger: { trigger: ".preview-section", start: "top 78%" },
        opacity: 0,
        x: 50,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.1,
      });

      /* Comparison */
      gsap.from(".comp-label", {
        scrollTrigger: { trigger: ".comp-section", start: "top 82%" },
        opacity: 0,
        y: 25,
        duration: 0.5,
      });
      gsap.from(".comp-card", {
        scrollTrigger: { trigger: ".comp-section", start: "top 74%" },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      });

      /* Categories */
      gsap.from(".cat-label", {
        scrollTrigger: { trigger: ".cat-section", start: "top 82%" },
        opacity: 0,
        y: 25,
        duration: 0.5,
      });
      gsap.fromTo(
        ".cat-card",
        { opacity: 0, y: 50, scale: 0.93 },
        {
          scrollTrigger: {
            trigger: ".cat-section",
            start: "top 74%",
            once: true,
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );

      /* Testimonials */
      gsap.from(".testi-label", {
        scrollTrigger: { trigger: ".testi-section", start: "top 82%" },
        opacity: 0,
        y: 25,
        duration: 0.5,
      });
      gsap.fromTo(
        ".testi-card",
        { opacity: 0, y: 45 },
        {
          scrollTrigger: {
            trigger: ".testi-section",
            start: "top 76%",
            once: true,
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );

      /* FAQ */
      gsap.from(".faq-label", {
        scrollTrigger: { trigger: ".faq-section", start: "top 82%" },
        opacity: 0,
        y: 25,
        duration: 0.5,
      });
      gsap.fromTo(
        ".faq-item",
        { opacity: 0, y: 30 },
        {
          scrollTrigger: {
            trigger: ".faq-section",
            start: "top 76%",
            once: true,
            toggleActions: "play none none none",
          },
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform",
        },
      );

      /* CTA */
      gsap.from(".cta-content", {
        scrollTrigger: { trigger: ".cta-section", start: "top 80%" },
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
      });

      /* Footer */
      gsap.from(".footer-anim", {
        scrollTrigger: { trigger: ".footer-section", start: "top 92%" },
        opacity: 0,
        y: 20,
        duration: 0.5,
      });

      /* FAB */
      gsap.from(".fab-anim", {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        delay: 1.2,
        ease: "back.out(2)",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden"
    >
      {/* ── Background Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/8 blur-[140px]" />
        <div className="orb-2 absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/8 blur-[140px]" />
        <div className="orb-3 absolute top-[35%] left-[55%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <nav
        className={`nav-anim fixed top-0 w-full z-50 transition-all duration-300 ${navScrolled ? "border-b border-white/8 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/20" : "border-b border-white/5 bg-slate-950/60 backdrop-blur-xl"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-base sm:text-xl font-black tracking-tighter text-white uppercase group-hover:text-indigo-400 transition-colors duration-300">
              NEO<span className="text-indigo-500">-</span>SARANA
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#how" className="hover:text-white transition-colors">
              Cara Kerja
            </a>
            <a
              href="#categories"
              className="hover:text-white transition-colors"
            >
              Kategori
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <>
                {userName && (
                  <span className="text-sm text-slate-400 hidden sm:block">
                    Halo,{" "}
                    <span className="text-white font-semibold">{userName}</span>
                  </span>
                )}
                <Link
                  href="/chat"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm"
                >
                  Buka Chat
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition-all text-sm"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition-all text-sm hidden sm:flex"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm"
                >
                  Login NIPD
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-slate-200 flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-4 flex flex-col gap-1 text-sm text-slate-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                Fitur
              </a>
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                Cara Kerja
              </a>
              <a
                href="#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                Kategori
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                FAQ
              </a>
              <div className="mt-2 pt-3 border-t border-white/10 flex gap-2">
                {!isLoggedIn && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    Masuk
                  </Link>
                )}
                {isLoggedIn && (
                  <Link
                    href="/api/auth/signout"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    Logout
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-[0.18em] mb-7 cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                Platform Aspirasi Cerdas
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
                <span className="hero-title-1 block">Suarakan</span>
                <span className="hero-title-2 block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x mt-1">
                  Aspirasimu.
                </span>
                <span className="hero-title-1 block text-3xl sm:text-4xl md:text-5xl text-slate-300 font-extrabold mt-1">
                  Bangun Sekolah Lebih Baik.
                </span>
              </h1>

              <p className="hero-sub text-slate-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl">
                Platform cerdas untuk melaporkan, memantau, dan menyelesaikan
                masalah sarana & prasarana sekolah secara{" "}
                <span className="text-indigo-400 font-semibold">
                  transparan
                </span>
                , <span className="text-purple-400 font-semibold">cepat</span>,
                dan{" "}
                <span className="text-emerald-400 font-semibold">terukur</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/chat"
                  className="hero-cta group px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how"
                  className="hero-cta px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Lihat Demo
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              {/* Trust badges */}
              <div className="hero-cta flex items-center gap-4 flex-wrap">
                {[
                  { icon: ShieldCheck, text: "Data Aman" },
                  { icon: Zap, text: "Respon Cepat" },
                  { icon: Smartphone, text: "Mobile Ready" },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-slate-500 text-xs font-medium"
                  >
                    <t.icon className="w-3.5 h-3.5 text-indigo-400" />
                    {t.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Chat Mockup */}
            <div className="hero-mockup hidden lg:block">
              <ChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATS ── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="stats-section grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              value={99}
              suffix="+"
              label="Aspirasi Selesai"
              icon={CheckCircle2}
              color="from-emerald-500/10 to-emerald-500/5"
            />
            <StatCard
              value={24}
              suffix="j"
              label="Waktu Respon Maks."
              icon={Clock}
              color="from-blue-500/10 to-blue-500/5"
            />
            <StatCard
              value={1000}
              suffix="+"
              label="Pengguna Aktif"
              icon={Users}
              color="from-indigo-500/10 to-indigo-500/5"
            />
            <StatCard
              value={98}
              suffix="%"
              label="Tingkat Kepuasan"
              icon={TrendingUp}
              color="from-purple-500/10 to-purple-500/5"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="feat-section py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="feat-label text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              Fitur Unggulan
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Kenapa NEO-SARANA?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Dirancang khusus untuk memastikan setiap aspirasi tertangani
              dengan profesional dan transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Activity,
                title: "Real-time Tracking",
                desc: "Pantau setiap tahapan progres laporanmu dari validasi hingga pengerjaan tuntas langsung dari layar perangkatmu tanpa perlu bolak-balik bertanya.",
                badge: "Live Update",
                badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                gradient: "from-blue-500/10 to-transparent",
                border: "hover:border-blue-500/30",
                icon_bg: "bg-blue-500/10 text-blue-400",
              },
              {
                icon: ShieldCheck,
                title: "Transparansi Penuh",
                desc: "Setiap laporan diverifikasi oleh admin dengan bukti foto Before & After. Semua proses tercatat rapi, tidak ada yang bisa disembunyikan.",
                badge: "Verified",
                badgeColor:
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                gradient: "from-emerald-500/10 to-transparent",
                border: "hover:border-emerald-500/30",
                icon_bg: "bg-emerald-500/10 text-emerald-400",
              },
              {
                icon: Bell,
                title: "Notifikasi Instan",
                desc: "Terima notifikasi real-time setiap kali ada pembaruan pada laporanmu. Tidak ada yang terlewat, semua update langsung masuk ke aplikasi.",
                badge: "Real-time",
                badgeColor:
                  "bg-purple-500/10 text-purple-400 border-purple-500/20",
                gradient: "from-purple-500/10 to-transparent",
                border: "hover:border-purple-500/30",
                icon_bg: "bg-purple-500/10 text-purple-400",
              },
              {
                icon: Bot,
                title: "AI Chatbot",
                desc: "Asisten virtual NEO-Bot siap 24/7 membantu kamu mengisi laporan, menjawab pertanyaan umum, dan memandu proses pengaduan dengan mudah.",
                badge: "AI-Powered",
                badgeColor:
                  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                gradient: "from-indigo-500/10 to-transparent",
                border: "hover:border-indigo-500/30",
                icon_bg: "bg-indigo-500/10 text-indigo-400",
              },
              {
                icon: Award,
                title: "Bukti After-Before",
                desc: "Setiap penyelesaian wajib dilengkapi foto After oleh admin sebagai standar kualitas. Kamu bisa membandingkan kondisi sebelum dan sesudah perbaikan.",
                badge: "Akuntabel",
                badgeColor:
                  "bg-amber-500/10 text-amber-400 border-amber-500/20",
                gradient: "from-amber-500/10 to-transparent",
                border: "hover:border-amber-500/30",
                icon_bg: "bg-amber-500/10 text-amber-400",
              },
              {
                icon: MessageCircle,
                title: "Chat Langsung ke Admin",
                desc: "Punya pertanyaan spesifik? Gunakan fitur Chat Custom untuk berkomunikasi langsung dengan admin. Privat, cepat, dan profesional.",
                badge: "Direct Chat",
                badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
                gradient: "from-pink-500/10 to-transparent",
                border: "hover:border-pink-500/30",
                icon_bg: "bg-pink-500/10 text-pink-400",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`feat-card relative overflow-hidden glass-panel p-7 rounded-2xl border border-white/5 ${f.border} transition-all duration-400 hover:-translate-y-2 hover:shadow-xl group`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${f.gradient} opacity-60`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl ${f.icon_bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <f.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border ${f.badgeColor}`}
                    >
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how"
        className="how-section py-20 sm:py-24 px-4 sm:px-6 bg-slate-900/40 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="how-label text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
              Cara Kerja
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Tiga Langkah Mudah
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Melaporkan masalah sarana prasarana semudah mengirim pesan chat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="how-line hidden md:block absolute top-14 left-[22%] right-[22%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 z-0" />

            {[
              {
                icon: PenTool,
                step: "01",
                title: "Tulis Laporan",
                desc: "Jelaskan masalah yang kamu temukan, pilih kategori yang sesuai, dan unggah foto kondisi awal sebagai bukti.",
                color: "indigo",
                points: [
                  "Pilih kategori pengaduan",
                  "Deskripsikan masalah detail",
                  "Upload foto kondisi awal",
                ],
              },
              {
                icon: Activity,
                step: "02",
                title: "Admin Memproses",
                desc: "Laporan masuk ke dashboard admin, divalidasi, diprioritaskan, dan ditindaklanjuti ke tim yang bertanggung jawab.",
                color: "purple",
                points: [
                  "Validasi oleh admin",
                  "Penentuan prioritas",
                  "Penugasan ke teknisi",
                ],
              },
              {
                icon: CheckCircle2,
                step: "03",
                title: "Laporan Selesai",
                desc: "Kamu mendapat notifikasi real-time saat pekerjaan dimulai dan selesai, dilengkapi foto bukti perbaikan.",
                color: "emerald",
                points: [
                  "Notifikasi real-time",
                  "Foto After dikirim admin",
                  "Konfirmasi penyelesaian",
                ],
              },
            ].map((step, i) => (
              <div key={i} className="how-card relative z-10 group">
                <div
                  className={`relative p-7 rounded-2xl border border-white/5 hover:border-${step.color}-500/30 bg-slate-900/60 hover:bg-${step.color}-500/5 transition-all duration-400 hover:-translate-y-1`}
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                    <span
                      className={`text-xs font-black text-${step.color}-400`}
                    >
                      {step.step}
                    </span>
                  </div>

                  <div
                    className={`w-16 h-16 rounded-2xl bg-${step.color}-500/10 flex items-center justify-center text-${step.color}-400 mb-6 border border-${step.color}-500/20 group-hover:scale-110 transition-transform duration-400`}
                  >
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    {step.desc}
                  </p>
                  <ul className="space-y-2">
                    {step.points.map((pt, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm text-slate-400"
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-${step.color}-500/15 flex items-center justify-center shrink-0`}
                        >
                          <Check
                            className={`w-2.5 h-2.5 text-${step.color}-400`}
                          />
                        </div>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PREVIEW ── */}
      <section className="preview-section py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — mockup */}
            <div className="preview-left">
              <ChatMockup />
            </div>

            {/* Right — text */}
            <div className="preview-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-5">
                Live Demo
              </span>
              <h2 className="text-4xl font-black text-white mb-5 leading-tight">
                Semudah Chat
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  di WhatsApp.
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                NEO-Bot memandu kamu langkah demi langkah dalam mengisi laporan.
                Tidak perlu bingung, cukup jawab pertanyaan dari bot dan laporan
                terkirim otomatis.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Bot,
                    title: "Bot yang Intuitif",
                    desc: "Ikuti panduan NEO-Bot untuk mengisi laporan dengan benar dan lengkap.",
                  },
                  {
                    icon: Bell,
                    title: "Notifikasi Instan",
                    desc: "Terima update status laporan langsung di chat, tanpa perlu cek manual.",
                  },
                  {
                    icon: MessageCircle,
                    title: "Chat Langsung ke Admin",
                    desc: "Gunakan Chat Custom untuk pertanyaan yang lebih spesifik ke admin.",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                      <f.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-0.5">
                        {f.title}
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Coba Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="comp-section py-20 sm:py-24 px-4 sm:px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="comp-label text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              Perbandingan
            </span>
            <h2 className="text-4xl font-black text-white mb-4">
              NEO-SARANA vs Cara Lama
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Lihat perbedaan nyata antara sistem pelaporan modern dengan cara
              konvensional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old way */}
            <div className="comp-card p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-bold text-white text-lg">Cara Lama</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Lapor manual ke guru/wakasek",
                  "Tidak ada nomor tiket resmi",
                  "Progres tidak bisa dipantau",
                  "Tidak ada bukti penyelesaian",
                  "Bisa terlupakan atau terabaikan",
                  "Tidak ada notifikasi sama sekali",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-400 text-sm"
                  >
                    <div className="w-4 h-4 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                      <X className="w-2.5 h-2.5 text-red-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* New way */}
            <div className="comp-card p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                Rekomendasi
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-lg">NEO-SARANA</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Lapor via chatbot kapan & dimana saja",
                  "Nomor tiket resmi otomatis",
                  "Tracking progres real-time",
                  "Foto Before & After sebagai bukti",
                  "Tersimpan permanen di database",
                  "Notifikasi instan di setiap update",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-300 text-sm"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="cat-section py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="cat-label flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                Kategori
              </span>
              <h2 className="text-4xl font-black text-white mb-3">
                Kategori Pengaduan
              </h2>
              <p className="text-slate-400 max-w-lg">
                Pilih kategori yang tepat agar laporan ditangani oleh divisi
                yang sesuai lebih cepat.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors group whitespace-nowrap"
            >
              Buat Laporan
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BookOpen,
                name: "Sarana Belajar",
                desc: "Meja, kursi, proyektor, papan tulis, dan perangkat pembelajaran.",
                count: "32 laporan",
                color: "indigo",
              },
              {
                icon: Wrench,
                name: "Prasarana Fisik",
                desc: "Atap bocor, pintu rusak, lantai retak, jendela rusak.",
                count: "28 laporan",
                color: "orange",
              },
              {
                icon: Trash2,
                name: "Kebersihan",
                desc: "Kamar mandi kotor, sampah menumpuk, drainase tersumbat.",
                count: "19 laporan",
                color: "emerald",
              },
              {
                icon: Camera,
                name: "Keamanan",
                desc: "CCTV mati, lampu lorong padam, pagar rusak, akses tidak aman.",
                count: "14 laporan",
                color: "red",
              },
            ].map((cat, i) => (
              <div
                key={i}
                className={`cat-card group relative overflow-hidden glass-panel p-6 rounded-2xl border border-white/5 hover:border-${cat.color}-500/30 transition-all duration-400 hover:-translate-y-2 hover:shadow-xl hover:shadow-${cat.color}-500/10 cursor-pointer`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${cat.color}-500/10 flex items-center justify-center text-${cat.color}-400 mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <cat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">
                  {cat.name}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {cat.desc}
                </p>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full bg-${cat.color}-500/10 text-${cat.color}-400 border border-${cat.color}-500/20`}
                >
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi-section py-20 sm:py-24 px-4 sm:px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="testi-label text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4">
              Testimoni
            </span>
            <h2 className="text-4xl font-black text-white mb-4">
              Yang Mereka Katakan
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Pengalaman nyata dari siswa dan guru yang telah menggunakan
              NEO-SARANA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Rizky Aditya",
                role: "Siswa Kelas XI IPA 2",
                avatar: "R",
                rating: 5,
                text: "Gila sih ini, dulu lapor kerusakan proyektor bisa berbulan-bulan nggak ditangani. Sekarang pake NEO-SARANA, 3 hari langsung beres dan ada foto buktinya. Mantap!",
                color: "indigo",
              },
              {
                name: "Sari Dewi Rahayu",
                role: "Siswa Kelas XII IPS 1",
                avatar: "S",
                rating: 5,
                text: "Fitur notifikasi real-time-nya keren banget. Aku bisa tau progres laporan kapan aja tanpa perlu nanya ke guru. Sangat membantu dan transparan.",
                color: "purple",
              },
              {
                name: "Bpk. Hendra Kusuma",
                role: "Wali Kelas X TKJ",
                avatar: "H",
                rating: 5,
                text: "Sebagai guru, saya senang karena siswa punya saluran resmi untuk menyampaikan keluhan. Dashboard admin-nya juga sangat informatif dan mudah digunakan.",
                color: "emerald",
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`testi-card p-7 rounded-2xl border border-white/5 hover:border-${t.color}-500/20 bg-slate-900/60 transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-${t.color}-500/20 flex items-center justify-center text-${t.color}-300 font-bold text-sm`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="faq-section py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="faq-label text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-700/50 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="text-4xl font-black text-white mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Semua yang perlu kamu ketahui tentang NEO-SARANA.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-section py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="cta-content relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 border border-white/10 p-12 text-center shadow-2xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Siap Digunakan
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Mulai Laporkan Masalah
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Sekolahmu Sekarang.
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Bergabung dengan ribuan siswa yang telah mempercayakan aspirasi
                mereka kepada NEO-SARANA. Gratis, mudah, dan efektif.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/chat"
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  Mulai Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#faq"
                  className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all hover:scale-105"
                >
                  Pelajari Lebih
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-section border-t border-white/5 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="footer-anim grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-black tracking-tighter text-white uppercase">
                  NEO<span className="text-indigo-500">-</span>SARANA
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Platform aspirasi dan pengaduan sarana prasarana sekolah yang
                cerdas, transparan, dan terukur.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Semua sistem berjalan normal
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  "Tentang Kami",
                  "Fitur Unggulan",
                  "Cara Kerja",
                  "Kategori Pengaduan",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
                Dukungan
              </h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  "FAQ",
                  "Panduan Penggunaan",
                  "Hubungi Admin",
                  "Laporkan Bug",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  "Kebijakan Privasi",
                  "Syarat & Ketentuan",
                  "Cookie Policy",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Butuh bantuan langsung? Hubungi admin melalui fitur Chat
                  Custom.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-anim border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} NEO-SARANA. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <span>Dibuat dengan ❤️ untuk kemajuan sekolah</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FAB ── */}
      <div className="fab-anim fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-50 group">
        <Link
          href="/chat"
          className="flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full p-4 shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
        </Link>
        <span className="hidden sm:block absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm font-medium py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
          Buka Chatbot
        </span>
      </div>
    </div>
  );
}
