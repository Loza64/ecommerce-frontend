const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function luminance(hex: string): number {
  let value = hex.trim().replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(value, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.6 ? '#14161f' : '#ffffff'
}

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value.trim())
}

export function normalizeHex(value: string, fallback: string): string {
  const trimmed = value.trim()
  if (!isValidHex(trimmed)) {
    return fallback
  }

  let digits = trimmed.replace('#', '').toLowerCase()
  if (digits.length === 3) {
    digits = digits
      .split('')
      .map((c) => c + c)
      .join('')
  }
  return `#${digits}`
}
