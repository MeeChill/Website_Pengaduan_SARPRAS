import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { deleteUser } from "@/app/actions"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    where: { role: 'siswa' },
    orderBy: { id: 'desc' }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Siswa</h1>
          <p className="text-slate-400 text-sm">Manajemen data akun siswa.</p>
        </div>
        <Link href="/dashboard/users/create" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Tambah Siswa
        </Link>
      </div>

      <div className="glass-card rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700/50">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                <th className="px-6 py-4 font-semibold">NISN</th>
                <th className="px-6 py-4 font-semibold">Kelas</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm divide-y divide-slate-700/50">
              {users.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">#{item.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{item.nama}</td>
                  <td className="px-6 py-4 text-slate-400">{item.nisn || '-'}</td>
                  <td className="px-6 py-4 text-slate-400">{item.kelas || '-'}</td>
                  <td className="px-6 py-4 text-slate-400">{item.username}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/dashboard/users/${item.id}/edit`} className="px-3 py-1.5 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 rounded transition-colors text-xs font-medium">
                        Edit
                      </Link>
                      <form action={deleteUser.bind(null, item.id)}>
                        <button type="submit" className="px-3 py-1.5 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded transition-colors text-xs font-medium">
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    Belum ada data siswa.
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
