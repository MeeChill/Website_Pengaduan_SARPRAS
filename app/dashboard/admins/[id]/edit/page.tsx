import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import EditAdminForm from "./form"

export default async function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'yayasan') {
    redirect('/dashboard')
  }

  const { id } = await params
  const admin = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  })

  if (!admin || admin.role !== 'admin') {
    notFound()
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Edit Data Admin
        </h1>
        <p className="text-slate-400 mt-1">Perbarui informasi akun administrator.</p>
      </div>
      <div className="glass-panel p-8 rounded-xl border border-white/5 max-w-3xl">
        <EditAdminForm user={admin} />
      </div>
    </div>
  )
}
