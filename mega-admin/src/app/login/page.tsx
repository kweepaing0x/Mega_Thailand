'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center font-display font-bold text-white text-2xl mx-auto mb-3 shadow-lg shadow-brand-500/20">
            M
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Mega Thailand</h1>
          <p className="text-sm text-surface-700 mt-1">Admin Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-surface-900 rounded-2xl border border-surface-800 p-6 space-y-4">
          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input" placeholder="admin@megathailand.com" required />
          </div>

          <div>
            <label className="block text-xs text-surface-700 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="input pr-10" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700 hover:text-surface-200">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn btn-primary w-full justify-center mt-2">
            {loading ? <Loader2 size={14} className="spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-surface-700 mt-4">
          Mega Thailand Admin · Restricted Access
        </p>
      </div>
    </div>
  )
}
