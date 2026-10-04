import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'

const variantClass: Record<BadgeVariant, string> = {
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  neutral: 'bg-[var(--surface-muted)] text-[var(--text-muted)]',
}

export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: BadgeVariant
  children?: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-[3px] text-xs font-semibold',
        variantClass[variant]
      )}
    >
      {children}
    </span>
  )
}
