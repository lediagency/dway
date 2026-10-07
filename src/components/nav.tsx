'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Car, CalendarClock, FileText, LayoutDashboard, Plus, Receipt, Route, Settings, Users, Wallet,
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
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              active ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:bg-surface-2/60 hover:text-fg'
            }`}
          >
            {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" />}
            <Icon className={`size-[18px] ${active ? 'text-accent' : ''}`} strokeWidth={1.75} />
            {label}
          </Link>
        )
      })}
      <p className="eyebrow mb-1 mt-6 px-3 text-muted/70">Bientôt</p>
      {soon.map(({ label, icon: Icon }) => (
        <span key={label} className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-muted/50">
          <Icon className="size-[18px]" strokeWidth={1.5} />
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
  const item = ({ href, label, icon: Icon }: (typeof items)[number]) => {
    const active = pathname.startsWith(href)
    return (
      <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? 'text-accent' : 'text-muted'}`}>
        <Icon className="size-5" strokeWidth={active ? 2 : 1.75} />
        {label}
      </Link>
    )
  }
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center">
        {items.slice(0, 2).map(item)}
        {/* Saisie rapide : le geste le plus fréquent, entre deux courses */}
        <Link href="/revenus#nouveau" aria-label="Ajouter un revenu" className="mx-auto -mt-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-b from-accent-2 to-accent text-accent-fg shadow-[0_10px_30px_-10px_var(--accent)]">
          <Plus className="size-6" strokeWidth={2.25} />
        </Link>
        {items.slice(2).map(item)}
      </div>
    </nav>
  )
}
