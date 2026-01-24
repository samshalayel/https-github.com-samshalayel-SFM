"use client"

import React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 0 0 9.003 18z" fill="#34A853"/>
      <path d="M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.33z" fill="#FBBC05"/>
      <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
    </svg>
  )
}

function AnalyticsIllustration() {
  return (
    <div className="relative w-64 h-64">
      {/* Binary code flowing upward */}
      <div className="absolute top-0 right-0 text-[10px] font-mono text-cyan-400/60 leading-tight">
        <div className="animate-pulse">01001 0101</div>
        <div className="animate-pulse delay-100">10110 1101</div>
        <div className="animate-pulse delay-200">01101 0110</div>
      </div>
      
      {/* Main container shape */}
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background shape */}
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        
        {/* Blue folder/container shape */}
        <path d="M40 80 L40 160 Q40 170 50 170 L150 170 Q160 170 160 160 L160 80 Q160 70 150 70 L100 70 L90 55 L50 55 Q40 55 40 65 Z" fill="url(#blueGrad)" opacity="0.9"/>
        
        {/* Bar chart */}
        <rect x="55" y="130" width="15" height="30" rx="2" fill="url(#cyanGrad)"/>
        <rect x="80" y="110" width="15" height="50" rx="2" fill="url(#yellowGrad)"/>
        <rect x="105" y="95" width="15" height="65" rx="2" fill="url(#orangeGrad)"/>
        
        {/* Gear/cog icon */}
        <circle cx="140" cy="130" r="20" fill="#1E3A5F" stroke="#F97316" strokeWidth="3"/>
        <circle cx="140" cy="130" r="8" fill="#0F172A"/>
        <g stroke="#F97316" strokeWidth="3">
          <line x1="140" y1="105" x2="140" y2="115"/>
          <line x1="140" y1="145" x2="140" y2="155"/>
          <line x1="115" y1="130" x2="125" y2="130"/>
          <line x1="155" y1="130" x2="165" y2="130"/>
          <line x1="122" y1="112" x2="129" y2="119"/>
          <line x1="151" y1="141" x2="158" y2="148"/>
          <line x1="122" y1="148" x2="129" y2="141"/>
          <line x1="151" y1="119" x2="158" y2="112"/>
        </g>
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Login Form */}
      <div className="relative flex w-full flex-col justify-center bg-[#1a1a2e] px-8 py-12 lg:w-1/2 lg:px-16">
        {/* Grid pattern background */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="relative z-10 mx-auto w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-xl border border-white/10 bg-[#252538]/50 p-8 backdrop-blur-sm">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white">Sign In</h1>
              <p className="mt-1 text-sm text-gray-400">Enter your details to access your account</p>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="mb-6 w-full border-white/10 bg-[#2a2a3d] py-5 text-white hover:bg-[#353548] hover:text-white"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <GoogleIcon />
              <span className="ml-2">{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#252538] px-4 text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/10 bg-[#2a2a3d] py-5 text-white placeholder:text-gray-500 focus:border-[#f26522] focus:ring-[#f26522]/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/10 bg-[#2a2a3d] py-5 text-white placeholder:text-gray-500 focus:border-[#f26522] focus:ring-[#f26522]/20"
                  />
                </div>
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-[#f26522] py-5 font-semibold text-white hover:bg-[#e55a1b]" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-[#f26522] transition-colors hover:text-[#ff8c42]"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-[#0f0f1a] px-12 lg:flex">
        <div className="flex flex-col items-center text-center">
          {/* Illustration */}
          <AnalyticsIllustration />
          
          {/* Title */}
          <h2 className="mt-8 text-3xl font-bold text-white">Contextual Analysis Workspace</h2>
          
          {/* Subtitle */}
          <p className="mt-3 text-gray-400">Analyze your data smartly and easily</p>
          
          {/* Feature badges */}
          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-400">Drag & Drop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-400">Multi-language</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-400">Dark Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
