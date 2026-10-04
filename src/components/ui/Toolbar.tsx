import type { ReactNode } from 'react'

export function Toolbar({
  children,
  actions,
}: {
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-[15px] flex flex-wrap items-center gap-3 max-[640px]:flex-col max-[640px]:items-stretch">
      {children}
      <span className="flex-1 max-[640px]:hidden" />
      {actions}
    </div>
  )
}
