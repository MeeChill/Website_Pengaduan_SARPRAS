import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import SearchFilter from "./search-filter"

export default async function AspirasiListPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string, category?: string, status?: string }> 
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  const { search, category, status } = await searchParams

  const categories = await prisma.kategori.findMany()

  // Build Filter Query
  const whereClause: any = {}
  
  if (search) {
    whereClause.input_aspirasi = {
      judul: { contains: search, mode: 'insensitive' }
    }
  }

  if (category && category !== 'all') {
    whereClause.input_aspirasi = {
      ...whereClause.input_aspirasi,
      kategori_id: parseInt(category)
    }
  }

  if (status && status !== 'all') {
    if (['pending', 'disetujui', 'ditolak', 'diajukan'].includes(status)) {
      whereClause.status_validasi = status
    } else if (['dalam_progres', 'selesai'].includes(status)) {
      whereClause.status_progres = status
    }
  }

  // Role-based Base Filter
  if (user.role === 'siswa') {
    whereClause.input_aspirasi = {
      ...whereClause.input_aspirasi,
      siswa_id: parseInt(user.id)
    }
  }

  const aspirasiList = await prisma.aspirasi.findMany({
    where: whereClause,
    include: {
      input_aspirasi: {
        include: {
          kategori: true,
          siswa: true
        }
      }
    },
    orderBy: { id: 'desc' }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Daftar Aspirasi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user.role === 'siswa' ? 'Pantau status aspirasi yang Anda kirimkan.' : 
             user.role === 'admin' ? 'Kelola aspirasi masuk dan progres pengerjaan.' :
             'Validasi aspirasi masuk dan monitor kinerja.'}
          </p>
        </div>
        {user.role === 'siswa' && (
          <Link href="/dashboard/aspirasi/create" className="btn-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Buat Baru
          </Link>
        )}
      </div>

      <SearchFilter categories={categories} />

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-300 uppercase text-[10px] tracking-widest font-bold border-b border-white/5">
                <th className="py-4 px-6 w-20">ID</th>
                <th className="py-4 px-6">Judul Aspirasi</th>
                <th className="py-4 px-6">Kategori</th>
                {user.role !== 'siswa' && <th className="py-4 px-6">Pelapor</th>}
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-white/5">
              {aspirasiList.map((item) => (
                <tr key={item.id} className="hover:bg-white/10 transition-all duration-200 group border-transparent hover:border-indigo-500/20">
                  <td className="py-5 px-6 font-mono text-indigo-400 font-bold">#{item.id}</td>
                  <td className="py-5 px-6">
                    <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.input_aspirasi.judul}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
                      {item.input_aspirasi.kategori.nama_kategori}
                    </span>
                  </td>
                  {user.role !== 'siswa' && (
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                          {item.input_aspirasi.siswa.nama.charAt(0)}
                        </div>
                        <span className="text-slate-300 font-medium">{item.input_aspirasi.siswa.nama}</span>
                      </div>
                    </td>
                  )}
                  <td className="py-5 px-6 text-slate-500 font-medium">
                    {new Date(item.input_aspirasi.tanggal_input).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap inline-flex items-center justify-center shadow-sm ${
                        item.status_validasi === 'disetujui' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status_validasi === 'ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        item.status_validasi === 'diajukan' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {item.status_validasi === 'pending' ? 'Menunggu Admin' :
                         item.status_validasi === 'diajukan' ? 'Menunggu Yayasan' :
                         item.status_validasi.charAt(0).toUpperCase() + item.status_validasi.slice(1)}
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
                  <td className="py-5 px-6 text-center">
                    <Link 
                      href={`/dashboard/aspirasi/${item.id}`} 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-300 group/btn"
                      title="Lihat Detail"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transform group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
              {aspirasiList.length === 0 && (
                <tr>
                  <td colSpan={user.role !== 'siswa' ? 7 : 6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 font-medium italic">Belum ada data aspirasi yang ditemukan.</p>
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
