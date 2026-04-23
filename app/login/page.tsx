'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { ShieldCheck, Sparkles, Building2, MessageSquareText } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Kredensial tidak valid. Silakan periksa NIPD dan kata sandi Anda.')
        setLoading(false)
      } else if (result?.ok) {
        // Get the updated session to access the role
        const newSession = await (await fetch('/api/auth/session')).json()
        
        // Redirect based on role
        if (newSession?.user?.role === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/chat'
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 bg-slate-950/80 backdrop-blur-xl border-r border-white/5">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-12 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>

          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
              Selamat Datang
            </h1>
            <p className="text-slate-400 text-lg">
              Silakan masuk menggunakan NIPD Anda untuk mengakses layanan.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/10 relative overflow-hidden">
            {/* Decorative background glow inside card */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center animate-slide-up">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2 ml-1" htmlFor="username">NIPD / Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    id="username"
                    type="text"
                    placeholder="Masukkan NIPD Anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-slate-300 text-sm font-medium" htmlFor="password">Kata Sandi</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button
                className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : 'Masuk ke Sistem'}
              </button>
            </form>
          </div>
          
          <p className="mt-10 text-center text-sm text-slate-500" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Neo-Sarana. Dilindungi Hak Cipta.
          </p>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-slate-900 overflow-hidden">
        {/* Decorative Backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-glow delay-1000"></div>
        
        {/* Floating Elements */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl transform transition-transform hover:scale-105 duration-500">
            <Sparkles className="w-12 h-12 text-indigo-400 mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
              Sistem Pelaporan<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Sarana & Prasarana
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Platform modern untuk memudahkan pelaporan dan pemantauan perbaikan fasilitas sekolah secara real-time.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 animate-float">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Lapor Kerusakan</h4>
                  <p className="text-sm text-slate-400">Laporkan masalah fasilitas dengan mudah</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 animate-float delay-200">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <MessageSquareText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Pantau Status</h4>
                  <p className="text-sm text-slate-400">Cek perkembangan laporan secara langsung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
