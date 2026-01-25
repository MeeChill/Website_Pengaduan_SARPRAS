'use client'

import { updateUser } from "@/app/actions"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-yellow-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
    </button>
  )
}

export default function EditUserForm({ user }: { user: any }) {
  return (
    <form action={updateUser.bind(null, user.id)} className="space-y-6">
      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Nama Lengkap</label>
        <input 
          type="text" 
          name="nama" 
          defaultValue={user.nama}
          required 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">NISN</label>
          <input 
            type="text" 
            name="nis" 
            defaultValue={user.nisn}
            required 
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-600"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Kelas</label>
          <input 
            type="text" 
            name="kelas" 
            defaultValue={user.kelas}
            required 
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
        <input 
          type="text" 
          name="username" 
          defaultValue={user.username}
          required 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-600"
        />
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Password Baru (Opsional)</label>
        <input 
          type="password" 
          name="password" 
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-600"
          placeholder="Kosongkan jika tidak ingin mengubah"
        />
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  )
}
