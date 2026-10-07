/**
 * Lit l'« Historique des courses » de drivers.uber.com copié-collé depuis le navigateur.
 * Une ligne ressemble à : « Wed Oct 7 2026 4:47 am  6m 2s  2.07  €6.50  Terminé ».
 */

export type UberTrip = {
  date: string // AAAA-MM-JJ
  time: string // HH:MM (24 h)
  minutes: number
  km: number
  amount: number
  cancelled: boolean
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const ROW = /(?:mon|tue|wed|thu|fri|sat|sun)\w*\.?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+(\d{1,2}),?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(am|pm)/gi

const pad = (n: number) => String(n).padStart(2, '0')

/** « €1,234.50 », « 6,50 € » → 1234.5 / 6.5 */
function parseMoney(s: string) {
  const raw = s.replace(/[€\s]/g, '')
  const normalized = raw.includes('.') ? raw.replace(/,/g, '') : raw.replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

export function parseUberTrips(text: string): UberTrip[] {
  const matches = [...text.matchAll(ROW)]
  const trips: UberTrip[] = []
  matches.forEach((m, i) => {
    const rest = text.slice(m.index! + m[0].length, matches[i + 1]?.index ?? text.length)
    const money = rest.match(/€[ \u00a0]?\d[\d.,]*|\d[\d.,]*[ \u00a0]?€/)
    if (!money) return
    const amount = parseMoney(money[0])
    if (amount === null) return

    let hour = Number(m[4]) % 12
    if (m[6].toLowerCase() === 'pm') hour += 12
    const duration = rest.match(/(?:(\d+)\s*h\s*)?(\d+)\s*m(?:in)?\s*(\d+)\s*s/i)
    const beforeMoney = rest.slice(0, money.index).replace(duration?.[0] ?? '', '')
    const km = beforeMoney.match(/\d+(?:[.,]\d+)?/)

    trips.push({
      date: `${m[3]}-${pad(MONTHS.indexOf(m[1].toLowerCase()) + 1)}-${pad(Number(m[2]))}`,
      time: `${pad(hour)}:${m[5]}`,
      minutes: duration ? Number(duration[1] ?? 0) * 60 + Number(duration[2]) + Number(duration[3]) / 60 : 0,
      km: km ? Number(km[0].replace(',', '.')) : 0,
      amount,
      cancelled: /annul|cancel/i.test(rest.slice(money.index)),
    })
  })
  return trips
}

/** Libellé stable d'une course : sert aussi à ne pas l'importer deux fois. */
export function tripLabel(t: UberTrip) {
  return t.cancelled ? `Uber ${t.time} · annulation` : `Uber ${t.time} · ${t.km.toLocaleString('fr-BE')} km`
}
