import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { BottomNav, BottomNavView, SideNav, SideNavView } from '@/components/nav'

export function AppShell({ badge, children }: { badge: ReactNode; children: ReactNode }) {
  return (
    <div className="lg:flex">
      <aside className="glass sticky top-3 m-3 hidden h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col gap-8 rounded-3xl px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-3"><Logo className="text-sm" /></Link>
        <Suspense fallback={<SideNavView />}>
          <SideNav />
        </Suspense>
        {badge}
      </aside>
      <header className="glass sticky top-3 z-20 mx-3 mt-3 flex items-center justify-between rounded-2xl px-4 py-3 lg:hidden">
        <Link href="/dashboard"><Logo className="text-sm" /></Link>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-32 pt-6 lg:px-8 lg:pb-12 lg:pt-10">{children}</main>
      <Suspense fallback={<BottomNavView />}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
