"use client"

import React, { Suspense } from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Loading from "./loading"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f26522] to-[#f5e6d3] flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-3xl font-bold text-[#f26522]">SILLAR</span>
          </div>
          <p className="text-[#f5e6d3]/70">Factory Machine - Flow Builder</p>
        </div>

        {/* Login Form */}
        <Suspense fallback={<Loading />}>
          <LoginForm handleLogin={handleLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} error={error} />
        </Suspense>
      </div>
    </div>
  )
}

function LoginForm({ handleLogin, email, setEmail, password, setPassword, loading, error }) {
  return (
    <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-[#f5e6d3]/80 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f0f]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f26522]/50 focus:ring-1 focus:ring-[#f26522]/50 transition-all"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-[#f5e6d3]/80 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f0f]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f26522]/50 focus:ring-1 focus:ring-[#f26522]/50 transition-all"
            placeholder="********"
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#f26522] to-[#f26522]/80 text-white font-semibold rounded-xl hover:from-[#f26522]/90 hover:to-[#f26522]/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#f26522]/20"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <a
          href="https://cp.sillar.us/login"
          className="text-[#f26522] hover:text-[#f26522]/80 text-sm transition-colors"
        >
          Go to Control Panel
        </a>
      </div>
    </div>
  )
}

function Loading() {
  return null
}
