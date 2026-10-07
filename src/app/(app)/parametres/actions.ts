'use server'

import { revalidatePath } from 'next/cache'
import { parseAmount, parsePct, text, type FormState } from '@/lib/form'
import { createClient } from '@/lib/supabase/server'

export async function saveProfile(_: FormState, formData: FormData): Promise<FormState> {
  const goal = parseAmount(formData.get('goal_4w'))
  const share = parsePct(formData.get('default_employer_share'))
  if (!goal) return { error: 'Indique un objectif valide.' }
  if (share === null) return { error: 'La part employeur doit être entre 0 et 100 %.' }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return { error: 'Session expirée, reconnecte-toi.' }

  const { error } = await supabase.from('profiles').update({
    full_name: text(formData.get('full_name')),
    company_name: text(formData.get('company_name')),
    vat_number: text(formData.get('vat_number')),
    phone: text(formData.get('phone')),
    goal_4w: goal,
    default_employer_share: share,
    updated_at: new Date().toISOString(),
  }).eq('id', data.claims.sub)
  if (error) return { error: 'Enregistrement impossible. Réessaie.' }
  revalidatePath('/', 'layout')
  return { ok: Date.now() }
}
