import Link from 'next/link'
import { Suspense } from 'react'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/logo'
import { BottomNav, BottomNavView, SideNav, SideNavView } from '@/components/nav'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../(auth)/actions'

async function UserBadge() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = String(data?.claims?.email ?? '')
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
      <span className="truncate text-xs text-muted" title={email}>{email}</span>
      <form action={logout}>
        <button className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Se déconnecter" title="Se déconnecter">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  )
}

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="lg:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-3"><Logo className="text-sm" /></Link>
        <Suspense fallback={<SideNavView />}>
          <SideNav />
        </Suspense>
        <Suspense fallback={<div className="h-10 border-t border-border" />}>
          <UserBadge />
        </Suspense>
      </aside>
      <header className="flex items-center justify-between px-5 pt-5 lg:hidden">
        <Logo className="text-sm" />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 pt-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      <Suspense fallback={<BottomNavView />}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
