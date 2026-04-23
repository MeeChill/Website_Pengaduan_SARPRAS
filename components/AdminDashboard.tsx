'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Aspirasi {
  id: number;
  status: string;
  tanggal_input: string;
}

interface StatusCount {
  pending: number;
  dalam_progres: number;
  selesai: number;
}

export default function AdminDashboard() {
  const [aspirasi, setAspirasi] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusCount, setStatusCount] = useState<StatusCount>({
    pending: 0,
    dalam_progres: 0,
    selesai: 0
  });

  useEffect(() => {
    fetchAspirasi();
  }, []);

  const fetchAspirasi = async () => {
    try {
      const response = await fetch('/api/aspirasi');
      const data = await response.json();
      setAspirasi(data.aspirasi);
      
      // Calculate status counts
      const counts = {
        pending: 0,
        dalam_progres: 0,
        selesai: 0
      };
      
      data.aspirasi.forEach((item: Aspirasi) => {
        counts[item.status as keyof StatusCount]++;
      });
      
      setStatusCount(counts);
    } catch (error) {
      console.error('Error fetching aspirasi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion rate
  const completionRate = aspirasi.length > 0 
    ? Math.round((statusCount.selesai / aspirasi.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 p-5 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse-glow delay-1000"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-indigo-200/80 text-sm sm:text-lg font-medium">Pantau dan kelola semua pengaduan dengan mudah.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Pengaduan</p>
              <p className="text-2xl font-bold text-white mt-1">{aspirasi.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-white mt-1">{statusCount.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Dalam Proses</p>
              <p className="text-2xl font-bold text-white mt-1">{statusCount.dalam_progres}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Selesai</p>
              <p className="text-2xl font-bold text-white mt-1">{statusCount.selesai}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Completion Chart */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-white/5 p-6 shadow-lg">
          <h3 className="text-white font-bold mb-6 text-lg">Tingkat Penyelesaian</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-700" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(completionRate / 100) * 283} 283`}
                  className="text-emerald-400 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{completionRate}%</p>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm text-center">
              {statusCount.selesai} dari {aspirasi.length} pengaduan telah selesai
            </p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-6 shadow-lg">
          <h3 className="text-white font-bold mb-6 text-lg">Distribusi Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Pending</span>
                <span className="text-slate-400 text-xs font-medium">{statusCount.pending} ({aspirasi.length > 0 ? Math.round((statusCount.pending / aspirasi.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: aspirasi.length > 0 ? `${(statusCount.pending / aspirasi.length) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Dalam Proses</span>
                <span className="text-slate-400 text-xs font-medium">{statusCount.dalam_progres} ({aspirasi.length > 0 ? Math.round((statusCount.dalam_progres / aspirasi.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: aspirasi.length > 0 ? `${(statusCount.dalam_progres / aspirasi.length) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Selesai</span>
                <span className="text-slate-400 text-xs font-medium">{statusCount.selesai} ({aspirasi.length > 0 ? Math.round((statusCount.selesai / aspirasi.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: aspirasi.length > 0 ? `${(statusCount.selesai / aspirasi.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="glass-panel rounded-2xl border border-white/5 p-5 sm:p-8 shadow-lg text-center">
        <h3 className="text-white font-bold mb-3 text-lg">Kelola Pengaduan</h3>
        <p className="text-slate-400 mb-6">Akses semua fitur manajemen pengaduan di halaman management</p>
        <Link
          href="/admin/management"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
        >
          Buka Management
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}