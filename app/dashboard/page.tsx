"use client"

import { useEffect, useState } from "react"
import { Users, FileArchive, ListTodo, Columns3, RefreshCw, ArrowRight, Loader2, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/stat-card"
import { UsersTable } from "@/components/dashboard/users-table"
import { UserProfile } from "@/components/user-profile"
import Link from "next/link"

interface UserStat {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  snapshots_count: number
  tasks_count: number
  columns_count: number
  total_items: number
  role: string
  is_active: boolean
}

interface DashboardData {
  summary: {
    total_users: number
    total_snapshots: number
    total_tasks: number
    total_columns: number
  }
  userStats: UserStat[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/stats")
      if (res.status === 403) { setForbidden(true); return }
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Failed to fetch data")
      }
      setData(await res.json())
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (forbidden) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">غير مصرح</h1>
          <p className="text-muted-foreground">هذه الصفحة للمديرين فقط</p>
          <Link href="/"><Button variant="outline">العودة للتطبيق</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">إدارة المستخدمين والإحصائيات</p>
            </div>
            <UserProfile />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2 border-border text-foreground hover:bg-muted">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted">
                العودة للمشروع
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-medium mb-2">حدث خطأ</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchData}>إعادة المحاولة</Button>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="إجمالي المستخدمين" value={data.summary.total_users} icon={Users} accentClass="bg-primary/10 text-primary" />
              <StatCard title="الملفات المحفوظة" value={data.summary.total_snapshots} icon={FileArchive} accentClass="bg-[hsl(var(--chart-1))]/10 text-[hsl(var(--chart-1))]" />
              <StatCard title="المهام" value={data.summary.total_tasks} icon={ListTodo} accentClass="bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]" />
              <StatCard title="الأعمدة" value={data.summary.total_columns} icon={Columns3} accentClass="bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">إدارة المستخدمين</h2>
              <UsersTable users={data.userStats} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
