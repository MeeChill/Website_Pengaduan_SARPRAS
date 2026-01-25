'use client'

import { updateValidation, updateProgress } from "@/app/actions"
import { useState } from "react"

export default function ActionsForm({ aspirasi, userId, userRole }: { aspirasi: any, userId: number, userRole: string }) {
  const [catatan, setCatatan] = useState('')
  const [deskripsiUpdate, setDeskripsiUpdate] = useState('')

  return (
    <div className="space-y-6">
      {/* Admin Forward to Yayasan Form */}
      {userRole === 'admin' && aspirasi.status_validasi === 'pending' && (
        <div className="border-b border-slate-700 pb-6">
          <h3 className="font-semibold mb-2 text-cyan-400">Tinjauan Admin</h3>
          <textarea
            placeholder="Catatan untuk Yayasan (opsional)..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-sm mb-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          ></textarea>
          <div className="flex space-x-2">
            <button
              onClick={() => updateValidation(aspirasi.id, 'diajukan', userId, catatan)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded w-full font-medium transition-colors"
            >
              Ajukan ke Yayasan
            </button>
            <button
              onClick={() => updateValidation(aspirasi.id, 'ditolak', userId, catatan)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded w-full font-medium transition-colors"
            >
              Tolak
            </button>
          </div>
        </div>
      )}

      {/* Validation Form - ONLY for Yayasan */}
      {userRole === 'yayasan' && aspirasi.status_validasi === 'diajukan' && (
        <div className="border-b border-slate-700 pb-6">
          <h3 className="font-semibold mb-2 text-cyan-400">Validasi Yayasan</h3>
          <textarea
            placeholder="Catatan validasi..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-sm mb-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          ></textarea>
          <div className="flex space-x-2">
            <button
              onClick={() => updateValidation(aspirasi.id, 'disetujui', userId, catatan)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 px-3 rounded w-full font-medium transition-colors"
            >
              Setujui
            </button>
            <button
              onClick={() => updateValidation(aspirasi.id, 'ditolak', userId, catatan)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded w-full font-medium transition-colors"
            >
              Tolak
            </button>
          </div>
        </div>
      )}

      {/* Progress Update Form - ONLY for Admin and Approved Reports (even if completed, allow updates if needed, or show differently) */}
      {userRole === 'admin' && aspirasi.status_validasi === 'disetujui' && (
        <div className="border-b border-slate-700 pb-6">
          <h3 className="font-semibold mb-2 text-cyan-400">Update Progres Pengerjaan</h3>
          <textarea
            placeholder="Deskripsi update pengerjaan..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-sm mb-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
            value={deskripsiUpdate}
            onChange={(e) => setDeskripsiUpdate(e.target.value)}
          ></textarea>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateProgress(aspirasi.id, 'dalam_progres', userId, deskripsiUpdate || 'Sedang dikerjakan')}
              className={`text-white text-sm py-2 px-3 rounded w-full font-medium transition-colors ${
                aspirasi.status_progres === 'dalam_progres' 
                  ? 'bg-cyan-700 ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900' 
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              Dalam Proses
            </button>
            <button
              onClick={() => updateProgress(aspirasi.id, 'selesai', userId, deskripsiUpdate || 'Pengerjaan selesai')}
              className={`text-white text-sm py-2 px-3 rounded w-full font-medium transition-colors ${
                aspirasi.status_progres === 'selesai'
                  ? 'bg-emerald-700 ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {aspirasi.status_progres === 'selesai' && userRole !== 'admin' && (
         <div className="text-center text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-2 rounded">
            Laporan Selesai
         </div>
      )}
      
      {aspirasi.status_validasi === 'ditolak' && (
         <div className="text-center text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded">
            Laporan Ditolak
         </div>
      )}
      
      {/* Message for Admin waiting for Yayasan */}
      {userRole === 'admin' && aspirasi.status_validasi === 'diajukan' && (
        <div className="text-center text-blue-400 font-medium bg-blue-500/10 border border-blue-500/20 p-3 rounded text-sm">
           Sudah diajukan ke Yayasan. Menunggu persetujuan.
        </div>
      )}
    </div>
  )
}
