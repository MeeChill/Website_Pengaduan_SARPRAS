import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { deleteAdmin } from "@/app/actions"

export default async function AdminsPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'yayasan') {
    redirect('/dashboard')
  }

  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    orderBy: { id: 'desc' }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kelola Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Manajemen data akun administrator.</p>
        </div>
        <Link href="/dashboard/admins/create" className="btn-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tambah Admin
        </Link>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-300 uppercase text-xs tracking-wider font-medium border-b border-white/5">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-white/5">
              {admins.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-indigo-400">#{item.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{item.nama}</td>
                  <td className="px-6 py-4 text-slate-400">{item.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-3">
                      <Link href={`/dashboard/admins/${item.id}/edit`} className="text-amber-400 hover:text-amber-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <form action={deleteAdmin.bind(null, item.id)}>
                        <button type="submit" className="text-red-400 hover:text-red-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    Belum ada data admin.
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
