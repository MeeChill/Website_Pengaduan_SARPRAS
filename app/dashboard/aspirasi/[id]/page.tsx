import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import ActionsForm from "./actions-form"

export default async function AspirasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  const { id: idString } = await params
  const id = parseInt(idString)

  const aspirasi = await prisma.aspirasi.findUnique({
    where: { id },
    include: {
      input_aspirasi: {
        include: {
          kategori: true,
          siswa: true
        }
      },
      progres_updates: {
        orderBy: { tanggal_update: 'desc' },
        include: {
          admin: true
        }
      }
    }
  })

  if (!aspirasi) {
    notFound()
  }

  // Security check: Siswa can only see their own
  if (user.role === 'siswa' && aspirasi.input_aspirasi.siswa_id !== parseInt(user.id)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-2">403</h1>
          <p className="text-slate-400">Anda tidak memiliki akses ke dokumen ini.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="md:col-span-2 space-y-6">
        {/* Detail Aspirasi */}
        <div className="glass-card p-8 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs bg-slate-700 text-cyan-400 border border-slate-600 mb-3 inline-block">
                {aspirasi.input_aspirasi.kategori.nama_kategori}
              </span>
              <h1 className="text-2xl font-bold text-white leading-tight">{aspirasi.input_aspirasi.judul}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">ID Laporan</p>
              <p className="text-xl font-mono text-slate-300">#{aspirasi.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pelapor</h3>
               <p className="text-slate-200">{aspirasi.input_aspirasi.siswa.nama}</p>
               <p className="text-xs text-slate-500">{aspirasi.input_aspirasi.siswa.kelas}</p>
            </div>
            <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lokasi Kejadian</h3>
               <p className="text-slate-200">{aspirasi.input_aspirasi.lokasi}</p>
            </div>
          </div>

          <div className="mb-6">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Detail</h3>
             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
               {aspirasi.input_aspirasi.deskripsi}
             </div>
          </div>

          {aspirasi.input_aspirasi.foto && (
            <div className="mb-6">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto Bukti</h3>
               <div className="rounded-lg overflow-hidden border border-slate-700">
                 <img 
                   src={aspirasi.input_aspirasi.foto} 
                   alt="Foto Bukti" 
                   className="w-full max-h-[500px] object-cover"
                 />
               </div>
            </div>
          )}
          
          <div className="text-xs text-slate-500 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Dilaporkan pada: {aspirasi.input_aspirasi.tanggal_input.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Status Section */}
        <div className="glass-card p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Status Laporan
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Validasi Admin</p>
              <p className={`font-bold capitalize ${
                aspirasi.status_validasi === 'disetujui' ? 'text-emerald-400' :
                aspirasi.status_validasi === 'ditolak' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {aspirasi.status_validasi}
              </p>
              {aspirasi.catatan_validasi && (
                 <p className="text-sm text-slate-400 mt-2 italic border-t border-slate-700 pt-2">"{aspirasi.catatan_validasi}"</p>
              )}
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Progres Pengerjaan</p>
              <p className={`font-bold capitalize ${
                aspirasi.status_progres === 'selesai' ? 'text-blue-400' :
                aspirasi.status_progres === 'dalam_progres' ? 'text-cyan-400' : 'text-slate-400'
              }`}>
                {aspirasi.status_progres.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* History Updates */}
        <div className="glass-card p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
             <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             Riwayat Progres
          </h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            {aspirasi.progres_updates.map((update: any) => (
              <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-cyan-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-200 text-sm">Update Petugas</div>
                    <time className="font-mono text-xs text-slate-500">{update.tanggal_update.toLocaleString()}</time>
                  </div>
                  <div className="text-slate-400 text-sm">{update.deskripsi_update}</div>
                  <div className="mt-2 text-xs text-cyan-600 font-medium">Oleh: {update.admin.nama}</div>
                </div>
              </div>
            ))}
            {aspirasi.progres_updates.length === 0 && (
              <div className="text-center py-4 text-slate-500 italic">Belum ada riwayat update pengerjaan.</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Sidebar (Admin & Yayasan) */}
      <div className="md:col-span-1">
        {(user.role === 'admin' || user.role === 'yayasan') && (
          <div className="glass-card p-6 rounded-xl border border-slate-700/50 sticky top-6">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Panel Kontrol</h2>
            <ActionsForm 
              aspirasi={aspirasi} 
              userId={parseInt(user.id)} 
              userRole={user.role}
            />
          </div>
        )}
      </div>
    </div>
  )
}
