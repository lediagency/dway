export type PeriodKey = 'semaine' | '4semaines' | 'mois' | 'annee'

export const PERIODS: Record<PeriodKey, string> = {
  semaine: 'Semaine',
  '4semaines': '4 semaines',
  mois: 'Mois',
  annee: 'Année',
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function parsePeriod(value: string | string[] | undefined): PeriodKey {
  return typeof value === 'string' && value in PERIODS ? (value as PeriodKey) : '4semaines'
}

/** Bornes incluses [from, to] au format YYYY-MM-DD. La semaine commence le lundi. */
export function periodRange(key: PeriodKey, today = new Date()) {
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const from = new Date(to)
  if (key === 'semaine') from.setDate(to.getDate() - ((to.getDay() + 6) % 7))
  if (key === '4semaines') from.setDate(to.getDate() - 27)
  if (key === 'mois') from.setDate(1)
  if (key === 'annee') from.setMonth(0, 1)
  return { from: iso(from), to: iso(to) }
}

export function daysBetween(from: string, to: string) {
  const days: string[] = []
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    days.push(iso(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

export const todayIso = () => iso(new Date())
