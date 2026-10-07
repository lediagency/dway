import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { parseUberTrips } from '@/lib/import-uber'
import { saveUberTrips } from '@/lib/save-uber'
import { createClient } from '@/lib/supabase/server'

/**
 * Reçoit l'historique des courses envoyé par l'extension DWAY Sync.
 * Le chauffeur est reconnu grâce à sa session DWAY ouverte dans le même navigateur.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && !origin.startsWith('chrome-extension://') && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Origine refusée.' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Connecte-toi à DWAY dans Chrome.', login: true }, { status: 401 })

  const body = await request.json().catch(() => null)
  const text = typeof body?.text === 'string' ? body.text.slice(0, 2_000_000) : ''
  const trips = parseUberTrips(text)
  if (trips.length === 0) return NextResponse.json({ added: 0, skipped: 0 })

  const { data: profile } = await supabase.from('profiles').select('default_employer_share').maybeSingle()
  const result = await saveUberTrips(supabase, trips, Number(profile?.default_employer_share ?? 0))
  if ('error' in result) return NextResponse.json(result, { status: 500 })
  if (result.added > 0) {
    revalidatePath('/revenus')
    revalidatePath('/dashboard')
  }
  return NextResponse.json(result)
}
