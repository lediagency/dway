import 'server-only'
import { createClient } from './supabase/server'
import type { Booking, Expense, Profile, Revenue } from './types'

// Les politiques RLS limitent chaque requête aux données du chauffeur connecté.

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').maybeSingle()
  return data
}

export async function getRevenues(from?: string, to?: string, kind?: Revenue['kind']): Promise<Revenue[]> {
  const supabase = await createClient()
  let q = supabase.from('revenues').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
  if (from) q = q.gte('date', from)
  if (to) q = q.lte('date', to)
  if (kind) q = q.eq('kind', kind)
  const { data, error } = await q.limit(1000)
  if (error) throw error
  return data ?? []
}

export async function getExpenses(from?: string, to?: string): Promise<Expense[]> {
  const supabase = await createClient()
  let q = supabase.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
  if (from) q = q.gte('date', from)
  if (to) q = q.lte('date', to)
  const { data, error } = await q.limit(1000)
  if (error) throw error
  return data ?? []
}

/** Réservations à venir (dès aujourd'hui) ou passées, triées dans l'ordre utile. */
export async function getBookings(when: 'avenir' | 'passees', today: string): Promise<Booking[]> {
  const supabase = await createClient()
  const upcoming = when === 'avenir'
  let q = supabase.from('bookings').select('*')
  q = upcoming
    ? q.gte('date', today).in('status', ['a_confirmer', 'confirmee'])
    : q.or(`date.lt.${today},status.in.(effectuee,annulee)`)
  const { data, error } = await q
    .order('date', { ascending: upcoming })
    .order('time', { ascending: upcoming })
    .limit(200)
  if (error) throw error
  return data ?? []
}
