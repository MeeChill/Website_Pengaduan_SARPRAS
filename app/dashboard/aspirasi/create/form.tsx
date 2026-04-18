'use client'

import { createAspirasi } from "@/app/actions"
import { useFormStatus } from "react-dom"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sedang Mengirim...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          Kirim Aspirasi Sekarang
        </>
      )}
    </button>
  )
}

export default function CreateAspirasiForm({ categories, userId }: { categories: any[], userId: number }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [showLocationIcon, setShowLocationIcon] = useState(true)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  return (
    <form action={createAspirasi} className="space-y-10">
      <input type="hidden" name="siswa_id" value={userId} />
      
      {/* Section 1: Informasi Utama */}
      <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-4 mb-2">
           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
           </div>
           <div>
             <h3 className="text-lg font-bold text-white">Informasi Utama</h3>
             <p className="text-sm text-slate-400">Berikan judul yang jelas untuk aspirasi Anda.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/2 p-6 rounded-2xl border border-white/5">
          <div className="md:col-span-2">
            <label className="block text-slate-300 text-sm font-semibold mb-2.5 ml-1">Judul Aspirasi</label>
            <input 
              type="text" 
              name="judul" 
              required 
              className="modern-input focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-slate-900/50"
              placeholder="Contoh: Perbaikan AC di Kelas XII RPL 1"
            />
          </div>

          <div className="group">
            <label className="block text-slate-300 text-sm font-semibold mb-2.5 ml-1">Kategori</label>
            <div className="relative">
              <select 
                name="kategori_id" 
                className="modern-input appearance-none cursor-pointer pr-10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-slate-900/50"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.nama_kategori}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover:text-indigo-400 transition-colors">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-slate-300 text-sm font-semibold mb-2.5 ml-1">Lokasi Kejadian</label>
            <div className="relative">
              <input 
                type="text" 
                name="lokasi" 
                required 
                className={`modern-input ${showLocationIcon ? 'pr-12' : ''} focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-slate-900/50 transition-all`}
                placeholder="Contoh: Gedung A Lt. 2"
              />
              {showLocationIcon && (
                <div 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Klik untuk menyembunyikan ikon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Detail Pengaduan */}
      <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-4 mb-2">
           <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
           </div>
           <div>
             <h3 className="text-lg font-bold text-white">Detail Pengaduan</h3>
             <p className="text-sm text-slate-400">Jelaskan secara rinci apa yang terjadi.</p>
           </div>
        </div>

        <div className="bg-white/2 p-6 rounded-2xl border border-white/5 space-y-8">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2.5 ml-1">Deskripsi Lengkap</label>
            <textarea 
              name="deskripsi" 
              required 
              rows={5}
              className="modern-input resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 bg-slate-900/50"
              placeholder="Tuliskan detail masalah Anda di sini agar petugas dapat memprosesnya dengan cepat..."
            ></textarea>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2.5 ml-1">Lampiran Foto Bukti</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-slate-700/50 border-dashed rounded-3xl cursor-pointer bg-slate-900/30 hover:bg-slate-800/40 hover:border-indigo-500/50 transition-all group overflow-hidden relative group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-700 text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="mb-2 text-base text-slate-200 group-hover:text-white transition-colors"><span className="font-bold">Klik untuk pilih foto</span> atau seret ke sini</p>
                  <p className="text-xs text-slate-500 font-medium">Format: JPG, PNG, atau GIF (Maks. 5MB)</p>
                </div>
                <input name="foto" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                
                {preview && (
                  <div className="absolute inset-0 z-0">
                    <img src={preview} alt="" className="w-full h-full object-cover blur-[2px] opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  </div>
                )}
              </label>
            </div>
            
            {preview && (
              <div className="mt-8 animate-fade-in">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.15em]">Pratinjau Lampiran</p>
                  </div>
                  <button type="button" onClick={() => setPreview(null)} className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 transition-colors group">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Hapus
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative aspect-video w-full rounded-[1.75rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl ring-1 ring-white/5">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <SubmitButton />
        <div className="flex items-center gap-2 mt-6 text-slate-500 opacity-60">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <p className="text-[10px] uppercase tracking-[0.25em] font-bold">
             Laporan akan diverifikasi oleh Admin sekolah
           </p>
        </div>
      </div>
    </form>
  )
}
