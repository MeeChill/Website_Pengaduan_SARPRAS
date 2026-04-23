"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  X,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import PusherJs from "pusher-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notifikasi {
  id: number;
  jenis: string;
  pesan: string;
  dibaca: boolean;
  tanggal_notif: string;
  aspirasi_id?: number;
  custom_chat_id?: number;
}

interface Props {
  role: "user" | "admin";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 30) return `${diffDay} hari lalu`;

  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NotifIcon({ jenis }: { jenis: string }) {
  switch (jenis) {
    case "status_update":
      return (
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      );
    case "progres_update":
      return <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    case "custom_chat_message":
      return (
        <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
      );
    case "custom_chat_new":
      return (
        <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      );
    case "warning":
      return <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
    default:
      return <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell({ role }: Props) {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch from API ──────────────────────────────────────────────────────────

  const fetchNotifikasi = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setNotifikasi(data.notifications ?? data.notifikasi ?? []);
    } catch {
      // silent — polling will retry
    }
  }, []);

  // ── Polling fallback (30 s) ─────────────────────────────────────────────────

  useEffect(() => {
    fetchNotifikasi();
    const timer = setInterval(fetchNotifikasi, 30_000);
    return () => clearInterval(timer);
  }, [fetchNotifikasi]);

  // ── Pusher realtime ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    if (!userId) return;

    const pusherClient = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName =
      role === "admin" ? "admin-custom-chats" : `user-${userId}`;

    const channel = pusherClient.subscribe(channelName);

    channel.bind("notification", (data: Notifikasi) => {
      setNotifikasi((prev) => {
        // Avoid duplicate
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
      pusherClient.disconnect();
    };
  }, [userId, role]);

  // ── Close on outside click ──────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const markRead = async (ids: number[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifikasi((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, dibaca: true } : n)),
      );
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    setIsLoading(true);
    try {
      // Kirim tanpa ids → API akan mark semua milik user sebagai dibaca
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickNotif = (notif: Notifikasi) => {
    if (!notif.dibaca) markRead([notif.id]);
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifikasi();
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const unreadCount = notifikasi.filter((n) => !n.dibaca).length;
  const displayed = notifikasi.slice(0, 8);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
      >
        <Bell className="w-5 h-5" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-lg shadow-red-900/40">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={[
            "absolute right-0 top-12 w-80 z-50 overflow-hidden",
            "bg-slate-900/95 backdrop-blur-xl",
            "border border-white/10 rounded-2xl shadow-2xl shadow-black/60",
            "animate-in fade-in slide-in-from-top-2 duration-150",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  Tandai semua dibaca
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
                <Bell className="w-8 h-8 opacity-20" />
                <p className="text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              displayed.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClickNotif(notif)}
                  className={[
                    "w-full text-left px-4 py-3 flex gap-3 items-start",
                    "hover:bg-white/[0.04] transition-colors",
                    !notif.dibaca ? "bg-indigo-500/[0.07]" : "",
                  ].join(" ")}
                >
                  <NotifIcon jenis={notif.jenis} />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] leading-snug break-words ${
                        notif.dibaca ? "text-slate-400" : "text-slate-200"
                      }`}
                    >
                      {notif.pesan}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {relativeTime(notif.tanggal_notif)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.dibaca && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifikasi.length > 8 && (
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.02] text-center">
              <p className="text-[11px] text-slate-600">
                Menampilkan 8 dari {notifikasi.length} notifikasi
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
