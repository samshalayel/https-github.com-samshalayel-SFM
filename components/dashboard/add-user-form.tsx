"use client"

import { useState } from "react"
import { UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Accounts are created by an admin only. Leave the password empty for a
// Google-only account (the person signs in with Google using this email).
export function AddUserForm({ onCreated }: { onCreated: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"developer" | "admin">("developer")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || undefined, role }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "فشل إضافة المستخدم")
      setMsg({ ok: true, text: `تمت إضافة ${email}` })
      setEmail("")
      setPassword("")
      setRole("developer")
      onCreated()
    } catch (err: any) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 rounded-xl border border-border p-4 flex flex-wrap items-end gap-3" dir="rtl">
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs text-muted-foreground">الإيميل</label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" />
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="text-xs text-muted-foreground">كلمة المرور (فارغة = دخول Google فقط)</label>
        <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block">الصلاحية</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "developer" | "admin")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="developer">مطور</option>
          <option value="admin">مدير</option>
        </select>
      </div>
      <Button type="submit" disabled={busy} className="gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        إضافة مستخدم
      </Button>
      {msg && <p className={`w-full text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>}
    </form>
  )
}
