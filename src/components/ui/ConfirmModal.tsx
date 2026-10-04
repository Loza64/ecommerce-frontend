import { type ReactNode, useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ConfirmModalTone = 'danger' | 'warning' | 'primary' | 'success'

export interface ConfirmModalProps {
  open: boolean
  title: string
  description?: ReactNode
  icon?: ReactNode
  tone?: ConfirmModalTone
  confirmText?: string
  cancelText?: string
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

const toneStyles: Record<
  ConfirmModalTone,
  { iconWrap: string; confirmVariant: ButtonVariant }
> = {
  danger: {
    iconWrap: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    confirmVariant: 'danger',
  },
  warning: {
    iconWrap: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    confirmVariant: 'primary',
  },
  primary: {
    iconWrap: 'bg-[var(--primary-soft)] text-[var(--primary)]',
    confirmVariant: 'primary',
  },
  success: {
    iconWrap: 'bg-[var(--success-soft)] text-[var(--success)]',
    confirmVariant: 'primary',
  },
}

const ANIMATION_MS = 160

export function ConfirmModal({
  open,
  title,
  description,
  icon,
  tone = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setMounted(true)
        setClosing(false)
      })
      return
    }
    if (!mounted) {
      return
    }
    queueMicrotask(() => {
      setClosing(true)
    })
    const timeout = setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, ANIMATION_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!mounted) {
    return null
  }

  const { iconWrap, confirmVariant } = toneStyles[tone]

  const handleCancel = () => {
    if (loading) {
      return
    }
    onCancel()
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(15,18,25,0.5)] px-4',
        closing
          ? 'animate-[fade-out_0.16s_ease-in_forwards]'
          : 'animate-[fade-in_0.15s_ease-out]'
      )}
      onClick={handleCancel}
    >
      <div
        className={cn(
          'flex w-full max-w-[420px] flex-col items-center gap-4 rounded-xl bg-[var(--surface)] p-6 text-center shadow-[0_20px_45px_rgba(15,18,25,0.25)]',
          closing
            ? 'animate-[rise-out_0.16s_ease-in_forwards]'
            : 'animate-[rise-in_0.18s_ease-out]'
        )}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div
          className={cn(
            'flex h-14 w-14 animate-[icon-pop-in_0.28s_ease-out] items-center justify-center rounded-full',
            iconWrap
          )}
        >
          {icon ?? <AlertTriangle size={26} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2
            id="confirm-modal-title"
            className="m-0 text-base font-semibold text-[var(--text)]"
          >
            {title}
          </h2>
          {description && (
            <p className="m-0 text-[13px] leading-relaxed text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>

        <div className="mt-1 flex w-full gap-2">
          <Button
            variant="ghost"
            fullWidth
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            fullWidth
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
