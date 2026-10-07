import Link from 'next/link'
import { Logo } from '@/components/logo'

const points = [
  ['Bénéfice réel', 'Ce qui te reste vraiment, après commissions, part employeur et dépenses.'],
  ['Toutes tes plateformes', 'Uber, Bolt, Heetch, Blacklane, clients privés : un seul tableau de bord.'],
  ['Pensé pour la route', 'Une saisie en 10 secondes depuis ton téléphone, entre deux courses.'],
]

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6">
      <header className="flex items-center justify-between">
        <Logo />
        <Link href="/login" className="text-sm text-muted hover:text-fg">Connexion</Link>
      </header>

      <section className="flex flex-1 flex-col justify-center py-20">
        <p className="mb-4 text-sm font-medium tracking-wide text-accent">Le cockpit du chauffeur professionnel</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Sache enfin ce que tu gagnes vraiment.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          DWAY centralise tes revenus, tes dépenses et tes courses, et calcule ton bénéfice réel en temps réel.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary px-6 py-3 text-[15px]">Créer mon compte</Link>
          <Link href="/login" className="btn-ghost px-6 py-3 text-[15px]">J’ai déjà un compte</Link>
        </div>
      </section>

      <section className="grid gap-4 pb-10 sm:grid-cols-3">
        {points.map(([title, text]) => (
          <div key={title} className="card p-5">
            <h2 className="font-medium">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
