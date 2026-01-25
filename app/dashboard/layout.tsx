import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import LogoutButton from "./logout-button"
import NotificationDropdown from "./notification-dropdown"
import prisma from "@/lib/prisma"

// --- Navbar Layout (For Siswa) ---
const NavbarLayout = ({ user, children, notifications }: { user: any, children: React.ReactNode, notifications: any[] }) => (
  <div className="min-h-screen bg-slate-900 text-slate-100">
    <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-500 tracking-tight">
                NEO-SARANA
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-transparent text-slate-300 hover:border-blue-500 hover:text-blue-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/aspirasi/create" className="border-transparent text-slate-300 hover:border-blue-500 hover:text-blue-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Buat Aspirasi
              </Link>
              <Link href="/dashboard/aspirasi" className="border-transparent text-slate-300 hover:border-blue-500 hover:text-blue-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Riwayat & Feed
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationDropdown notifications={notifications} />

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-200">{user.name || user.nama || 'User'}</p>
                <p className="text-xs text-slate-500 uppercase">{user.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {(user.name || user.nama || 'U').charAt(0)}
              </div>
            </div>
            
            <div className="ml-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </main>
  </div>
)

// --- Sidebar Layout (For Admin & Yayasan) ---
const SidebarLayout = ({ user, children, notifications }: { user: any, children: React.ReactNode, notifications: any[] }) => (
  <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
    {/* Sidebar */}
    <aside className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col relative z-20">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-blue-500 tracking-tighter">
          NEO-SARANA
        </h2>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {(user.name || user.nama || 'U').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 truncate max-w-[120px]">{user.name || user.nama || 'User'}</p>
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="flex items-center p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all duration-200 group">
              <span className="font-medium">Dashboard</span>
            </Link>
          </li>
          
          {user.role === 'admin' && (
            <>
              <li>
                <Link href="/dashboard/aspirasi" className="flex items-center p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all duration-200 group">
                  <span className="font-medium">Kelola Aspirasi</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/rekap" className="flex items-center p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all duration-200 group">
                  <span className="font-medium">Rekap Laporan</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/users" className="flex items-center p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all duration-200 group">
                  <span className="font-medium">Kelola Siswa</span>
                </Link>
              </li>
            </>
          )}

          {user.role === 'yayasan' && (
            <>
              <li>
                 <Link href="/dashboard/aspirasi" className="flex items-center p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all duration-200 group">
                    <span className="font-medium">Validasi</span>
                 </Link>
              </li>
              <li>
                 <Link href="/dashboard/rekap" className="flex items-center p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-blue-400 transition-all duration-200 group">
                    <span className="font-medium">Laporan Eksekutif</span>
                 </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <LogoutButton />
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto relative bg-slate-900">
      {/* Top Header for Sidebar Layout */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 p-4 flex justify-end items-center sticky top-0 z-30">
         <NotificationDropdown notifications={notifications} />
      </header>

      <div className="relative z-10 p-8">
        {children}
      </div>
    </main>
  </div>
)

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = session.user as any

  const notifications = await prisma.notifikasi.findMany({
    where: {
      penerima_id: parseInt(user.id),
      dibaca: false
    },
    orderBy: {
      tanggal_notif: 'desc'
    },
    take: 10
  })

  if (user.role === 'siswa') {
    return <NavbarLayout user={user} notifications={notifications}>{children}</NavbarLayout>
  } else {
    return <SidebarLayout user={user} notifications={notifications}>{children}</SidebarLayout>
  }
}
