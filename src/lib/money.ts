const DEFAULT_CURRENCY =
  (import.meta.env.VITE_CURRENCY as string | undefined) ?? 'USD'

export function formatMoney(
  value: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(Number.isFinite(amount) ? amount : 0)
}
