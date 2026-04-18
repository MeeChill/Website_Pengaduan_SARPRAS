'use client'

import { updateValidation, updateProgress } from "@/app/actions"
import { useState } from "react"
import ConfirmModal from "./confirm-modal"

export default function ActionsForm({ aspirasi, userId, userRole }: { aspirasi: any, userId: number, userRole: string }) {
  const [catatan, setCatatan] = useState('')
  const [tenggatWaktu, setTenggatWaktu] = useState('')
  const [deskripsiUpdate, setDeskripsiUpdate] = useState('')
  const [deskripsiSingkat, setDeskripsiSingkat] = useState('')
  const [fotoAfter, setFotoAfter] = useState<File | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<{status: string} | null>(null)

  const handleUpdateClick = (status: string) => {
    if (status === 'selesai' && !fotoAfter) {
      alert('Wajib upload foto bukti pengerjaan selesai!')
      return
    }
    setPendingAction({ status })
    setShowConfirm(true)
  }

  const confirmUpdate = async () => {
    if (pendingAction && !loading) {
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('aspirasiId', aspirasi.id.toString())
        formData.append('status', pendingAction.status)
        formData.append('userId', userId.toString())
        formData.append('deskripsiUpdate', deskripsiUpdate || (pendingAction.status === 'dalam_progres' ? 'Update pengerjaan' : 'Pengerjaan selesai'))
        formData.append('deskripsiSingkat', deskripsiSingkat)
        if (fotoAfter) {
          formData.append('fotoAfter', fotoAfter)
        }

        await updateProgress(formData)
        setShowConfirm(false)
        setPendingAction(null)
        setDeskripsiUpdate('')
        setDeskripsiSingkat('')
        setFotoAfter(null)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        onConfirm={confirmUpdate}
        status={pendingAction?.status || ''}
        isFinal={pendingAction?.status === 'selesai'}
        loading={loading}
      />

      {/* Admin Forward to Yayasan Form */}
      {userRole === 'admin' && aspirasi.status_validasi === 'pending' && (
        <div className="border-b border-white/5 pb-6">
          <h3 className="font-semibold mb-3 text-indigo-400 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Tinjauan Admin
          </h3>
          <textarea
            placeholder="Catatan untuk Yayasan (opsional)..."
            className="modern-input mb-4 h-24 text-sm resize-none"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          ></textarea>
          <div className="flex gap-3">
            <button
              onClick={() => updateValidation(aspirasi.id, 'diajukan', userId, catatan)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Ajukan ke Yayasan
            </button>
            <button
              onClick={() => updateValidation(aspirasi.id, 'ditolak', userId, catatan)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm py-2.5 px-4 rounded-xl font-medium transition-all active:scale-95"
            >
              Tolak
            </button>
          </div>
        </div>
      )}

      {/* Validation Form - ONLY for Yayasan */}
      {userRole === 'yayasan' && aspirasi.status_validasi === 'diajukan' && (
        <div className="border-b border-white/5 pb-6">
          <h3 className="font-semibold mb-3 text-indigo-400 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Validasi Yayasan
          </h3>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenggat Waktu Pengerjaan</label>
            <input 
              type="date" 
              className="modern-input text-sm"
              value={tenggatWaktu}
              onChange={(e) => setTenggatWaktu(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <textarea
            placeholder="Catatan validasi..."
            className="modern-input mb-4 h-24 text-sm resize-none"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          ></textarea>
          <div className="flex gap-3">
            <button
              onClick={() => updateValidation(aspirasi.id, 'disetujui', userId, catatan, tenggatWaktu)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Setujui Laporan
            </button>
            <button
              onClick={() => updateValidation(aspirasi.id, 'ditolak', userId, catatan)}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              Tolak
            </button>
          </div>
        </div>
      )}

      {/* Progress Update Form - ONLY for Admin and Approved Reports */}
      {userRole === 'admin' && aspirasi.status_validasi === 'disetujui' && (
        <div className="border-b border-white/5 pb-6">
          <h3 className="font-semibold mb-3 text-indigo-400 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Update Progres
          </h3>
          
          {aspirasi.status_progres === 'selesai' ? (
             <div className="text-center py-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
               <div className="relative z-10">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <p className="text-emerald-400 font-bold text-lg">Laporan Selesai</p>
                 <p className="text-xs text-slate-500 mt-1">Status dikunci dan tidak dapat diubah lagi.</p>
               </div>
             </div>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detail untuk Yayasan</label>
                  <textarea
                    placeholder="Deskripsikan perkembangan pengerjaan secara detail..."
                    className="modern-input h-24 text-sm resize-none"
                    value={deskripsiUpdate}
                    onChange={(e) => setDeskripsiUpdate(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ringkasan untuk Siswa (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Jika diisi, ini yang akan muncul di dashboard siswa..."
                    className="modern-input text-sm"
                    value={deskripsiSingkat}
                    onChange={(e) => setDeskripsiSingkat(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 mt-1 italic">*Kosongkan jika update ini hanya untuk konsumsi internal (Yayasan).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Foto Bukti Selesai (Wajib jika selesai)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="modern-input text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                    onChange={(e) => setFotoAfter(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateClick('dalam_progres')}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {aspirasi.status_progres === 'dalam_progres' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-9 14a2 2 0 012-2h14a2 2 0 012 2v1H3v-1z" /></svg>
                      Kirim Update
                    </>
                  ) : 'Mulai Proses'}
                </button>
                <button
                  onClick={() => handleUpdateClick('selesai')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Tandai Selesai
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      {aspirasi.status_validasi === 'ditolak' && (
         <div className="text-center text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <p>Laporan Ditolak</p>
         </div>
      )}
      
      {/* Message for Admin waiting for Yayasan */}
      {userRole === 'admin' && aspirasi.status_validasi === 'diajukan' && (
        <div className="text-center text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-sm flex flex-col items-center justify-center gap-2">
           <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
             <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </div>
           <p>Menunggu persetujuan Yayasan</p>
        </div>
      )}
    </div>
  )
}
