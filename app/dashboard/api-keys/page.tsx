"use client"

import { useEffect, useState } from "react"
import { Key, Plus, Trash2, Copy, Check, RefreshCw, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
}

interface NewKeyResponse {
  key: ApiKey
  fullKey: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showNewKey, setShowNewKey] = useState(true)

  const supabase = createClient()

  const fetchKeys = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("يجب تسجيل الدخول أولاً")
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, created_at, last_used_at, expires_at, is_active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }
      setKeys(data || [])
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير معروف")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const createKey = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "فشل في إنشاء المفتاح")
      }
      
      const data: NewKeyResponse = await res.json()
      setNewKey(data.fullKey)
      setNewKeyName("")
      await fetchKeys()
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير معروف")
    } finally {
      setCreating(false)
    }
  }

  const deleteKey = async (id: string) => {
    setDeletingId(id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("يجب تسجيل الدخول أولاً")
        return
      }

      const { error: deleteError } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }
      
      setKeys((prev) => prev.filter((k) => k.id !== id))
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير معروف")
    } finally {
      setDeletingId(null)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "---"
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">مفاتيح API</h1>
              <p className="text-xs text-muted-foreground">إدارة مفاتيح الوصول للـ API</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchKeys}
              disabled={loading}
              className="gap-2 border-border text-foreground hover:bg-muted"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted">
                لوحة التحكم
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* New Key Created Alert */}
        {newKey && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground mb-1">تم إنشاء مفتاح جديد!</p>
                <p className="text-sm text-muted-foreground mb-3">
                  انسخ هذا المفتاح الآن. لن تتمكن من رؤيته مرة أخرى.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-sm font-mono text-foreground overflow-hidden">
                    {showNewKey ? newKey : "•".repeat(40)}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewKey(!showNewKey)}
                    className="shrink-0"
                  >
                    {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newKey, "new")}
                    className="shrink-0"
                  >
                    {copiedId === "new" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewKey(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                إغلاق
              </Button>
            </div>
          </div>
        )}

        {/* Create New Key */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">إنشاء مفتاح جديد</h2>
          <div className="flex gap-3">
            <Input
              placeholder="اسم المفتاح (مثال: تطبيق الجوال)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
              dir="rtl"
              onKeyDown={(e) => e.key === "Enter" && createKey()}
            />
            <Button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              إنشاء
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Keys List */}
        {loading && keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">جاري تحميل المفاتيح...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 rounded-full bg-muted p-4 w-fit">
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">لا توجد مفاتيح API</p>
            <p className="text-sm text-muted-foreground">أنشئ مفتاحك الأول للبدء في استخدام API</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground mb-4">المفاتيح الموجودة ({keys.length})</h2>
            {keys.map((key) => (
              <div
                key={key.id}
                className={`rounded-xl border bg-card p-4 transition-colors ${
                  key.is_active ? "border-border hover:border-primary/30" : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`rounded-lg p-2 ${key.is_active ? "bg-primary/10" : "bg-destructive/10"}`}>
                      <Key className={`h-4 w-4 ${key.is_active ? "text-primary" : "text-destructive"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{key.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {key.key_prefix}...
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(key.key_prefix, key.id)}
                        >
                          {copiedId === key.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                      <p className="text-sm text-foreground">{formatDate(key.created_at)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">آخر استخدام</p>
                      <p className="text-sm text-foreground">{formatDate(key.last_used_at)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteKey(key.id)}
                      disabled={deletingId === key.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {deletingId === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
