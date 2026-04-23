import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== 'admin') {
    redirect('/login')
  }

  return <AdminLayout>{children}</AdminLayout>
}
