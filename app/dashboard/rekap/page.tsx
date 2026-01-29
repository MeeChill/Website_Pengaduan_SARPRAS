import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import ExportButtons from "./export-buttons"

// Helper component for summary cards
const SummaryCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
       <div className={`w-16 h-16 rounded-full blur-xl ${color.replace('text-', 'bg-')}`}></div>
    </div>
    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider relative z-10">{title}</p>
    <p className={`text-3xl font-bold mt-2 relative z-10 ${color}`}>{value}</p>
  </div>
)

export default async function RekapPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'admin' && user.role !== 'yayasan') {
    redirect('/dashboard')
  }

  const { filter } = await searchParams
  const currentFilter = filter || 'month'

  let dateFilter = {}
  const now = new Date()
  let filterLabel = 'Bulan Ini'

  if (currentFilter === 'today') {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    dateFilter = { gte: startOfDay }
    filterLabel = 'Hari Ini'
  } else if (currentFilter === 'week') {
    const startOfWeek = new Date(now.setDate(now.getDate() - 7))
    dateFilter = { gte: startOfWeek }
    filterLabel = 'Minggu Ini'
  } else if (currentFilter === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    dateFilter = { gte: startOfMonth }
    filterLabel = 'Bulan Ini'
  } else if (currentFilter === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    dateFilter = { gte: startOfYear }
    filterLabel = 'Tahun Ini'
  }

  const data = await prisma.aspirasi.findMany({
    where: {
      input_aspirasi: {
        tanggal_input: dateFilter
      }
    },
    include: {
      input_aspirasi: {
        include: {
          siswa: true,
          kategori: true
        }
      }
    },
    orderBy: {
      input_aspirasi: {
        tanggal_input: 'desc'
      }
    }
  })

  // Calculate Summary Stats based on filtered data
  const total = data.length
  const pending = data.filter((item: any) => item.status_validasi === 'pending' || item.status_validasi === 'diajukan').length
  const approved = data.filter((item: any) => item.status_validasi === 'disetujui').length
  const rejected = data.filter((item: any) => item.status_validasi === 'ditolak').length
  const completed = data.filter((item: any) => item.status_progres === 'selesai').length

  // Format data for export
  const exportData = data.map((item: any) => ({
    ID: item.id,
    Judul: item.input_aspirasi.judul,
    Kategori: item.input_aspirasi.kategori.nama_kategori,
    Pelapor: item.input_aspirasi.siswa.nama,
    Tanggal: item.input_aspirasi.tanggal_input.toLocaleDateString('id-ID'),
    Status_Validasi: item.status_validasi,
    Status_Progres: item.status_progres,
    Lokasi: item.input_aspirasi.lokasi
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Laporan Eksekutif</h1>
          <p className="text-slate-400 text-sm mt-1">Rekapitulasi kinerja dan statistik aspirasi ({filterLabel}).</p>
        </div>
        
        {user.role === 'yayasan' && (
          <ExportButtons data={exportData} period={filterLabel} />
        )}
      </div>

      {/* Filter Buttons */}
      <div className="glass-panel p-2 rounded-xl border border-white/5 flex space-x-1 overflow-x-auto w-fit">
        <Link 
          href="/dashboard/rekap?filter=today" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentFilter === 'today' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          Hari Ini
        </Link>
        <Link 
          href="/dashboard/rekap?filter=week" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentFilter === 'week' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          Minggu Ini
        </Link>
        <Link 
          href="/dashboard/rekap?filter=month" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentFilter === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          Bulan Ini
        </Link>
        <Link 
          href="/dashboard/rekap?filter=year" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentFilter === 'year' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          Tahun Ini
        </Link>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard title="Total Masuk" value={total} color="text-white" />
        <SummaryCard title="Menunggu" value={pending} color="text-amber-400" />
        <SummaryCard title="Disetujui" value={approved} color="text-indigo-400" />
        <SummaryCard title="Ditolak" value={rejected} color="text-red-400" />
        <SummaryCard title="Selesai" value={completed} color="text-emerald-400" />
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-300 uppercase text-xs tracking-wider font-medium border-b border-white/5">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Pelapor</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Validasi</th>
                <th className="px-6 py-4">Progres</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-white/5">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                    {new Date(item.input_aspirasi.tanggal_input).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {item.input_aspirasi.judul}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {item.input_aspirasi.siswa.nama}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs">
                      {item.input_aspirasi.kategori.nama_kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status_validasi === 'disetujui' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      item.status_validasi === 'ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status_validasi.charAt(0).toUpperCase() + item.status_validasi.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status_progres === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.status_progres === 'dalam_progres' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      'text-slate-500 border-transparent'
                    }`}>
                      {item.status_progres.replace('_', ' ').charAt(0).toUpperCase() + item.status_progres.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    Tidak ada data laporan untuk periode {filterLabel.toLowerCase()}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
