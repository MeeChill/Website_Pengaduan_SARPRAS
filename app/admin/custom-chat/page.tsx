"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  X,
  Loader2,
  RefreshCw,
  User,
  Clock,
  AlertCircle,
  Inbox,
  Paperclip,
} from "lucide-react";
import PusherJs from "pusher-js";
import {
  StatusBadge,
  PriorityBadge,
  StatusSelect,
  PrioritySelect,
} from "@/components/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatUser {
  id: number;
  nama: string;
  username: string;
  kelas?: string | null;
  nisn?: string | null;
}

interface ChatSender {
  id: number;
  nama: string;
  username: string;
  role: string;
}

interface ChatMessage {
  id: number;
  custom_chat_id: number;
  sender_id: number;
  sender_role: string;
  konten: string;
  foto_url?: string | null;
  dibuat_pada: string;
  sender?: ChatSender;
}

interface CustomChat {
  id: number;
  judul: string;
  status: string;
  prioritas: string;
  dibuat_pada: string;
  diperbarui_pada: string;
  user_id: number;
  admin_id?: number | null;
  aspirasi?: {
    id: number;
    nomor_tiket: string;
    status: string;
  } | null;
  user: ChatUser;
  admin?: { id: number; nama: string; username: string } | null;
  messages: ChatMessage[];
  _count?: { messages: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 30) return `${diffDay} hari lalu`;

  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Main Client Component ────────────────────────────────────────────────────

function CustomChatAdmin() {
  const [chats, setChats] = useState<CustomChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<CustomChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filterTab, setFilterTab] = useState<string>("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const selectedChatId = selectedChat?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPusherRef = useRef<PusherJs | null>(null);
  const chatChannelRef = useRef<ReturnType<PusherJs["subscribe"]> | null>(null);

  // ── Fetch chat list ─────────────────────────────────────────────────────────

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/custom-chat");
      if (!res.ok) return;
      const data = await res.json();
      setChats(data.customChats ?? []);
    } catch {
      // silent
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // ── Global Pusher for chat list ─────────────────────────────────────────────

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("admin-custom-chats");

    channel.bind("new-chat", (data: { customChat: CustomChat }) => {
      setChats((prev) => {
        if (prev.some((c) => c.id === data.customChat.id)) return prev;
        return [data.customChat, ...prev];
      });
    });

    channel.bind("chat-updated", (data: { customChat: CustomChat }) => {
      setChats((prev) =>
        prev.map((c) => (c.id === data.customChat.id ? data.customChat : c)),
      );
      // Also update selected chat if it matches
      setSelectedChat((prev) =>
        prev && prev.id === data.customChat.id
          ? { ...prev, ...data.customChat }
          : prev,
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-custom-chats");
      pusher.disconnect();
    };
  }, []);

  // ── Per-chat Pusher (when a chat is selected) ───────────────────────────────

  useEffect(() => {
    // Cleanup previous subscription
    if (chatChannelRef.current) {
      chatChannelRef.current.unbind_all();
      chatChannelRef.current = null;
    }
    if (chatPusherRef.current) {
      chatPusherRef.current.disconnect();
      chatPusherRef.current = null;
    }

    if (!selectedChatId || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`custom-chat-${selectedChatId}`);

    channel.bind("new-message", (data: { message: ChatMessage }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    });

    chatPusherRef.current = pusher;
    chatChannelRef.current = channel;

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`custom-chat-${selectedChatId}`);
      pusher.disconnect();
      chatPusherRef.current = null;
      chatChannelRef.current = null;
    };
  }, [selectedChatId]);

  // ── Select chat → fetch detail ──────────────────────────────────────────────

  const handleSelectChat = async (chat: CustomChat) => {
    setSelectedChat(chat);
    setMessages([]);
    setReply("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setLoadingMessages(true);

    try {
      const res = await fetch(`/api/custom-chat/${chat.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedChat(data.customChat);
      setMessages(data.customChat.messages ?? []);
    } catch {
      // silent
    } finally {
      setLoadingMessages(false);
    }
  };

  // ── Auto-scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── PATCH status / prioritas ────────────────────────────────────────────────

  const patchChat = async (
    id: number,
    patch: { status?: string; prioritas?: string },
  ) => {
    try {
      const res = await fetch(`/api/custom-chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSelectedChat(data.customChat);
      setChats((prev) => prev.map((c) => (c.id === id ? data.customChat : c)));
    } catch {
      // silent
    }
  };

  // ── Upload photo ────────────────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  // ── Send message ────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!selectedChat) return;
    if (!reply.trim() && !photoFile) return;

    setSending(true);
    let fotoUrl: string | undefined;

    try {
      // 1. Upload photo if any
      if (photoFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fotoUrl = uploadData.url;
        }
        setUploading(false);
      }

      // 2. Send message
      const res = await fetch(`/api/custom-chat/${selectedChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          konten: reply.trim() || (fotoUrl ? "[Foto]" : ""),
          ...(fotoUrl ? { foto_url: fotoUrl } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        setReply("");
        removePhoto();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered chat list ──────────────────────────────────────────────────────

  const filteredChats = chats.filter((c) => {
    if (filterTab === "all") return true;
    return c.status === filterTab;
  });

  const tabCounts = {
    all: chats.length,
    open: chats.filter((c) => c.status === "open").length,
    in_progress: chats.filter((c) => c.status === "in_progress").length,
    closed: chats.filter((c) => c.status === "closed").length,
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Chat List
      ══════════════════════════════════════════════════════ */}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } w-full md:w-1/3 min-w-0 border-r border-white/10 flex-col bg-slate-900/50`}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-white">Custom Chat</h2>
            </div>
            <button
              onClick={fetchChats}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {(
              [
                { key: "all", label: "All" },
                { key: "open", label: "Open" },
                { key: "in_progress", label: "Progress" },
                { key: "closed", label: "Closed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={[
                  "flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                  filterTab === tab.key
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent",
                ].join(" ")}
              >
                {tab.label}
                <span className="ml-1 opacity-70">({tabCounts[tab.key]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Memuat chat…</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
              <Inbox className="w-10 h-10 opacity-30" />
              <p className="text-sm">Tidak ada chat</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMsg = chat.messages?.[0];
              const isSelected = selectedChat?.id === chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={[
                    "w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-all",
                    isSelected
                      ? "bg-indigo-600/15 border-l-2 border-l-indigo-500"
                      : "hover:bg-white/[0.03] border-l-2 border-l-transparent",
                  ].join(" ")}
                >
                  {/* Row 1: name + time */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-[13px] font-semibold text-slate-200 truncate">
                        {chat.user.nama}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 shrink-0 ml-2">
                      {relativeTime(chat.diperbarui_pada)}
                    </span>
                  </div>

                  {/* Row 2: judul */}
                  <p className="text-[12px] text-slate-300 font-medium truncate mb-1.5">
                    {chat.judul}
                  </p>

                  {/* Row 3: last message preview */}
                  {lastMsg && (
                    <p className="text-[11px] text-slate-600 truncate mb-2">
                      {lastMsg.foto_url ? "📷 Foto" : lastMsg.konten}
                    </p>
                  )}

                  {/* Row 4: badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={chat.status} size="xs" />
                    <PriorityBadge prioritas={chat.prioritas} size="xs" />
                    {chat.aspirasi?.nomor_tiket && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[10px] font-semibold text-slate-300">
                        {chat.aspirasi.nomor_tiket}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Chat Detail
      ══════════════════════════════════════════════════════ */}
      <div
        className={`${
          selectedChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col min-w-0 bg-slate-950/50`}
      >
        {!selectedChat ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
            <MessageSquare className="w-16 h-16 opacity-20" />
            <div className="text-center">
              <p className="text-base font-semibold">Pilih percakapan</p>
              <p className="text-sm mt-1 opacity-70">
                Klik chat di kiri untuk mulai membalas
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Chat Header ─────────────────────────────────── */}
            <div className="px-3 sm:px-5 py-3.5 border-b border-white/10 bg-slate-900/60 backdrop-blur-sm flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden mb-2 text-xs text-indigo-300 hover:text-indigo-200"
                >
                  ← Kembali ke daftar
                </button>
                <p className="text-white font-semibold truncate">
                  {selectedChat.judul}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[12px] text-slate-400">
                    <User className="w-3 h-3" />
                    {selectedChat.user.nama}
                    {selectedChat.user.kelas && (
                      <span className="text-slate-600">
                        · {selectedChat.user.kelas}
                      </span>
                    )}
                  </span>
                  {selectedChat.user.nisn && (
                    <span className="text-[11px] text-slate-600">
                      NISN: {selectedChat.user.nisn}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Clock className="w-3 h-3" />
                    {relativeTime(selectedChat.dibuat_pada)}
                  </span>
                  {selectedChat.aspirasi?.nomor_tiket && (
                    <span className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      Tiket {selectedChat.aspirasi.nomor_tiket}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <PrioritySelect
                  value={selectedChat.prioritas}
                  onChange={(val) =>
                    patchChat(selectedChat.id, { prioritas: val })
                  }
                />
                <StatusSelect
                  value={selectedChat.status}
                  onChange={(val) =>
                    patchChat(selectedChat.id, { status: val })
                  }
                />
              </div>
            </div>

            {/* ── Messages Area ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-sm">Memuat pesan…</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                  <AlertCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Belum ada pesan</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isAdmin
                            ? "bg-indigo-600/30 text-indigo-300"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {isAdmin
                          ? "A"
                          : (msg.sender?.nama?.[0]?.toUpperCase() ?? "U")}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[65%] ${isAdmin ? "items-end" : "items-start"} flex flex-col gap-1`}
                      >
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                            isAdmin
                              ? "bg-indigo-600/30 text-indigo-100 rounded-tr-sm border border-indigo-500/20"
                              : "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
                          }`}
                        >
                          {msg.konten && (
                            <p className="whitespace-pre-wrap break-words">
                              {msg.konten}
                            </p>
                          )}
                          {msg.foto_url && (
                            <img
                              src={msg.foto_url}
                              alt="Lampiran"
                              className="mt-2 rounded-lg max-w-full max-h-48 object-contain border border-white/10 cursor-pointer"
                              onClick={() =>
                                window.open(msg.foto_url!, "_blank")
                              }
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-600">
                            {msg.sender?.nama ?? (isAdmin ? "Admin" : "User")}
                          </span>
                          <span className="text-[10px] text-slate-700">·</span>
                          <span className="text-[10px] text-slate-700">
                            {relativeTime(msg.dibuat_pada)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ───────────────────────────────────── */}
            {selectedChat.status !== "closed" && (
              <div className="px-5 py-4 border-t border-white/10 bg-slate-900/60">
                {/* Photo preview */}
                {photoPreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-24 rounded-xl border border-white/10 object-contain bg-slate-800"
                    />
                    <button
                      onClick={removePhoto}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2.5">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                  {/* Upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors shrink-0 disabled:opacity-50"
                    title="Lampirkan foto"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Textarea */}
                  <div className="flex-1 relative">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tulis balasan… (Ctrl+Enter untuk kirim)"
                      rows={2}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all scrollbar-thin"
                    />
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSend}
                    disabled={sending || (!reply.trim() && !photoFile)}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-colors shrink-0"
                    title="Kirim (Ctrl+Enter)"
                  >
                    {sending || uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-700 mt-1.5 text-right">
                  Ctrl+Enter untuk kirim
                </p>
              </div>
            )}

            {/* Closed notice */}
            {selectedChat.status === "closed" && (
              <div className="px-5 py-3 border-t border-white/5 bg-slate-900/40 text-center">
                <p className="text-xs text-slate-600">
                  Chat ini sudah ditutup. Ubah status untuk membuka kembali.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function CustomChatPage() {
  return <CustomChatAdmin />;
}
