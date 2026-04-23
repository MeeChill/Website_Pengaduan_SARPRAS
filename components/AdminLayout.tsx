"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  Home,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";
import NotificationBell from "@/components/NotificationBell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const syncViewport = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: Home,
      description: "Overview dan statistik",
    },
    {
      label: "Manajemen Pengaduan",
      href: "/admin/management",
      icon: FileText,
      description: "Kelola semua pengaduan",
    },
    {
      label: "Kelola User",
      href: "/admin/users",
      icon: Users,
      description: "Manajemen pengguna sistem",
    },
    {
      label: "Laporan",
      href: "/admin/reports",
      icon: BarChart3,
      description: "Analisis dan laporan",
    },
    {
      label: "Custom Chat",
      href: "/admin/custom-chat",
      icon: MessageSquare,
      description: "Kelola pertanyaan user",
    },
    {
      label: "Pengaturan",
      href: "/admin/settings",
      icon: Settings,
      description: "Konfigurasi sistem",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(href);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Sidebar */}
      <motion.div
        className={`${isMobile ? "fixed z-40 left-0 top-0 h-full" : "relative h-full"} ${isOpen ? "w-72" : "w-24"} bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/10 transition-all duration-300 flex flex-col`}
        animate={
          isMobile
            ? { x: isOpen ? 0 : -288, width: 288 }
            : { width: isOpen ? 288 : 96 }
        }
        transition={{ duration: 0.3 }}
      >
        {/* Logo Area */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <div>
                <p className="font-bold text-white text-sm">Neo-Sarana</p>
                <p className="text-slate-400 text-xs">Admin Panel</p>
              </div>
            )}
          </motion.div>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <motion.nav
          className="flex-1 overflow-y-auto p-3 space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <motion.div key={item.href} variants={itemVariants}>
                <Link href={item.href}>
                  <motion.div
                    className={`relative p-3 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-indigo-600/20 border border-indigo-500/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {active && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-indigo-500/10 border border-indigo-500/30"
                        layoutId="activeIndicator"
                      />
                    )}

                    <div className="relative flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 mt-0.5 transition-colors ${
                          active
                            ? "text-indigo-400"
                            : "text-slate-400 group-hover:text-slate-300"
                        }`}
                      />
                      {isOpen && (
                        <div className="text-left">
                          <p
                            className={`font-medium text-sm transition-colors ${
                              active
                                ? "text-indigo-300"
                                : "text-slate-300 group-hover:text-white"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* User Section */}
        <motion.div
          className="p-3 border-t border-white/10 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium text-sm">Logout</span>}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        animate={{
          marginLeft: 0,
        }}
      >
        {/* Top Header */}
        <div className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-3 sm:px-6 gap-2">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-slate-300"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <motion.h1
            className="text-sm sm:text-lg font-bold text-white truncate"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {menuItems.find((item) => isActive(item.href))?.label ||
              "Admin Panel"}
          </motion.h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell role="admin" />
            <div className="text-right hidden sm:block">
              <p className="text-sm text-slate-300">Admin</p>
              <p className="text-xs text-slate-500">Sistem Pengaduan</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
