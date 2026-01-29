import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { CategoryChart, StatusPieChart, TrendLineChart } from "./charts"

// --- Icons ---
const IconAspirasi = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
)
const IconPending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
const IconProcess = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
)
const IconDone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

// --- Modern Components ---
const ModernStatCard = ({ title, value, icon, gradient }: { title: string, value: number, icon: React.ReactNode, gradient: string }) => (
  <div className="modern-card p-6 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
      <div className={`w-24 h-24 rounded-full blur-2xl ${gradient}`}></div>
    </div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl shadow-lg ${gradient} bg-opacity-80`}>
        {icon}
      </div>
    </div>
  </div>
)

const ActionButton = ({ href, label, colorClass, pulse = false }: { href: string, label: string, colorClass: string, pulse?: boolean }) => (
  <Link href={href} className={`flex-1 py-4 px-6 rounded-xl border border-white/5 backdrop-blur-sm transition-all duration-300 group ${colorClass}`}>
    <div className="flex items-center justify-between">
      <span className="font-semibold">{label}</span>
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transform group-hover:translate-x-1 transition-transform ${pulse ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  </Link>
)

const AdminDashboard = ({ stats, charts }: { stats: any, charts: any }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Admin Overview
      </h1>
      <p className="text-slate-400 mt-1">Manage aspirations and monitor system performance.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ModernStatCard title="Aspirasi Baru" value={stats.new_aspirasi} icon={<IconAspirasi />} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
      <ModernStatCard title="Menunggu Yayasan" value={stats.pending_yayasan} icon={<IconPending />} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
      <ModernStatCard title="Dalam Proses" value={stats.process} icon={<IconProcess />} gradient="bg-gradient-to-br from-cyan-500 to-teal-600" />
      <ModernStatCard title="Selesai" value={stats.done} icon={<IconDone />} gradient="bg-gradient-to-br from-emerald-500 to-green-600" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
          Aspirasi per Kategori
        </h3>
        <CategoryChart data={charts.categories} />
      </div>
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
          Tren Pengaduan (7 Hari Terakhir)
        </h3>
        <TrendLineChart data={charts.trends} />
      </div>
    </div>

    <div className="glass-panel p-8 rounded-2xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
        Quick Actions
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        <ActionButton 
          href="/dashboard/aspirasi" 
          label="Manage All Tasks" 
          colorClass="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200" 
        />
        {stats.new_aspirasi > 0 && (
          <ActionButton 
            href="/dashboard/aspirasi" 
            label={`Review Pending (${stats.new_aspirasi})`} 
            colorClass="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200" 
            pulse={true}
          />
        )}
      </div>
    </div>
  </div>
)

const SiswaDashboard = ({ stats, user, feed }: { stats: any, user: any, feed: any[] }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Hello, {user.name || user.nama}
        </h1>
        <p className="text-slate-400 mt-1">Welcome to your student aspiration portal.</p>
      </div>
      <Link href="/dashboard/aspirasi/create" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 font-medium flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        New Aspiration
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ModernStatCard title="My Aspirations" value={stats.total} icon={<IconAspirasi />} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
      <ModernStatCard title="Processing" value={stats.process} icon={<IconProcess />} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
      <ModernStatCard title="Pending" value={stats.pending} icon={<IconPending />} gradient="bg-gradient-to-br from-amber-500 to-yellow-600" />
      <ModernStatCard title="Resolved" value={stats.done} icon={<IconDone />} gradient="bg-gradient-to-br from-emerald-500 to-green-600" />
    </div>

    {/* Public Feed Section */}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Public Feed
        </h2>
        <Link href="/dashboard/aspirasi" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All &rarr;</Link>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {feed.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
            <p className="text-slate-500 italic">No public aspirations yet.</p>
          </div>
        ) : (
          feed.map((item) => (
            <div key={item.id} className="modern-card p-6 hover:bg-white/5 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/10">
                    {item.input_aspirasi.siswa.nama.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{item.input_aspirasi.judul}</h3>
                    <p className="text-sm text-slate-400">
                      {item.input_aspirasi.siswa.nama} • {new Date(item.input_aspirasi.tanggal_input).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  item.status_progres === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  item.status_progres === 'dalam_progres' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  'bg-slate-700/50 text-slate-400 border-slate-600'
                }`}>
                  {item.status_progres.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-300 line-clamp-2 mb-4 pl-14">{item.input_aspirasi.deskripsi}</p>
              <div className="pl-14">
                <Link href={`/dashboard/aspirasi/${item.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm hover:underline inline-flex items-center gap-1">
                  Read Details <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)

const YayasanDashboard = ({ stats, charts }: { stats: any, charts: any }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-white tracking-tight">
        Executive Dashboard
      </h1>
      <p className="text-slate-400 mt-1">High-level overview and validation control.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ModernStatCard title="Total Masuk" value={stats.total} icon={<IconAspirasi />} gradient="bg-gradient-to-br from-slate-500 to-slate-600" />
      <ModernStatCard title="Perlu Validasi" value={stats.pending} icon={<IconPending />} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
      <ModernStatCard title="Disetujui" value={stats.approved} icon={<IconDone />} gradient="bg-gradient-to-br from-indigo-500 to-blue-600" />
      <ModernStatCard title="Ditolak" value={stats.rejected} icon={<IconAspirasi />} gradient="bg-gradient-to-br from-red-500 to-rose-600" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
          Statistik Kategori
        </h3>
        <CategoryChart data={charts.categories} />
      </div>
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
          Status Distribusi
        </h3>
        <StatusPieChart data={charts.status} />
      </div>
    </div>

    <div className="glass-panel p-8 rounded-2xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
        Executive Actions
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        <ActionButton 
          href="/dashboard/aspirasi" 
          label="View All Reports" 
          colorClass="bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white" 
        />
        <ActionButton 
          href="/dashboard/aspirasi" 
          label={`Validate Pending (${stats.pending})`} 
          colorClass="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200" 
          pulse={stats.pending > 0}
        />
        <ActionButton 
          href="/dashboard/rekap" 
          label="Generate Reports" 
          colorClass="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200" 
        />
      </div>
    </div>
  </div>
)

// Helper to execute DB calls with simple retry
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying DB call... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  let stats = {
    total: 0,
    pending: 0,
    process: 0,
    done: 0,
    approved: 0,
    rejected: 0,
    new_aspirasi: 0,
    pending_yayasan: 0
  }

  let feed: any[] = []
  let charts: {
    categories: any[],
    trends: any[],
    status: any[]
  } = {
    categories: [],
    trends: [],
    status: []
  }

  try {
    // Common chart data fetching
    const [categoriesRaw, aspirationsRaw] = await Promise.all([
      prisma.kategori.findMany({
        include: { _count: { select: { input_aspirasi: true } } }
      }),
      prisma.aspirasi.findMany({
        include: { input_aspirasi: true }
      })
    ])

    charts.categories = categoriesRaw.map(cat => ({
      name: cat.nama_kategori,
      total: cat._count.input_aspirasi
    }))

    // Trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    charts.trends = last7Days.map(date => ({
      date: date.split('-').slice(1).join('/'),
      total: aspirationsRaw.filter(a => a.input_aspirasi.tanggal_input.toISOString().split('T')[0] === date).length
    }))

    // Status for Pie Chart
    charts.status = [
      { name: 'Pending', value: aspirationsRaw.filter(a => a.status_validasi === 'pending').length },
      { name: 'Diajukan', value: aspirationsRaw.filter(a => a.status_validasi === 'diajukan').length },
      { name: 'Disetujui', value: aspirationsRaw.filter(a => a.status_validasi === 'disetujui').length },
      { name: 'Dalam Proses', value: aspirationsRaw.filter(a => a.status_progres === 'dalam_progres').length },
      { name: 'Selesai', value: aspirationsRaw.filter(a => a.status_progres === 'selesai').length },
    ].filter(s => s.value > 0)

    if (user.role === 'admin') {
      // Admin focuses on New (pending) and Approved (to process)
      const [new_aspirasi, pending_yayasan, process, done] = await withRetry(() => Promise.all([
        prisma.aspirasi.count({ where: { status_validasi: 'pending' } }),
        prisma.aspirasi.count({ where: { status_validasi: 'diajukan' } }),
        prisma.aspirasi.count({ where: { status_progres: 'dalam_progres' } }),
        prisma.aspirasi.count({ where: { status_progres: 'selesai' } }),
      ]))
      stats = { ...stats, new_aspirasi, pending_yayasan, process, done }
    } else if (user.role === 'yayasan') {
      // Yayasan sees 'diajukan' as pending validation
      const [total, pending, approved, rejected] = await withRetry(() => Promise.all([
        prisma.aspirasi.count(),
        prisma.aspirasi.count({ where: { status_validasi: 'diajukan' } }),
        prisma.aspirasi.count({ where: { status_validasi: 'disetujui' } }),
        prisma.aspirasi.count({ where: { status_validasi: 'ditolak' } }),
      ]))
      stats = { ...stats, total, pending, approved, rejected }
    } else {
      // Siswa sees own stats AND Public Feed
      const [total, pending, process, done] = await withRetry(() => Promise.all([
        prisma.inputAspirasi.count({ where: { siswa_id: parseInt(user.id) } }),
        prisma.inputAspirasi.count({ 
          where: { 
            siswa_id: parseInt(user.id),
            aspirasi: { status_validasi: 'pending' }
          } 
        }),
        prisma.inputAspirasi.count({ 
          where: { 
            siswa_id: parseInt(user.id),
            aspirasi: { status_progres: 'dalam_progres' }
          } 
        }),
        prisma.inputAspirasi.count({ 
          where: { 
            siswa_id: parseInt(user.id),
            aspirasi: { status_progres: 'selesai' }
          } 
        }),
      ]))
      stats = { ...stats, total, pending, process, done }

      // Fetch Public Feed (Approved Aspirations)
      feed = await withRetry(() => prisma.aspirasi.findMany({
        where: { status_validasi: 'disetujui' },
        include: {
          input_aspirasi: {
            include: {
              siswa: true,
              kategori: true
            }
          }
        },
        orderBy: { id: 'desc' },
        take: 5 // Limit feed to 5 latest
      }))
    }
  } catch (error) {
    console.error("Critical Dashboard Error:", error);
    // Return empty state instead of crashing if possible, 
    // or just let it throw if we can't do anything.
  }

  return (
    <div>
      {user.role === 'admin' && <AdminDashboard stats={stats} charts={charts} />}
      {user.role === 'siswa' && <SiswaDashboard stats={stats} user={user} feed={feed} />}
      {user.role === 'yayasan' && <YayasanDashboard stats={stats} charts={charts} />}
    </div>
  )
}
