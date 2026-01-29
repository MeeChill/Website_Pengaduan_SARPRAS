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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  return (
    <form action={createAspirasi} className="space-y-8">
      <input type="hidden" name="siswa_id" value={userId} />
      
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
           <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
           </div>
           <div>
             <h3 className="text-white font-bold">Informasi Utama</h3>
             <p className="text-xs text-slate-500">Berikan judul dan kategori aspirasi Anda.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Judul Aspirasi</label>
            <input 
              type="text" 
              name="judul" 
              required 
              className="modern-input"
              placeholder="Contoh: Perbaikan AC di Kelas XII RPL 1"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Kategori</label>
            <div className="relative">
              <select 
                name="kategori_id" 
                className="modern-input appearance-none cursor-pointer pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.nama_kategori}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Lokasi Kejadian</label>
            <div className="relative">
              <input 
                type="text" 
                name="lokasi" 
                required 
                className="modern-input pl-10"
                placeholder="Contoh: Gedung A Lt. 2"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
           <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
           </div>
           <div>
             <h3 className="text-white font-bold">Detail Pengaduan</h3>
             <p className="text-xs text-slate-500">Jelaskan secara rinci apa yang terjadi.</p>
           </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Deskripsi Lengkap</label>
          <textarea 
            name="deskripsi" 
            required 
            rows={5}
            className="modern-input resize-none"
            placeholder="Tuliskan detail masalah Anda di sini agar petugas dapat memprosesnya dengan cepat..."
          ></textarea>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Lampiran Foto Bukti</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700/50 border-dashed rounded-2xl cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 hover:border-indigo-500/50 transition-all group overflow-hidden relative">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3 border border-slate-700 text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="mb-1 text-sm text-slate-300 group-hover:text-white transition-colors"><span className="font-semibold">Klik untuk pilih foto</span></p>
                <p className="text-xs text-slate-500 italic">Format: JPG, PNG, atau GIF (Maks. 2MB)</p>
              </div>
              <input name="foto" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              
              {preview && (
                <div className="absolute inset-0 z-0 opacity-20">
                  <img src={preview} alt="" className="w-full h-full object-cover blur-sm" />
                </div>
              )}
            </label>
          </div>
          
          {preview && (
            <div className="mt-6 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pratinjau Foto</p>
                <button type="button" onClick={() => setPreview(null)} className="text-xs text-red-400 hover:text-red-300 font-medium">Hapus Foto</button>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl shadow-indigo-500/5">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <SubmitButton />
        <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-[0.2em] font-medium">
          Pastikan data yang Anda kirimkan sudah benar dan dapat dipertanggungjawabkan
        </p>
      </div>
    </form>
  )
}
