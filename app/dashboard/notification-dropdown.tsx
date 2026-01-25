'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
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

  const unreadCount = notifications.filter(n => !n.dibaca).length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Notifikasi</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">Tidak ada notifikasi baru.</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleRead(notif.id, notif.aspirasi_id ? `/dashboard/aspirasi/${notif.aspirasi_id}` : undefined)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.dibaca ? 'bg-blue-50/50' : ''}`}
                >
                  <p className="text-sm text-slate-800 mb-1">{notif.pesan}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(notif.tanggal_notif).toLocaleDateString()} {new Date(notif.tanggal_notif).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
