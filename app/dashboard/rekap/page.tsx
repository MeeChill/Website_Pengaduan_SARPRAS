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
  let startDate = new Date()
  let filterLabel = 'Bulan Ini'

  if (currentFilter === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    dateFilter = { gte: startDate }
    filterLabel = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } else if (currentFilter === 'week') {
    startDate = new Date(now.setDate(now.getDate() - 7))
    dateFilter = { gte: startDate }
    filterLabel = `${startDate.toLocaleDateString('id-ID')} - ${new Date().toLocaleDateString('id-ID')}`
  } else if (currentFilter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    dateFilter = { gte: startDate }
    filterLabel = startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  } else if (currentFilter === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1)
    dateFilter = { gte: startDate }
    filterLabel = startDate.getFullYear().toString()
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
        <SummaryCard title="Disetujui" value={approved} color="text-emerald-400" />
        <SummaryCard title="Ditolak" value={rejected} color="text-red-400" />
        <SummaryCard title="Selesai" value={completed} color="text-emerald-400" />
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-300 uppercase text-[10px] tracking-widest font-bold border-b border-white/5">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Pelapor</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-white/5">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/10 transition-all duration-200 group">
                  <td className="px-6 py-5 whitespace-nowrap text-slate-500 font-mono font-medium">
                    {new Date(item.input_aspirasi.tanggal_input).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.input_aspirasi.judul}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                        {item.input_aspirasi.siswa.nama.charAt(0)}
                      </div>
                      <span className="text-slate-300 font-medium">{item.input_aspirasi.siswa.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {item.input_aspirasi.kategori.nama_kategori}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap inline-flex items-center justify-center shadow-sm ${
                        item.status_validasi === 'disetujui' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status_validasi === 'ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {item.status_validasi.charAt(0).toUpperCase() + item.status_validasi.slice(1)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap inline-flex items-center justify-center shadow-sm ${
                        item.status_progres === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status_progres === 'dalam_progres' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {item.status_progres.replace('_', ' ').charAt(0).toUpperCase() + item.status_progres.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 font-medium italic">Tidak ada data laporan untuk periode {filterLabel.toLowerCase()}.</p>
                    </div>
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
