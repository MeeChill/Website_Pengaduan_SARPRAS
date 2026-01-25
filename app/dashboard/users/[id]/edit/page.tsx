import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect, notFound } from "next/navigation"
import EditUserForm from "./form"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const { id } = await params
  const student = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  })

  if (!student || student.role !== 'siswa') {
    notFound()
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">
        Edit Data Siswa
      </h1>
      <div className="glass-card p-8 rounded-xl border border-slate-700/50 max-w-3xl">
        <EditUserForm user={student} />
      </div>
    </div>
  )
}
