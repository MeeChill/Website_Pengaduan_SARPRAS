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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="md:col-span-2 relative">
        <input
          type="text"
          placeholder="Cari judul aspirasi..."
          className={`modern-input transition-all ${search ? 'pl-4' : 'pl-10'}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!search && (
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      
      <select 
        className="modern-input"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
        ))}
      </select>
      
      <select 
        className="modern-input"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="all">Semua Status</option>
        <option value="pending">Pending</option>
        <option value="disetujui">Disetujui</option>
        <option value="dalam_progres">Dalam Proses</option>
        <option value="selesai">Selesai</option>
        <option value="ditolak">Ditolak</option>
      </select>
    </div>
  )
}
