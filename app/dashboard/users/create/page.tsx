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
      <h1 className="text-3xl font-bold text-white mb-6">
        Tambah Siswa Baru
      </h1>
      <div className="glass-card p-8 rounded-xl border border-slate-700/50 max-w-3xl">
        <CreateUserForm />
      </div>
    </div>
  )
}
