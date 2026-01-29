import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CreateUserForm from "./form"

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Tambah Siswa Baru
        </h1>
        <p className="text-slate-400 mt-1">Buat akun siswa baru untuk mengakses sistem.</p>
      </div>
      <div className="glass-panel p-8 rounded-xl border border-white/5 max-w-3xl">
        <CreateUserForm />
      </div>
    </div>
  )
}
