'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  status: string
  isFinal?: boolean
  loading?: boolean
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, status, isFinal, loading }: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-950/40" 
        onClick={() => !loading && onClose()}
      ></div>
      
      <div className="glass-panel p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10 relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 p-6 opacity-20">
           <div className="w-20 h-20 bg-indigo-500 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 text-indigo-400">
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {loading ? 'Sedang Memproses...' : 'Konfirmasi Update'}
          </h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Anda akan mengirimkan update progres dengan status <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">{status.replace('_', ' ')}</span>.
            {isFinal && (
              <span className="block mt-3 text-amber-300 text-xs bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 flex gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Tindakan ini permanen. Status tidak dapat diubah kembali setelah selesai.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Memproses...' : 'Ya, Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
