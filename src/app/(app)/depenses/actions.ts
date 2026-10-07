'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'
import { isoDate, parseAmount, parsePct, text, type FormState } from '@/lib/form'
import { createClient } from '@/lib/supabase/server'

function read(formData: FormData) {
  const category = String(formData.get('category'))
  const values = {
    date: isoDate(formData.get('date')),
    category,
    label: text(formData.get('label')),
    amount: parseAmount(formData.get('amount')),
    employer_share_pct: parsePct(formData.get('employer_share_pct')),
    reimbursed: formData.get('reimbursed') === 'on',
    notes: text(formData.get('notes')),
  }
  if (!values.date) return { error: 'Date invalide.' }
  if (!(category in CATEGORIES)) return { error: 'Catégorie invalide.' }
  if (!values.amount) return { error: 'Indique le montant.' }
  if (values.employer_share_pct === null) return { error: 'La part employeur doit être entre 0 et 100 %.' }
  return { values }
}

function refresh() {
  revalidatePath('/depenses')
  revalidatePath('/dashboard')
}

export async function createExpense(_: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('expenses').insert(values)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  return { ok: Date.now() }
}

export async function updateExpense(id: string, _: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('expenses').update(values).eq('id', id)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  redirect('/depenses')
}

export async function markReimbursed(id: string) {
  const supabase = await createClient()
  await supabase.from('expenses').update({ reimbursed: true }).eq('id', id)
  refresh()
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  await supabase.from('expenses').delete().eq('id', id)
  refresh()
}
