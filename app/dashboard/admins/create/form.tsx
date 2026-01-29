'use client'

import { createAdmin } from "@/app/actions"
import { useFormStatus } from "react-dom"

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
          Mendaftarkan...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Daftarkan Admin
        </>
      )}
    </button>
  )
}

export default function CreateAdminForm() {
  return (
    <form action={createAdmin} className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
           <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
           </div>
           <div>
             <h3 className="text-white font-bold">Identitas Admin</h3>
             <p className="text-xs text-slate-500">Lengkapi data diri administrator yang akan didaftarkan.</p>
           </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Nama Lengkap</label>
          <input 
            type="text" 
            name="nama" 
            required 
            className="modern-input"
            placeholder="Masukkan nama lengkap admin"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
           <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           </div>
           <div>
             <h3 className="text-white font-bold">Kredensial Akun</h3>
             <p className="text-xs text-slate-500">Gunakan data ini untuk akses masuk sistem.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              name="username" 
              required 
              className="modern-input"
              placeholder="Buat username unik"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="modern-input"
              placeholder="Minimal 6 karakter"
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
