import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  title?: string
  widthPx?: number
  onClose: () => void
  children?: ReactNode
}

export function Modal({
  open,
  title = '',
  widthPx = 520,
  onClose,
  children,
}: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-[fade-in_0.15s_ease-out] items-start justify-center bg-[rgba(15,18,25,0.5)] px-4 py-[5vh]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full animate-[rise-in_0.18s_ease-out] flex-col rounded-xl bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,18,25,0.25)]"
        style={{ maxWidth: widthPx }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-[18px]">
          <h2 className="m-0 text-base font-semibold text-[var(--text)]">
            {title}
          </h2>
          <button
            type="button"
            className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border-none bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
