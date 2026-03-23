"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"

function ApiLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("جارٍ التحقق من المفتاح...")

  useEffect(() => {
    const key = searchParams.get("key")

    if (!key) {
      setStatus("error")
      setMessage("لم يتم توفير مفتاح API")
      return
    }

    // Validate and authenticate with API key
    const authenticateWithApiKey = async () => {
      try {
        const response = await fetch("/api/auth/api-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key }),
        })

        const data = await response.json()

        if (!response.ok) {
          setStatus("error")
          setMessage(data.error || "فشل في التحقق من المفتاح")
          return
        }

        setStatus("success")
        setMessage("تم التحقق بنجاح! جارٍ التوجيه...")

        // Redirect to magic link to complete authentication
        if (data.redirectUrl) {
          setTimeout(() => {
            window.location.href = data.redirectUrl
          }, 1500)
        } else {
          // Fallback to home page
          setTimeout(() => {
            router.push("/")
            router.refresh()
          }, 1500)
        }
      } catch (error) {
        console.error("API login error:", error)
        setStatus("error")
        setMessage("حدث خطأ في الاتصال بالخادم")
      }
    }

    authenticateWithApiKey()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#1a1a2e]">
      {/* Grid pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-md px-4">
        <div className="rounded-xl border border-white/10 bg-[#252538]/50 p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <Image
              src="/company-logo.png"
              alt="Company Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />

            <h1 className="mt-4 text-xl font-semibold text-white">تسجيل الدخول بـ API</h1>

            <div className="mt-6 flex flex-col items-center gap-4">
              {status === "loading" && (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-[#f26522]" />
                  <p className="text-gray-400">{message}</p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-green-400">{message}</p>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <p className="text-red-400">{message}</p>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="mt-4 rounded-lg bg-[#f26522] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e55a1b]"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApiLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-[#1a1a2e]">
          <Loader2 className="h-8 w-8 animate-spin text-[#f26522]" />
        </div>
      }
    >
      <ApiLoginContent />
    </Suspense>
  )
}
