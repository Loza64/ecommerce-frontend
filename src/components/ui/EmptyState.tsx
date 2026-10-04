import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-(--radius-lg) border border-dashed border-(--border) bg-(--surface) px-6 py-14 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-soft) text-(--primary)">
        <Icon size={22} />
      </span>
      <h2 className="m-0 text-base font-semibold text-(--text)">{title}</h2>
      {description && (
        <p className="m-0 max-w-[48ch] text-[13px] text-(--text-muted)">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
