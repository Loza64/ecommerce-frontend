import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import type BaseEntity from '@/sdk/model/entities/BaseEntity'
import { cn } from '@/lib/utils'

export interface TableColumn<
  T extends BaseEntity,
  K extends keyof T = keyof T,
> {
  title: string
  dataIndex?: K
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, record: T, index: number) => ReactNode
}

export interface TablePagination {
  page: number
  pageCount: number
  total: number
  itemsLabel?: string
}

export interface TableProps<T extends BaseEntity> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: string | ((record: T) => string | number)
  loading?: boolean
  emptyText?: string
  loadingText?: string
  pagination?: TablePagination | null
  onPageChange?: (page: number) => void
}

const alignClass = (align?: 'left' | 'center' | 'right') =>
  align === 'center'
    ? 'text-center'
    : align === 'right'
      ? 'text-right'
      : undefined

export function Table<T extends BaseEntity>({
  columns,
  data,
  rowKey = 'id',
  loading = false,
  emptyText = 'No se encontraron resultados.',
  loadingText = 'Cargando...',
  pagination = null,
  onPageChange,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    const value = (record as Record<string, unknown>)[rowKey]
    return (value as string | number) ?? index
  }

  const cellValue = (column: TableColumn<T>, record: T): unknown =>
    column.dataIndex
      ? (record as Record<string, unknown>)[column.dataIndex as string]
      : undefined

  const cellContent = (
    column: TableColumn<T>,
    record: T,
    index: number
  ): ReactNode => {
    const value = cellValue(column, record)
    if (column.render) {
      return column.render(value, record, index)
    }
    return value === null || value === undefined ? '' : String(value)
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    'border-b border-[var(--border)] px-4 py-3 text-left text-xs font-semibold tracking-[0.03em] whitespace-nowrap text-[var(--text-muted)] uppercase',
                    alignClass(column.align)
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]"
                >
                  {loadingText}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className="hover:bg-[var(--surface-muted)] [&:last-child>td]:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'border-b border-[var(--border)] px-4 py-3 align-middle whitespace-nowrap',
                        alignClass(column.align)
                      )}
                    >
                      {cellContent(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-center gap-3 border-t border-[var(--border)] px-4 py-3 text-[13px] text-[var(--text-muted)]">
          <span>
            Página {pagination.page} de {pagination.pageCount || 1} ·{' '}
            {pagination.total} {pagination.itemsLabel ?? 'resultados'}
          </span>
          <button
            type="button"
            className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:enabled:bg-[var(--surface-muted)] hover:enabled:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange?.(pagination.page - 1)}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:enabled:bg-[var(--surface-muted)] hover:enabled:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.page >= pagination.pageCount}
            onClick={() => onPageChange?.(pagination.page + 1)}
          >
            <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      )}
    </div>
  )
}
