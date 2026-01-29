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
  if (user.role === 'admin') {
    whereClause.OR = [
      { status_validasi: 'pending' },
      { status_validasi: 'disetujui' },
      { status_validasi: 'diajukan' }
    ]
  } else if (user.role === 'siswa') {
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
              <tr className="bg-white/5 text-slate-300 uppercase text-xs tracking-wider font-medium border-b border-white/5">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Judul Aspirasi</th>
                <th className="py-4 px-6">Kategori</th>
                {user.role !== 'siswa' && <th className="py-4 px-6">Pelapor</th>}
                <th className="py-4 px-6">Validasi</th>
                <th className="py-4 px-6">Progres</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-white/5">
              {aspirasiList.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6 font-mono text-indigo-400">#{item.id}</td>
                  <td className="py-4 px-6 font-medium text-white">{item.input_aspirasi.judul}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {item.input_aspirasi.kategori.nama_kategori}
                    </span>
                  </td>
                  {user.role !== 'siswa' && (
                    <td className="py-4 px-6 text-slate-400">{item.input_aspirasi.siswa.nama}</td>
                  )}
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status_validasi === 'disetujui' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.status_validasi === 'ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      item.status_validasi === 'diajukan' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status_validasi === 'pending' ? 'Menunggu Admin' :
                       item.status_validasi === 'diajukan' ? 'Menunggu Yayasan' :
                       item.status_validasi.charAt(0).toUpperCase() + item.status_validasi.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status_progres === 'selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.status_progres === 'dalam_progres' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {item.status_progres.replace('_', ' ').charAt(0).toUpperCase() + item.status_progres.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Link href={`/dashboard/aspirasi/${item.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-xs uppercase tracking-wide hover:underline underline-offset-4">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {aspirasiList.length === 0 && (
                <tr>
                  <td colSpan={user.role !== 'siswa' ? 7 : 6} className="py-12 text-center text-slate-500 italic">
                    Belum ada data aspirasi yang ditemukan.
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
