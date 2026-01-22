import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#0f0f23] p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f26522] to-[#ff8c42] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#f26522]/30">
              S
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">SILLAR</span>
          </div>

          <Card className="bg-[#1a1a2e]/80 border-white/10 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
              <CardDescription className="text-gray-400">
                We&apos;ve sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">
                Please check your email and click the confirmation link to activate your account.
              </p>
              <Link
                href="/auth/login"
                className="text-[#f26522] hover:text-[#ff8c42] underline underline-offset-4 transition-colors"
              >
                Back to Sign In
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
