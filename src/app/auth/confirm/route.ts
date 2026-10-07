import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Lien de confirmation e-mail : gère le flux PKCE (?code=) et le flux token_hash.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const supabase = await createClient()

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error('Lien invalide') }

  // Réinitialisation du mot de passe : l'action a posé la page de destination dans un cookie.
  const next = request.cookies.get('dway_next')?.value
  const target = error ? '/login?erreur=lien' : type === 'recovery' || next === '/nouveau-mot-de-passe' ? '/nouveau-mot-de-passe' : '/dashboard'
  const response = NextResponse.redirect(new URL(target, origin))
  if (next) response.cookies.delete('dway_next')
  return response
}
