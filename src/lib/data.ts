import 'server-only'
import { createClient } from './supabase/server'
import type { Expense, Profile, Revenue } from './types'

// Les politiques RLS limitent chaque requête aux données du chauffeur connecté.

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').maybeSingle()
  return data
}

export async function getRevenues(from?: string, to?: string): Promise<Revenue[]> {
  const supabase = await createClient()
  let q = supabase.from('revenues').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
  if (from) q = q.gte('date', from)
  if (to) q = q.lte('date', to)
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
