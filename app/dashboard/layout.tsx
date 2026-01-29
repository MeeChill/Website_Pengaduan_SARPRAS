import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import LogoutButton from "./logout-button"
import NotificationDropdown from "./notification-dropdown"
import MobileNav from "./mobile-nav"
import prisma from "@/lib/prisma"

// --- Navbar Layout (For Siswa) ---
const NavbarLayout = ({ user, children, notifications }: { user: any, children: React.ReactNode, notifications: any[] }) => (
  <div className="min-h-screen bg-mesh text-slate-100">
    <nav className="glass-panel border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              <MobileNav user={user} />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight hidden xs:block">
                  Neo-Sarana
                </span>
              </div>
            </div>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-8">
              <Link href="/dashboard" className="border-transparent text-slate-400 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors hover:border-indigo-500">
                Dashboard
              </Link>
              <Link href="/dashboard/aspirasi/create" className="border-transparent text-slate-400 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors hover:border-indigo-500">
                Buat Aspirasi
              </Link>
              <Link href="/dashboard/aspirasi" className="border-transparent text-slate-400 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors hover:border-indigo-500">
                Riwayat & Feed
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            <NotificationDropdown notifications={notifications} />

            <div className="flex items-center gap-3 sm:pl-6 sm:border-l sm:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name || user.nama || 'User'}</p>
                <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">{user.role}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                {(user.name || user.nama || 'U').charAt(0)}
              </div>
              
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  </div>
)

// --- Sidebar Layout (For Admin & Yayasan) ---
const SidebarLayout = ({ user, children, notifications }: { user: any, children: React.ReactNode, notifications: any[] }) => (
  <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
    {/* Sidebar - Desktop Only */}
    <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-white/5 flex-col relative z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>
           <span className="text-lg font-bold text-white tracking-tight">
             Neo-Sarana
           </span>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {(user.name || user.nama || 'U').charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name || user.nama || 'User'}</p>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
          </li>
          
          {user.role === 'admin' && (
            <>
              <li>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Management</div>
              </li>
              <li>
                <Link href="/dashboard/aspirasi" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  <span className="font-medium text-sm">Kelola Aspirasi</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/users" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="font-medium text-sm">Kelola Siswa</span>
                </Link>
              </li>
              <li>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Reports</div>
              </li>
              <li>
                <Link href="/dashboard/rekap" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="font-medium text-sm">Rekap Laporan</span>
                </Link>
              </li>
            </>
          )}

          {user.role === 'yayasan' && (
            <>
              <li>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Approval</div>
              </li>
              <li>
                 <Link href="/dashboard/aspirasi" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium text-sm">Validasi</span>
                 </Link>
              </li>
              <li>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">User Management</div>
              </li>
              <li>
                <Link href="/dashboard/admins" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="font-medium text-sm">Kelola Admin</span>
                </Link>
              </li>
              <li>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Reports</div>
              </li>
              <li>
                 <Link href="/dashboard/rekap" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <span className="font-medium text-sm">Laporan Eksekutif</span>
                 </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/5">
        <LogoutButton />
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto relative bg-mesh">
      {/* Top Header for Sidebar Layout */}
      <header className="glass-panel border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-30 px-4 lg:px-8">
         <div className="flex items-center gap-3">
            <MobileNav user={user} />
            <h2 className="text-lg font-medium text-white hidden xs:block">Dashboard</h2>
         </div>
         <NotificationDropdown notifications={notifications} />
      </header>

      <div className="relative z-10 p-4 lg:p-8">
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
