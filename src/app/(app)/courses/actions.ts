'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PAYMENT_METHODS, SOURCES } from '@/lib/constants'
import { isoDate, parseAmount, parsePct, text, time, type FormState } from '@/lib/form'
import { createClient } from '@/lib/supabase/server'

function read(formData: FormData) {
  const source = String(formData.get('source'))
  const payment = String(formData.get('payment_method'))
  const values = {
    kind: 'course' as const,
    rides_count: 1,
    date: isoDate(formData.get('date')),
    start_time: time(formData.get('start_time')),
    source,
    label: text(formData.get('label')),
    pickup: text(formData.get('pickup')),
    dropoff: text(formData.get('dropoff')),
    distance_km: formData.get('distance_km') ? parseAmount(formData.get('distance_km')) : null,
    gross_amount: parseAmount(formData.get('gross_amount')),
    platform_fees: parseAmount(formData.get('platform_fees')),
    tips: parseAmount(formData.get('tips')),
    payment_method: payment,
    employer_share_pct: parsePct(formData.get('employer_share_pct')),
    notes: text(formData.get('notes')),
  }
  if (!values.date) return { error: 'Date invalide.' }
  if (!(source in SOURCES) || !(payment in PAYMENT_METHODS)) return { error: 'Source ou paiement invalide.' }
  if (!values.gross_amount) return { error: 'Indique le prix de la course.' }
  if (values.platform_fees === null || values.tips === null) return { error: 'Montant invalide.' }
  if (values.distance_km === null && formData.get('distance_km')) return { error: 'Distance invalide.' }
  if (values.platform_fees > values.gross_amount) return { error: 'Les commissions dépassent le prix.' }
  if (values.employer_share_pct === null) return { error: 'La part employeur doit être entre 0 et 100 %.' }
  return { values }
}

function refresh() {
  revalidatePath('/courses')
  revalidatePath('/revenus')
  revalidatePath('/dashboard')
}

export async function createCourse(_: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('revenues').insert(values)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  return { ok: Date.now() }
}

export async function updateCourse(id: string, _: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('revenues').update(values).eq('id', id)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  redirect('/courses')
}

export async function deleteCourse(id: string) {
  const supabase = await createClient()
  await supabase.from('revenues').delete().eq('id', id)
  refresh()
}
