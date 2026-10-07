import { Suspense } from 'react'
import { AppShell } from '@/components/app-shell'
import { UserBadgeView } from '@/components/user-badge'
import { createClient } from '@/lib/supabase/server'

async function UserBadge() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = String(data?.claims?.email ?? '')
  return <UserBadgeView email={email} />
}

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <AppShell badge={<Suspense fallback={<div className="h-12 border-t border-border" />}><UserBadge /></Suspense>}>
      {children}
    </AppShell>
  )
}
