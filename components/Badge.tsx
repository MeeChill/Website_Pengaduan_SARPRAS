"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Config Maps
// ─────────────────────────────────────────────────────────────────────────────

export type StatusKey =
  | "pending"
  | "dalam_progres"
  | "selesai"
  | "open"
  | "in_progress"
  | "closed";

export type PriorityKey = "urgent" | "high" | "normal" | "low";

interface BadgeConfig {
  label: string;
  dot: string;        // dot bg color
  text: string;       // text color
  bg: string;         // background
  border: string;     // border color
  glow: string;       // box-shadow glow
}

const STATUS_MAP: Record<StatusKey, BadgeConfig> = {
  pending: {
    label: "Menunggu",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  open: {
    label: "Open",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  dalam_progres: {
    label: "Diproses",
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
  },
  in_progress: {
    label: "Proses",
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
  },
  selesai: {
    label: "Selesai",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  closed: {
    label: "Selesai",
    dot: "bg-slate-400",
    text: "text-slate-400",
    bg: "bg-slate-700/30",
    border: "border-slate-600/40",
    glow: "shadow-slate-700/10",
  },
};

const PRIORITY_MAP: Record<PriorityKey, BadgeConfig> = {
  urgent: {
    label: "Urgent",
    dot: "bg-red-400",
    text: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
  },
  high: {
    label: "Tinggi",
    dot: "bg-orange-400",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
  },
  normal: {
    label: "Normal",
    dot: "bg-indigo-400",
    text: "text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    glow: "shadow-indigo-500/20",
  },
  low: {
    label: "Rendah",
    dot: "bg-slate-400",
    text: "text-slate-400",
    bg: "bg-slate-700/30",
    border: "border-slate-600/40",
    glow: "shadow-slate-700/10",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Size variants
// ─────────────────────────────────────────────────────────────────────────────

type BadgeSize = "xs" | "sm" | "md";

const SIZE_CLASSES: Record<BadgeSize, { wrap: string; dot: string; text: string }> = {
  xs: {
    wrap: "px-2 py-0.5 gap-1.5",
    dot: "w-1.5 h-1.5",
    text: "text-[10px] leading-none",
  },
  sm: {
    wrap: "px-2.5 py-1 gap-1.5",
    dot: "w-2 h-2",
    text: "text-[11px] leading-none",
  },
  md: {
    wrap: "px-3 py-1.5 gap-2",
    dot: "w-2 h-2",
    text: "text-xs leading-none",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Base Badge (internal)
// ─────────────────────────────────────────────────────────────────────────────

interface BaseBadgeProps {
  config: BadgeConfig;
  size?: BadgeSize;
  pulse?: boolean;
  className?: string;
  label?: string; // override label
}

function BaseBadge({ config, size = "sm", pulse = false, className = "", label }: BaseBadgeProps) {
  const s = SIZE_CLASSES[size];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-semibold whitespace-nowrap shrink-0 shadow-sm",
        s.wrap,
        config.bg,
        config.border,
        config.text,
        config.glow,
        className,
      ].join(" ")}
    >
      {/* Dot indicator */}
      <span className={["rounded-full shrink-0", s.dot, config.dot, pulse ? "animate-pulse" : ""].join(" ")} />
      {/* Label */}
      <span className={s.text}>{label ?? config.label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public exports
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  size?: BadgeSize;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = "sm", pulse, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status as StatusKey] ?? STATUS_MAP.pending;
  const isPending = status === "pending" || status === "open";
  return (
    <BaseBadge
      config={config}
      size={size}
      pulse={pulse ?? isPending}
      className={className}
    />
  );
}

interface PriorityBadgeProps {
  prioritas: string;
  size?: BadgeSize;
  pulse?: boolean;
  className?: string;
}

export function PriorityBadge({ prioritas, size = "sm", pulse, className }: PriorityBadgeProps) {
  const config = PRIORITY_MAP[prioritas as PriorityKey] ?? PRIORITY_MAP.normal;
  const isUrgent = prioritas === "urgent";
  return (
    <BaseBadge
      config={config}
      size={size}
      pulse={pulse ?? isUrgent}
      className={className}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grouped badge row (status + priority together)
// ─────────────────────────────────────────────────────────────────────────────

interface BadgeRowProps {
  status: string;
  prioritas?: string;
  size?: BadgeSize;
  className?: string;
}

export function BadgeRow({ status, prioritas, size = "sm", className = "" }: BadgeRowProps) {
  return (
    <div className={["flex items-center gap-1.5 flex-wrap", className].join(" ")}>
      <StatusBadge status={status} size={size} />
      {prioritas && <PriorityBadge prioritas={prioritas} size={size} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown-style badge button (used in admin header controls)
// ─────────────────────────────────────────────────────────────────────────────

import { ChevronDown } from "lucide-react";

interface BadgeSelectProps {
  value: string;
  options: { value: string; config: BadgeConfig }[];
  onChange: (val: string) => void;
  size?: BadgeSize;
}

export function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const entries = Object.entries(STATUS_MAP) as [StatusKey, BadgeConfig][];
  // Only show canonical keys (no duplicates)
  const unique = entries.filter(([k]) => ["open", "in_progress", "closed"].includes(k));
  const cfg = STATUS_MAP[value as StatusKey] ?? STATUS_MAP.open;
  const s = SIZE_CLASSES["sm"];

  return (
    <div className="relative group">
      {/* Trigger */}
      <button
        className={[
          "inline-flex items-center rounded-full border font-semibold whitespace-nowrap shrink-0 shadow-sm transition-all hover:brightness-110",
          s.wrap, "gap-1",
          cfg.bg, cfg.border, cfg.text, cfg.glow,
        ].join(" ")}
      >
        <span className={["rounded-full shrink-0 animate-pulse", s.dot, cfg.dot].join(" ")} />
        <span className={s.text}>{cfg.label}</span>
        <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-[calc(100%+6px)] hidden group-hover:flex group-focus-within:flex flex-col z-30 min-w-[120px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {unique.map(([k, c]) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={[
              "flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors",
              value === k ? "bg-white/5" : "",
            ].join(" ")}
          >
            <span className={["w-1.5 h-1.5 rounded-full shrink-0", c.dot].join(" ")} />
            <span className={["text-[11px] font-semibold", c.text].join(" ")}>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PrioritySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const entries = Object.entries(PRIORITY_MAP) as [PriorityKey, BadgeConfig][];
  const cfg = PRIORITY_MAP[value as PriorityKey] ?? PRIORITY_MAP.normal;
  const s = SIZE_CLASSES["sm"];

  return (
    <div className="relative group">
      {/* Trigger */}
      <button
        className={[
          "inline-flex items-center rounded-full border font-semibold whitespace-nowrap shrink-0 shadow-sm transition-all hover:brightness-110",
          s.wrap, "gap-1",
          cfg.bg, cfg.border, cfg.text, cfg.glow,
        ].join(" ")}
      >
        <span className={["rounded-full shrink-0", s.dot, value === "urgent" ? "animate-pulse" : ""].join(" ")} style={{ width: "8px", height: "8px" }} />
        <span className={s.text}>{cfg.label}</span>
        <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-[calc(100%+6px)] hidden group-hover:flex group-focus-within:flex flex-col z-30 min-w-[120px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {entries.map(([k, c]) => (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={[
              "flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors",
              value === k ? "bg-white/5" : "",
            ].join(" ")}
          >
            <span className={["w-1.5 h-1.5 rounded-full shrink-0", c.dot].join(" ")} />
            <span className={["text-[11px] font-semibold", c.text].join(" ")}>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Management table badge (larger, with icon)
// ─────────────────────────────────────────────────────────────────────────────

import { Clock, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_ICON: Partial<Record<StatusKey, React.ReactNode>> = {
  pending: <Clock className="w-3 h-3" />,
  dalam_progres: <AlertCircle className="w-3 h-3" />,
  selesai: <CheckCircle className="w-3 h-3" />,
};

export function ManagementStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status as StatusKey] ?? STATUS_MAP.pending;
  const icon = STATUS_ICON[status as StatusKey];
  const isPending = status === "pending";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-xs whitespace-nowrap shadow-sm",
        config.bg,
        config.border,
        config.text,
        config.glow,
      ].join(" ")}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span
        className={[
          "w-1.5 h-1.5 rounded-full shrink-0",
          config.dot,
          isPending ? "animate-pulse" : "",
        ].join(" ")}
      />
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}
