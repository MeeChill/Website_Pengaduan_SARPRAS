import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import Link from "next/link"

// Components for different dashboards
const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
)

const AdminDashboard = ({ stats }: { stats: any }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-white">
        Admin Command Center
      </h1>
      <p className="text-slate-400 mt-1">Kelola aspirasi masuk dan progres pengerjaan.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Aspirasi Baru" value={stats.new_aspirasi} color="text-yellow-400" />
      <StatCard title="Menunggu Yayasan" value={stats.pending_yayasan} color="text-blue-400" />
      <StatCard title="Dalam Pengerjaan" value={stats.process} color="text-cyan-400" />
      <StatCard title="Selesai" value={stats.done} color="text-green-400" />
    </div>

    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">Aksi Cepat</h2>
      <div className="flex gap-4">
        <Link href="/dashboard/aspirasi" className="px-6 py-3 bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/40 text-cyan-300 rounded-lg transition-all">
          Lihat Semua Tugas
        </Link>
        {stats.new_aspirasi > 0 && (
          <Link href="/dashboard/aspirasi" className="px-6 py-3 bg-yellow-600/20 border border-yellow-500/50 hover:bg-yellow-600/40 text-yellow-300 rounded-lg transition-all animate-pulse">
            Perlu Tinjauan ({stats.new_aspirasi})
          </Link>
        )}
      </div>
    </div>
  </div>
)

const SiswaDashboard = ({ stats, user, feed }: { stats: any, user: any, feed: any[] }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Halo, {user.name || user.nama}
        </h1>
        <p className="text-slate-400 mt-1">Selamat datang di portal aspirasi siswa.</p>
      </div>
      <Link href="/dashboard/aspirasi/create" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium">
        + Buat Aspirasi Baru
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Aspirasi Saya" value={stats.total} color="text-purple-400" />
      <StatCard title="Sedang Diproses" value={stats.process} color="text-blue-400" />
      <StatCard title="Menunggu Respon" value={stats.pending} color="text-yellow-400" />
      <StatCard title="Terselesaikan" value={stats.done} color="text-green-400" />
    </div>

    {/* Public Feed Section */}
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Aspirasi Terbaru (Feed Publik)</h2>
      <div className="grid grid-cols-1 gap-4">
        {feed.length === 0 ? (
          <p className="text-slate-500 italic">Belum ada aspirasi yang dipublikasikan.</p>
        ) : (
          feed.map((item) => (
            <div key={item.id} className="glass-card p-6 rounded-xl hover:bg-slate-800/50 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-200">{item.input_aspirasi.judul}</h3>
                  <p className="text-sm text-slate-400">
                    Oleh <span className="font-medium text-slate-300">{item.input_aspirasi.siswa.nama}</span> • {new Date(item.input_aspirasi.tanggal_input).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  item.status_progres === 'selesai' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  item.status_progres === 'dalam_progres' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-slate-700/50 text-slate-400 border-slate-600'
                }`}>
                  {item.status_progres.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-400 line-clamp-2 mb-4">{item.input_aspirasi.deskripsi}</p>
              <Link href={`/dashboard/aspirasi/${item.id}`} className="text-blue-400 hover:text-blue-300 font-medium text-sm hover:underline">
                Lihat Detail &rarr;
              </Link>
            </div>
          ))
        )}
      </div>
      {feed.length > 0 && (
        <div className="text-center mt-4">
          <Link href="/dashboard/aspirasi" className="text-slate-400 hover:text-slate-300 font-medium text-sm">
            Lihat Semua Aspirasi Publik
          </Link>
        </div>
      )}
    </div>
  </div>
)

const YayasanDashboard = ({ stats }: { stats: any }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-3xl font-bold text-white">
        Executive Dashboard
      </h1>
      <p className="text-slate-400 mt-1">Validasi aspirasi masuk dan monitoring kinerja.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Total Masuk" value={stats.total} color="text-emerald-400" />
      <StatCard title="Perlu Validasi" value={stats.pending} color="text-yellow-400" />
      <StatCard title="Disetujui" value={stats.approved} color="text-blue-400" />
      <StatCard title="Ditolak" value={stats.rejected} color="text-red-400" />
    </div>

    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">Aksi Cepat</h2>
      <div className="flex gap-4">
        <Link href="/dashboard/aspirasi" className="px-6 py-3 bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-all">
          Semua Aspirasi
        </Link>
        <Link href="/dashboard/aspirasi" className="px-6 py-3 bg-yellow-600/20 border border-yellow-500/50 hover:bg-yellow-600/40 text-yellow-300 rounded-lg transition-all">
          Validasi ({stats.pending})
        </Link>
        <Link href="/dashboard/rekap" className="px-6 py-3 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-all">
          Laporan Rekapitulasi
        </Link>
      </div>
    </div>
  </div>
)

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

  if (user.role === 'admin') {
    // Admin focuses on New (pending) and Approved (to process)
    const [new_aspirasi, pending_yayasan, process, done] = await Promise.all([
      prisma.aspirasi.count({ where: { status_validasi: 'pending' } }),
      prisma.aspirasi.count({ where: { status_validasi: 'diajukan' } }),
      prisma.aspirasi.count({ where: { status_progres: 'dalam_progres' } }),
      prisma.aspirasi.count({ where: { status_progres: 'selesai' } }),
    ])
    stats = { ...stats, new_aspirasi, pending_yayasan, process, done }
  } else if (user.role === 'yayasan') {
    // Yayasan sees 'diajukan' as pending validation
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.aspirasi.count(),
      prisma.aspirasi.count({ where: { status_validasi: 'diajukan' } }),
      prisma.aspirasi.count({ where: { status_validasi: 'disetujui' } }),
      prisma.aspirasi.count({ where: { status_validasi: 'ditolak' } }),
    ])
    stats = { ...stats, total, pending, approved, rejected }
  } else {
    // Siswa sees own stats AND Public Feed
    const [total, pending, process, done] = await Promise.all([
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
    ])
    stats = { ...stats, total, pending, process, done }

    // Fetch Public Feed (Approved Aspirations)
    feed = await prisma.aspirasi.findMany({
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
    })
  }

  return (
    <div>
      {user.role === 'admin' && <AdminDashboard stats={stats} />}
      {user.role === 'siswa' && <SiswaDashboard stats={stats} user={user} feed={feed} />}
      {user.role === 'yayasan' && <YayasanDashboard stats={stats} />}
    </div>
  )
}
