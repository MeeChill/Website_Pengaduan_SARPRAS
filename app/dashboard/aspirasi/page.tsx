import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function AspirasiListPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  let aspirasiList: any[] = []
  
  if (user.role === 'admin') {
    // Admin sees 'pending' (to forward) AND 'disetujui' (to work on)
    // Admin does NOT need to see 'diajukan' (waiting for Yayasan) or 'ditolak' (closed)
    aspirasiList = await prisma.aspirasi.findMany({
      where: {
        OR: [
          { status_validasi: 'pending' },
          { status_validasi: 'disetujui' }
        ]
      },
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
  } else if (user.role === 'yayasan') {
    // Yayasan sees 'diajukan' (to validate) and others for history
    aspirasiList = await prisma.aspirasi.findMany({
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
  } else {
    // Siswa sees ONLY their own
    aspirasiList = await prisma.aspirasi.findMany({
      where: {
        input_aspirasi: {
          siswa_id: parseInt(user.id)
        }
      },
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
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Daftar Aspirasi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user.role === 'siswa' ? 'Pantau status aspirasi yang Anda kirimkan.' : 
             user.role === 'admin' ? 'Kelola aspirasi masuk dan progres pengerjaan.' :
             'Validasi aspirasi masuk dan monitor kinerja.'}
          </p>
        </div>
        {user.role === 'siswa' && (
          <Link href="/dashboard/aspirasi/create" className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
            + Buat Baru
          </Link>
        )}
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-4 px-6 font-semibold">ID</th>
                <th className="py-4 px-6 font-semibold">Judul Aspirasi</th>
                <th className="py-4 px-6 font-semibold">Kategori</th>
                {user.role !== 'siswa' && <th className="py-4 px-6 font-semibold">Pelapor</th>}
                <th className="py-4 px-6 font-semibold">Validasi</th>
                <th className="py-4 px-6 font-semibold">Progres</th>
                <th className="py-4 px-6 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-slate-700/50">
              {aspirasiList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-cyan-400">#{item.id}</td>
                  <td className="py-4 px-6 font-medium">{item.input_aspirasi.judul}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-300 border border-slate-600">
                      {item.input_aspirasi.kategori.nama_kategori}
                    </span>
                  </td>
                  {user.role !== 'siswa' && (
                    <td className="py-4 px-6 text-slate-400">{item.input_aspirasi.siswa.nama}</td>
                  )}
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      item.status_validasi === 'disetujui' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      item.status_validasi === 'ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      item.status_validasi === 'diajukan' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {item.status_validasi === 'pending' ? 'Menunggu Admin' :
                       item.status_validasi === 'diajukan' ? 'Menunggu Yayasan' :
                       item.status_validasi}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      item.status_progres === 'selesai' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      item.status_progres === 'dalam_progres' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      'bg-slate-700/50 text-slate-400 border-slate-600'
                    }`}>
                      {item.status_progres.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Link href={`/dashboard/aspirasi/${item.id}`} className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline underline-offset-4">
                      Detail
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
