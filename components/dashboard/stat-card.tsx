import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  accentClass: string
}

export function StatCard({ title, value, icon: Icon, accentClass }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4 transition-colors hover:border-primary/30">
      <div className={`rounded-lg p-3 ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-card-foreground mt-1 tracking-tight">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
