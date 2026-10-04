import dayjs from 'dayjs'

/** ISO -> valor de <input type="datetime-local"> en hora local */
export function toDatetimeLocal(iso?: string | null): string {
  return iso ? dayjs(iso).format('YYYY-MM-DDTHH:mm') : ''
}

/** valor de <input type="datetime-local"> -> ISO (UTC) */
export function fromDatetimeLocal(value: string): string {
  return dayjs(value).toISOString()
}

export function formatDateTime(iso?: string | null): string {
  return iso ? dayjs(iso).format('DD/MM/YYYY HH:mm') : '—'
}
