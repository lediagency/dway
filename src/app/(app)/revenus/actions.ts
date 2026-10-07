'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SOURCES, PAYMENT_METHODS } from '@/lib/constants'
import { isoDate, parseAmount, parsePct, text, type FormState } from '@/lib/form'
import { parseUberTrips } from '@/lib/import-uber'
import { saveUberTrips } from '@/lib/save-uber'
import { createClient } from '@/lib/supabase/server'

function read(formData: FormData) {
  const source = String(formData.get('source'))
  const payment = String(formData.get('payment_method'))
  const values = {
    date: isoDate(formData.get('date')),
    source,
    label: text(formData.get('label')),
    rides_count: Math.max(0, Math.round(Number(formData.get('rides_count') || 1))),
    gross_amount: parseAmount(formData.get('gross_amount')),
    platform_fees: parseAmount(formData.get('platform_fees')),
    tips: parseAmount(formData.get('tips')),
    payment_method: payment,
    employer_share_pct: parsePct(formData.get('employer_share_pct')),
    notes: text(formData.get('notes')),
  }
  if (!values.date) return { error: 'Date invalide.' }
  if (!(source in SOURCES) || !(payment in PAYMENT_METHODS)) return { error: 'Source ou paiement invalide.' }
  if (!values.gross_amount) return { error: 'Indique le montant brut.' }
  if (values.platform_fees === null || values.tips === null) return { error: 'Montant invalide.' }
  if (values.platform_fees > values.gross_amount) return { error: 'Les commissions dépassent le montant brut.' }
  if (values.employer_share_pct === null) return { error: 'La part employeur doit être entre 0 et 100 %.' }
  return { values }
}

function refresh() {
  revalidatePath('/revenus')
  revalidatePath('/dashboard')
}

export async function createRevenue(_: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('revenues').insert(values)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  return { ok: Date.now() }
}

export async function updateRevenue(id: string, _: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('revenues').update(values).eq('id', id)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  redirect('/revenus')
}

export async function deleteRevenue(id: string) {
  const supabase = await createClient()
  await supabase.from('revenues').delete().eq('id', id)
  refresh()
}

export type ImportState = { error?: string; added?: number; skipped?: number } | undefined

/** Importe l'historique Uber collé : une ligne de revenu par course, sans doublon. */
export async function importUber(_: ImportState, formData: FormData): Promise<ImportState> {
  const trips = parseUberTrips(String(formData.get('text') ?? ''))
  const share = parsePct(formData.get('employer_share_pct'))
  if (trips.length === 0) return { error: 'Aucune course reconnue. Copie bien le tableau « Historique des courses » d’Uber.' }
  if (share === null) return { error: 'La part employeur doit être entre 0 et 100 %.' }

  const result = await saveUberTrips(await createClient(), trips, share)
  if ('added' in result && result.added > 0) refresh()
  return result
}
