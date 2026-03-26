'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/lib/api'
import { setToken } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { token } = await adminLogin(form.username, form.password)
      setToken(token)
      toast.success('Welcome back, Admin!')
      router.push('/admin')
    } catch {
      toast.error('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--navy-dark)] via-[var(--navy)] to-[var(--navy-light)] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--gold)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-[var(--navy-dark)] font-black text-xl">L2L</span>
          </div>
          <h1 className="text-2xl font-black text-white">LIFTED TO LIFT</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-[var(--gold)]" />
            <h2 className="font-black text-[var(--navy)] text-lg">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-[var(--navy)] block mb-2">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-sm"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[var(--navy)] block mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 transition-all text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[var(--navy)]/30 border-t-[var(--navy)] rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Protected admin area. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  )
}
