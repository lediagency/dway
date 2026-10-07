/** Lit un montant saisi à la belge ("12,50", "1 250,00") ou à l'anglaise ("12.50"). */
export function parseAmount(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === '') return 0
  const n = Number(String(value).replace(/[\s €]/g, '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}

export function parsePct(value: FormDataEntryValue | null): number | null {
  const n = parseAmount(value)
  return n !== null && n <= 100 ? n : null
}

export function text(value: FormDataEntryValue | null) {
  const s = String(value ?? '').trim()
  return s === '' ? null : s
}

export function isoDate(value: FormDataEntryValue | null) {
  const s = String(value ?? '')
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

export type FormState = { error?: string; ok?: number } | undefined
