import 'server-only'
import type { createClient } from './supabase/server'
import { tripLabel, type UberTrip } from './import-uber'

type Client = Awaited<ReturnType<typeof createClient>>
export type SaveResult = { added: number; skipped: number } | { error: string }

/** Ajoute une ligne de revenu par course Uber, en ignorant celles déjà présentes. */
export async function saveUberTrips(supabase: Client, trips: UberTrip[], share: number): Promise<SaveResult> {
  const dates = trips.map((t) => t.date).sort()
  const { data: existing, error: readError } = await supabase
    .from('revenues').select('date, label').eq('source', 'uber')
    .gte('date', dates[0]).lte('date', dates[dates.length - 1])
  if (readError) return { error: 'Import impossible. Réessaie.' }

  const seen = new Set((existing ?? []).map((r) => `${r.date}|${r.label}`))
  const rows = trips
    .filter((t) => !seen.has(`${t.date}|${tripLabel(t)}`) && seen.add(`${t.date}|${tripLabel(t)}`))
    .map((t) => ({
      date: t.date,
      source: 'uber',
      label: tripLabel(t),
      rides_count: t.cancelled ? 0 : 1,
      gross_amount: t.amount,
      platform_fees: 0, // Uber affiche déjà ta part, commission déduite
      tips: 0,
      payment_method: 'app',
      employer_share_pct: share,
      notes: 'Importé depuis l’historique Uber',
    }))

  if (rows.length > 0) {
    const { error: dbError } = await supabase.from('revenues').insert(rows)
    if (dbError) return { error: 'Import impossible. Réessaie.' }
  }
  return { added: rows.length, skipped: trips.length - rows.length }
}
