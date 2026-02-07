"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"

interface UserStat {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  snapshots_count: number
  tasks_count: number
  columns_count: number
  total_items: number
}

type SortKey = "email" | "snapshots_count" | "tasks_count" | "columns_count" | "total_items" | "last_sign_in_at"

interface UsersTableProps {
  users: UserStat[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("total_items")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    let data = [...users]

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter((u) => u.email.toLowerCase().includes(q))
    }

    data.sort((a, b) => {
      let aVal: string | number = a[sortKey] ?? ""
      let bVal: string | number = b[sortKey] ?? ""

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return data
  }, [users, search, sortKey, sortDir])

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary" />
    )
  }

  const formatDate = (date: string | null) => {
    if (!date) return "---"
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const columns: { label: string; key: SortKey; align?: "center" | "left" }[] = [
    { label: "البريد الإلكتروني", key: "email", align: "left" },
    { label: "الملفات المحفوظة", key: "snapshots_count", align: "center" },
    { label: "المهام", key: "tasks_count", align: "center" },
    { label: "الأعمدة", key: "columns_count", align: "center" },
    { label: "الإجمالي", key: "total_items", align: "center" },
    { label: "آخر دخول", key: "last_sign_in_at", align: "center" },
  ]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالبريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            dir="rtl"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none transition-colors hover:text-foreground ${
                    col.align === "center" ? "text-center" : "text-right"
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <SortIcon column={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  لا توجد نتائج
                </td>
              </tr>
            ) : (
              filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-foreground">{user.email}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-chart-1/10 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--chart-1))]">
                      {user.snapshots_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-chart-2/10 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--chart-2))]">
                      {user.tasks_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-chart-3/10 px-2 py-0.5 text-xs font-semibold text-[hsl(var(--chart-3))]">
                      {user.columns_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {user.total_items}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground text-right" dir="rtl">
        إجمالي المستخدمين: {filtered.length}
      </div>
    </div>
  )
}
