'use client'

import { useState } from 'react'
import { markNotificationRead } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function NotificationDropdown({ notifications }: { notifications: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleRead = async (id: number, link?: string) => {
    await markNotificationRead(id)
    setIsOpen(false)
    if (link) {
      router.push(link)
    }
  }

  const unreadCount = notifications.filter(notif => !notif.dibaca).length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative border border-transparent hover:border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 bg-indigo-500 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-2xl border border-white/10 z-50 max-h-[450px] overflow-hidden flex flex-col animate-fade-in">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-sm font-bold text-white tracking-tight">Pemberitahuan</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} BARU
                </span>
              )}
            </div>
            
            <div className="overflow-y-auto divide-y divide-white/5 flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                   <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                   </div>
                   <p className="text-sm text-slate-500 italic">Tidak ada notifikasi baru.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleRead(notif.id, notif.aspirasi_id ? `/dashboard/aspirasi/${notif.aspirasi_id}` : undefined)}
                    className={`p-4 hover:bg-white/5 cursor-pointer transition-all relative group ${!notif.dibaca ? 'bg-indigo-500/[0.03]' : ''}`}
                  >
                    {!notif.dibaca && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500"></div>
                    )}
                    <p className={`text-sm mb-1.5 transition-colors ${!notif.dibaca ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                      {notif.pesan}
                    </p>
                    <div className="flex items-center gap-2">
                       <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {new Date(notif.tanggal_notif).toLocaleDateString('id-ID')} • {new Date(notif.tanggal_notif).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t border-white/5 bg-white/5 text-center">
               <button className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                 LIHAT SEMUA NOTIFIKASI
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
