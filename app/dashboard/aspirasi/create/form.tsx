'use client'

import { createAspirasi } from "@/app/actions"
import { useFormStatus } from "react-dom"
import { useState } from "react"
import Image from "next/link"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mengirim...
        </>
      ) : 'Kirim Aspirasi'}
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
    <form action={createAspirasi} className="space-y-6">
      <input type="hidden" name="siswa_id" value={userId} />
      
      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Judul Aspirasi</label>
        <input 
          type="text" 
          name="judul" 
          required 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600"
          placeholder="Contoh: AC Kelas Rusak"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Kategori</label>
          <div className="relative">
            <select 
              name="kategori_id" 
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Lokasi Kejadian</label>
          <input 
            type="text" 
            name="lokasi" 
            required 
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600"
            placeholder="Contoh: Gedung A Lt. 2"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Deskripsi Lengkap</label>
        <textarea 
          name="deskripsi" 
          required 
          rows={5}
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-slate-600"
          placeholder="Jelaskan detail masalahnya..."
        ></textarea>
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Upload Foto Bukti</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-slate-500 group-hover:text-purple-500 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
              <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF</p>
            </div>
            <input name="foto" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
        {preview && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Preview:</p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-700">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  )
}
