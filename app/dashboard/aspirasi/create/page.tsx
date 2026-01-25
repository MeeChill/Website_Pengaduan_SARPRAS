import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import CreateAspirasiForm from "./form"

export default async function CreateAspirasiPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'siswa') {
    redirect('/dashboard')
  }

  const categories = await prisma.kategori.findMany()

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
        Buat Aspirasi Baru
      </h1>
      <div className="glass-card p-8 rounded-xl border border-slate-700/50 max-w-3xl">
        <CreateAspirasiForm categories={categories} userId={parseInt(user.id)} />
      </div>
    </div>
  )
}
