'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from './logout-button'

export default function MobileNav({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fade-in">
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span className="text-lg font-bold text-white">Neo-Sarana</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <nav className="flex-1 p-6 overflow-y-auto">
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Dashboard
                </Link>
              </li>
              
              {user.role === 'siswa' && (
                <>
                  <li>
                    <Link href="/dashboard/aspirasi/create" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      Buat Aspirasi
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/aspirasi" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      Riwayat & Feed
                    </Link>
                  </li>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <li>
                    <Link href="/dashboard/aspirasi" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                      Kelola Aspirasi
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/users" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      Kelola Siswa
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/rekap" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Rekap Laporan
                    </Link>
                  </li>
                </>
              )}

              {user.role === 'yayasan' && (
                <>
                  <li>
                    <Link href="/dashboard/aspirasi" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Validasi
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/admins" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      Kelola Admin
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/rekap" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-lg text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Laporan Eksekutif
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="p-6 border-t border-white/5">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {(user.name || user.nama || 'U').charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold">{user.name || user.nama}</p>
                  <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest">{user.role}</p>
                </div>
             </div>
             <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}
