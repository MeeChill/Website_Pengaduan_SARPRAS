'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export default function SearchFilter({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [isFocused, setIsFocused] = useState(false)
  
  const [debouncedSearch] = useDebounce(search, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearch) params.set('search', debouncedSearch)
    else params.delete('search')
    
    if (category !== 'all') params.set('category', category)
    else params.delete('category')
    
    if (status !== 'all') params.set('status', status)
    else params.delete('status')
    
    router.push(`?${params.toString()}`)
  }, [debouncedSearch, category, status])

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1 relative group">
        <input
          type="text"
          placeholder="Cari judul aspirasi..."
          className="modern-input pl-12 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-slate-900/50 transition-all placeholder:text-slate-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="w-full md:w-56 relative group">
        <select 
          className="modern-input appearance-none pr-10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-slate-900/50 transition-all cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.nama_kategori}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div className="w-full md:w-56 relative group">
        <select 
          className="modern-input appearance-none pr-10 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-slate-900/50 transition-all cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="pending" className="bg-slate-900">Pending</option>
          <option value="diajukan" className="bg-slate-900">Menunggu Yayasan</option>
          <option value="disetujui" className="bg-slate-900">Disetujui</option>
          <option value="dalam_progres" className="bg-slate-900">Dalam Proses</option>
          <option value="selesai" className="bg-slate-900">Selesai</option>
          <option value="ditolak" className="bg-slate-900">Ditolak</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
