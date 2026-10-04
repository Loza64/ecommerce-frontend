import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  'primary' | 'danger' | 'ghost' | 'icon' | 'icon-danger' | 'icon-success'

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  fullWidth?: boolean
  tooltip?: string
  children?: ReactNode
}

const base =
  'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-transparent text-[13px] font-semibold whitespace-nowrap font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'px-3.5 py-2.5 bg-[var(--primary)] text-[var(--primary-contrast)] hover:enabled:bg-[var(--primary-hover)]',
  danger:
    'px-3.5 py-2.5 bg-[var(--danger)] text-white hover:enabled:bg-[color-mix(in_srgb,var(--danger)_90%,black)]',
  ghost:
    'px-3.5 py-2.5 bg-transparent border-[var(--border)] text-[var(--text)] hover:enabled:bg-[var(--surface-muted)]',
  icon: 'w-[30px] h-[30px] p-0 justify-center border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:enabled:text-[var(--text)] hover:enabled:bg-[var(--surface-muted)]',
  'icon-danger':
    'w-[30px] h-[30px] p-0 justify-center border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:enabled:text-[var(--danger)] hover:enabled:border-[var(--danger)] hover:enabled:bg-[var(--danger-soft)]',
  'icon-success':
    'w-[30px] h-[30px] p-0 justify-center border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:enabled:text-[var(--success)] hover:enabled:border-[var(--success)] hover:enabled:bg-[var(--success-soft)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      type = 'button',
      fullWidth,
      tooltip,
      className,
      children,
      ...rest
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      title={tooltip || undefined}
      className={cn(
        base,
        variantClass[variant],
        fullWidth && 'w-full justify-center',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
