'use client'

import { createUser } from "@/app/actions"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Menambahkan...' : 'Tambah Siswa'}
    </button>
  )
}

export default function CreateUserForm() {
  return (
    <form action={createUser} className="space-y-6">
      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Nama Lengkap</label>
        <input 
          type="text" 
          name="nama" 
          required 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
          placeholder="Nama Lengkap Siswa"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">NISN</label>
          <input 
            type="text" 
            name="nis" 
            required 
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
            placeholder="Nomor Induk Siswa Nasional"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Kelas</label>
          <input 
            type="text" 
            name="kelas" 
            required 
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
            placeholder="Contoh: XII RPL 1"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
        <input 
          type="text" 
          name="username" 
          required 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
          placeholder="Username untuk login"
        />
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Password</label>
        <input 
          type="password" 
          name="password" 
          required 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
          placeholder="Password akun"
        />
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  )
}
