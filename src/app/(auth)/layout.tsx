import Link from 'next/link'
import { Logo } from '@/components/logo'
import { GoalRing } from '@/components/goal-ring'

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau de marque, visible sur grand écran */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-accent/10 blur-[120px]" />
        <Link href="/" className="relative"><Logo className="text-sm" /></Link>
        <div className="relative">
          <GoalRing value={0.72} size={112} label="72 %" />
          <p className="mt-8 max-w-sm text-3xl font-semibold leading-tight tracking-tight">
            Ton bénéfice réel, <span className="text-gold">pas seulement ton CA.</span>
          </p>
          <p className="mt-3 max-w-sm text-muted">Revenus, dépenses, part employeur et objectif : ton activité de chauffeur en un coup d’œil.</p>
        </div>
        <p className="relative text-xs text-muted">Le cockpit du chauffeur professionnel</p>
      </aside>

      <main className="flex flex-col items-center justify-center px-5 py-10">
        <Link href="/" className="mb-10 lg:hidden"><Logo /></Link>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}
