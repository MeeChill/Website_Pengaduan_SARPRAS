import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import ExportButtons from "./export-buttons"

// Helper component for summary cards
const SummaryCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div className="glass-card p-6 rounded-xl border border-slate-700/50">
    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Eksekutif</h1>
          <p className="text-slate-400 text-sm">Rekapitulasi kinerja dan statistik aspirasi ({filterLabel}).</p>
        </div>
        
        {user.role === 'yayasan' && (
          <ExportButtons data={exportData} period={filterLabel} />
        )}
      </div>

      {/* Filter Buttons */}
      <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex space-x-2 overflow-x-auto">
        <Link 
          href="/dashboard/rekap?filter=today" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${currentFilter === 'today' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Hari Ini
        </Link>
        <Link 
          href="/dashboard/rekap?filter=week" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${currentFilter === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Minggu Ini
        </Link>
        <Link 
          href="/dashboard/rekap?filter=month" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${currentFilter === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Bulan Ini
        </Link>
        <Link 
          href="/dashboard/rekap?filter=year" 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${currentFilter === 'year' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          Tahun Ini
        </Link>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard title="Total Masuk" value={total} color="text-white" />
        <SummaryCard title="Menunggu" value={pending} color="text-yellow-400" />
        <SummaryCard title="Disetujui" value={approved} color="text-blue-400" />
        <SummaryCard title="Ditolak" value={rejected} color="text-red-400" />
        <SummaryCard title="Selesai" value={completed} color="text-green-400" />
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700/50">
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Judul</th>
                <th className="px-6 py-4 font-semibold">Pelapor</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Validasi</th>
                <th className="px-6 py-4 font-semibold">Progres</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-slate-700/50">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {new Date(item.input_aspirasi.tanggal_input).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {item.input_aspirasi.judul}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {item.input_aspirasi.siswa.nama}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs">
                      {item.input_aspirasi.kategori.nama_kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status_validasi === 'disetujui' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      item.status_validasi === 'ditolak' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {item.status_validasi}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status_progres === 'selesai' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      item.status_progres === 'dalam_progres' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      'text-slate-500'
                    }`}>
                      {item.status_progres.replace('_', ' ')}
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
