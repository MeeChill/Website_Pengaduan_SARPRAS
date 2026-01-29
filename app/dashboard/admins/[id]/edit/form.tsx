'use client'

import { updateAdmin } from "@/app/actions"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Menyimpan...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Simpan Perubahan
        </>
      )}
    </button>
  )
}

export default function EditAdminForm({ user }: { user: any }) {
  return (
    <form action={updateAdmin.bind(null, user.id)} className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
           <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
           </div>
           <div>
             <h3 className="text-white font-bold">Identitas Admin</h3>
             <p className="text-xs text-slate-500">Ubah data pribadi admin jika diperlukan.</p>
           </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Nama Lengkap</label>
          <input 
            type="text" 
            name="nama" 
            defaultValue={user.nama}
            required 
            className="modern-input"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
           <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
           </div>
           <div>
             <h3 className="text-white font-bold">Kredensial Akun</h3>
             <p className="text-xs text-slate-500">Kelola akses login admin.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              name="username" 
              defaultValue={user.username}
              required 
              className="modern-input"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Password Baru (Opsional)</label>
            <input 
              type="password" 
              name="password" 
              className="modern-input"
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <SubmitButton />
      </div>
    </form>
  )
}
