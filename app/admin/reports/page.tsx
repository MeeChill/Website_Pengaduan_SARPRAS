'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Calendar, BarChart3, PieChart, LineChart, Filter } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportStats {
  totalAspirasi: number;
  pending: number;
  dalamProgres: number;
  selesai: number;
  averageResolutionTime: string;
  completionRate: number;
  statusDistribution: {
    pending: number;
    dalam_progres: number;
    selesai: number;
  };
  categoryDistribution: Record<string, number>;
}

interface AspirasiItem {
  nomor_tiket: string;
  judul: string;
  lokasi: string;
  status: string;
  tanggal_input: string;
  tanggal_selesai?: string | null;
  rating?: number | null;
  feedback?: string | null;
  kategori?: { nama_kategori?: string };
  user?: { nama?: string };
}

export default function Reports() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [aspirasiData, setAspirasiData] = useState<AspirasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const filteredAspirasi = useMemo(() => {
    return aspirasiData.filter((item) => {
      const itemTime = new Date(item.tanggal_input).getTime();
      const startTime = startDate ? new Date(startDate).getTime() : null;
      const endTime = endDate ? new Date(endDate).getTime() : null;

      if (startTime && itemTime < startTime) return false;
      if (endTime && itemTime > endTime) return false;
      return true;
    });
  }, [aspirasiData, startDate, endDate]);

  useEffect(() => {
    const currentData = filteredAspirasi;
    const nextStats: ReportStats = {
      totalAspirasi: currentData.length,
      pending: currentData.filter((a: any) => a.status === 'pending').length,
      dalamProgres: currentData.filter((a: any) => a.status === 'dalam_progres').length,
      selesai: currentData.filter((a: any) => a.status === 'selesai').length,
      averageResolutionTime: '5.2 hari',
      completionRate: currentData.length > 0 ? Math.round((currentData.filter((a: any) => a.status === 'selesai').length / currentData.length) * 100) : 0,
      statusDistribution: {
        pending: currentData.filter((a: any) => a.status === 'pending').length,
        dalam_progres: currentData.filter((a: any) => a.status === 'dalam_progres').length,
        selesai: currentData.filter((a: any) => a.status === 'selesai').length
      },
      categoryDistribution: currentData.reduce((acc: Record<string, number>, a: any) => {
        const cat = a.kategori?.nama_kategori || 'Lainnya';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {})
    };
    setStats(nextStats);
  }, [filteredAspirasi]);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/aspirasi');
      if (response.ok) {
        const data = await response.json();
        const aspirasi = data.aspirasi as AspirasiItem[];
        setAspirasiData(aspirasi);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (filteredAspirasi.length === 0) return;

    const rows = filteredAspirasi.map((a, idx) => [
      idx + 1,
      a.nomor_tiket,
      a.judul,
      a.kategori?.nama_kategori || "-",
      a.user?.nama || "-",
      a.lokasi,
      a.status.replace("_", " "),
      new Date(a.tanggal_input).toLocaleString("id-ID"),
      a.tanggal_selesai ? new Date(a.tanggal_selesai).toLocaleString("id-ID") : "-",
      a.rating ?? "-",
      a.feedback ?? "-",
    ]);

    const aoa = [
      ["LAPORAN ASPIRASI NEO-SARANA"],
      [`Tanggal Export: ${new Date().toLocaleString("id-ID")}`],
      [],
      [
        "No",
        "Nomor Tiket",
        "Judul",
        "Kategori",
        "Pelapor",
        "Lokasi",
        "Status",
        "Tanggal Input",
        "Tanggal Selesai",
        "Rating",
        "Feedback",
      ],
      ...rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
    ws["!cols"] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 32 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 10 },
      { wch: 45 },
    ];

    ws["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E3A8A" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
    ws["A2"].s = {
      font: { italic: true, color: { rgb: "475569" } },
    };

    for (let c = 0; c <= 10; c += 1) {
      const cell = XLSX.utils.encode_cell({ r: 3, c });
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "0F766E" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } },
          },
        };
      }
    }

    for (let r = 4; r < aoa.length; r += 1) {
      for (let c = 0; c <= 10; c += 1) {
        const cell = XLSX.utils.encode_cell({ r, c });
        if (!ws[cell]) continue;
        ws[cell].s = {
          alignment: { vertical: "top", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "CBD5E1" } },
            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
            left: { style: "thin", color: { rgb: "CBD5E1" } },
            right: { style: "thin", color: { rgb: "CBD5E1" } },
          },
          fill: {
            fgColor: { rgb: r % 2 === 0 ? "F8FAFC" : "FFFFFF" },
          },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Aspirasi");
    XLSX.writeFile(wb, `laporan-aspirasi-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportPDF = () => {
    if (filteredAspirasi.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('LAPORAN ASPIRASI NEO-SARANA', 14, 14);
    doc.setFontSize(10);
    doc.text(`Tanggal Export: ${new Date().toLocaleString('id-ID')}`, 14, 21);

    autoTable(doc, {
      startY: 28,
      head: [[
        'No',
        'Nomor Tiket',
        'Judul',
        'Kategori',
        'Pelapor',
        'Lokasi',
        'Status',
        'Tanggal Input',
        'Tanggal Selesai',
        'Rating',
        'Feedback',
      ]],
      body: filteredAspirasi.map((a, idx) => [
        idx + 1,
        a.nomor_tiket,
        a.judul,
        a.kategori?.nama_kategori || '-',
        a.user?.nama || '-',
        a.lokasi,
        a.status.replace('_', ' '),
        new Date(a.tanggal_input).toLocaleString('id-ID'),
        a.tanggal_selesai ? new Date(a.tanggal_selesai).toLocaleString('id-ID') : '-',
        a.rating ? a.rating.toString() : '-',
        a.feedback || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [15, 118, 110] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`laporan-aspirasi-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-indigo-500 border-t-indigo-300 rounded-full"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-400"
        >
          Tidak ada data tersedia
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Laporan</h1>
          <p className="text-slate-400 mt-1">Analisis dan statistik pengaduan</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportPDF}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-rose-500/30"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/30"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Tanggal Mulai</p>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Tanggal Akhir</p>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            label: 'Total Pengaduan',
            value: stats.totalAspirasi,
            icon: BarChart3,
            color: 'from-indigo-500 to-indigo-600',
            trend: '+12%'
          },
          {
            label: 'Tingkat Penyelesaian',
            value: `${stats.completionRate}%`,
            icon: TrendingUp,
            color: 'from-emerald-500 to-emerald-600',
            trend: '+5%'
          },
          {
            label: 'Dalam Proses',
            value: stats.dalamProgres,
            icon: LineChart,
            color: 'from-blue-500 to-blue-600',
            trend: stats.dalamProgres > 0 ? '⚠️' : '✓'
          },
          {
            label: 'Rata-rata Waktu Resolusi',
            value: stats.averageResolutionTime,
            icon: Calendar,
            color: 'from-purple-500 to-purple-600',
            trend: '-2 hari'
          }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-400 text-sm font-medium">{metric.label}</h3>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white">{metric.value}</p>
                <span className="text-xs font-semibold text-emerald-400">{metric.trend}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            Distribusi Status Pengaduan
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Pending', value: stats.statusDistribution.pending, color: 'bg-amber-500', percent: stats.totalAspirasi > 0 ? Math.round((stats.statusDistribution.pending / stats.totalAspirasi) * 100) : 0 },
              { label: 'Dalam Proses', value: stats.statusDistribution.dalam_progres, color: 'bg-blue-500', percent: stats.totalAspirasi > 0 ? Math.round((stats.statusDistribution.dalam_progres / stats.totalAspirasi) * 100) : 0 },
              { label: 'Selesai', value: stats.statusDistribution.selesai, color: 'bg-emerald-500', percent: stats.totalAspirasi > 0 ? Math.round((stats.statusDistribution.selesai / stats.totalAspirasi) * 100) : 0 }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className="text-slate-400 text-sm">{item.value} ({item.percent}%)</span>
                </div>
                <motion.div
                  className="w-full h-3 bg-slate-700 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className={`h-full ${item.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/30 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Distribusi Kategori
          </h2>

          <div className="space-y-3">
            {Object.entries(stats.categoryDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count], i) => {
                const percent = stats.totalAspirasi > 0 ? Math.round((count / stats.totalAspirasi) * 100) : 0;
                const colors = ['from-indigo-500', 'from-purple-500', 'from-pink-500', 'from-rose-500', 'from-orange-500'];
                const color = colors[i % colors.length];

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm font-medium truncate">{category}</span>
                      <span className="text-slate-400 text-xs">{count} ({percent}%)</span>
                    </div>
                    <motion.div
                      className="w-full h-2 bg-slate-700 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className={`h-full bg-gradient-to-r ${color} to-indigo-600`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4">Ringkasan Performa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
          <div>
            <p className="text-sm text-slate-400 mb-1">Pengaduan Terselesaikan</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.selesai} dari {stats.totalAspirasi}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Persentase Penyelesaian</p>
            <p className="text-2xl font-bold text-indigo-400">{stats.completionRate}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Pengaduan Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Waktu Rata-rata Resolusi</p>
            <p className="text-2xl font-bold text-blue-400">{stats.averageResolutionTime}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
