import Link from "next/link"

// Public sign-up is closed: an admin adds accounts from /dashboard.
export default function SignUpClosedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-xl font-bold">التسجيل مغلق</h1>
        <p className="text-muted-foreground text-sm">
          الحسابات بيضيفها المدير. إذا بدك حساب، تواصل معه وبيضيفك بإيميلك.
        </p>
        <Link href="/auth/login" className="text-primary underline">رجوع لتسجيل الدخول</Link>
      </div>
    </div>
  )
}
