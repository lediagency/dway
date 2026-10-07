'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string } | undefined

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  })
  if (error) {
    return { error: error.code === 'email_not_confirmed'
      ? 'Confirme d’abord ton e-mail grâce au lien reçu.'
      : 'E-mail ou mot de passe incorrect.' }
  }
  redirect(safeNext(formData.get('next')))
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' }

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get('email') ?? '').trim(),
    password,
    options: {
      data: { full_name: String(formData.get('full_name') ?? '').trim() },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })
  if (error) return { error: error.message }
  // Confirmation e-mail désactivée dans Supabase : session ouverte directement.
  if (data.session) redirect('/dashboard')
  return { message: 'Compte créé. Clique sur le lien reçu par e-mail pour l’activer.' }
}

export async function forgotPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Indique ton e-mail.' }
  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
  // Après le clic dans l'e-mail, /auth/confirm enverra vers la page « nouveau mot de passe ».
  ;(await cookies()).set('dway_next', '/nouveau-mot-de-passe', { maxAge: 60 * 60, httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm` })
  // Même réponse que l'e-mail existe ou non.
  return { message: 'Si un compte existe avec cet e-mail, tu vas recevoir un lien pour choisir un nouveau mot de passe.' }
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { error: 'Le mot de passe doit faire au moins 8 caractères.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Lien expiré. Redemande un e-mail de réinitialisation.' }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
