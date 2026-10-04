import type { ReactNode } from 'react'

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  hint?: string
  error?: string
  children?: ReactNode
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-semibold text-[var(--text)]"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <span className="hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
