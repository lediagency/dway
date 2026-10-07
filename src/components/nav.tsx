'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Car, CalendarClock, FileText, LayoutDashboard, Receipt, Route, Settings, Users, Wallet,
} from 'lucide-react'

const main = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/revenus', label: 'Revenus', icon: Wallet },
  { href: '/depenses', label: 'Dépenses', icon: Receipt },
] as const

const soon = [
  { label: 'Courses', icon: Route },
  { label: 'Réservations', icon: CalendarClock },
  { label: 'Clients', icon: Users },
  { label: 'Véhicules', icon: Car },
  { label: 'Statistiques', icon: BarChart3 },
  { label: 'Factures', icon: FileText },
] as const

export function SideNav() {
  return <SideNavView pathname={usePathname()} />
}

// Rendu sans hook : sert de repli pendant que le chemin courant se résout.
export function SideNavView({ pathname = '' }: { pathname?: string }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 text-sm">
      {main.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              active ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:bg-surface-2/60 hover:text-fg'
            }`}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
            {label}
          </Link>
        )
      })}
      <p className="mb-1 mt-6 px-3 text-[11px] font-medium uppercase tracking-wider text-muted/70">Bientôt</p>
      {soon.map(({ label, icon: Icon }) => (
        <span key={label} className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-muted/60">
          <Icon className="size-[18px]" strokeWidth={1.75} />
          {label}
        </span>
      ))}
      <Link
        href="/parametres"
        className={`mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
          pathname.startsWith('/parametres') ? 'bg-surface-2 font-medium' : 'text-muted hover:text-fg'
        }`}
      >
        <Settings className="size-[18px]" strokeWidth={1.75} />
        Paramètres
      </Link>
    </nav>
  )
}

export function BottomNav() {
  return <BottomNavView pathname={usePathname()} />
}

export function BottomNavView({ pathname = '' }: { pathname?: string }) {
  const items = [...main, { href: '/parametres', label: 'Réglages', icon: Settings }]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? 'text-fg' : 'text-muted'}`}>
              <Icon className="size-5" strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
