import { Search } from 'lucide-react'

export interface SearchBoxProps {
  placeholder?: string
  value: string
  onValueChange: (value: string) => void
}

export function SearchBox({
  placeholder = 'Buscar...',
  value,
  onValueChange,
}: SearchBoxProps) {
  return (
    <div className="relative max-w-[320px] min-w-[200px] flex-1 max-[640px]:max-w-none">
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2 text-[var(--text-muted)]"
      />
      <input
        type="text"
        className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-3 pl-[34px] font-sans text-[13px] text-[var(--text)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </div>
  )
}
