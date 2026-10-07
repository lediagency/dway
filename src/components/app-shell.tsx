import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { Logo } from '@/components/logo'
import { BottomNav, BottomNavView, SideNav, SideNavView } from '@/components/nav'

export function AppShell({ badge, children }: { badge: ReactNode; children: ReactNode }) {
  return (
    <div className="lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-border bg-surface/60 px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-3"><Logo className="text-sm" /></Link>
        <Suspense fallback={<SideNavView />}>
          <SideNav />
        </Suspense>
        {badge}
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/85 px-5 py-3.5 backdrop-blur-xl lg:hidden">
        <Link href="/dashboard"><Logo className="text-sm" /></Link>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-32 pt-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      <Suspense fallback={<BottomNavView />}>
        <BottomNav />
      </Suspense>
    </div>
  )
}
