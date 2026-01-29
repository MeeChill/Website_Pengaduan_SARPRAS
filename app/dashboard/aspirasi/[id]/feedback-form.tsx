'use client'

import { useState } from 'react'
import { submitFeedback } from '@/app/actions'

export default function FeedbackForm({ aspirasiId }: { aspirasiId: number }) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return alert('Silakan berikan rating bintang.')
    setLoading(true)
    await submitFeedback(aspirasiId, rating, feedback)
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-white font-bold">Terima Kasih!</h3>
        <p className="text-slate-400 text-sm">Feedback Anda sangat berharga bagi kami.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-white font-bold text-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        Berikan Penilaian
      </h3>
      <p className="text-slate-400 text-sm">Bagaimana penilaian Anda terhadap penanganan aspirasi ini?</p>
      
      <div className="flex gap-2 justify-center py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            onClick={() => setRating(star)}
            className={`transition-all transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-slate-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        placeholder="Tuliskan masukan atau testimoni Anda..."
        className="modern-input h-24 text-sm resize-none"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      ></textarea>

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? 'Mengirim...' : 'Kirim Penilaian'}
      </button>
    </div>
  )
}
