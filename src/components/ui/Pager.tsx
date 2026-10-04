import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface PagerProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export function Pager({ page, pageCount, onChange }: PagerProps) {
  if (pageCount <= 1) {
    return null
  }
  return (
    <nav
      className="mt-6 flex items-center justify-center gap-3"
      aria-label="Paginación"
    >
      <Button
        variant="icon"
        tooltip="Página anterior"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>
      <span className="text-[13px] text-(--text-muted)">
        Página {page} de {pageCount}
      </span>
      <Button
        variant="icon"
        tooltip="Página siguiente"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </nav>
  )
}
