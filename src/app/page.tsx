import Link from 'next/link'
import { ArrowRight, Gauge, Layers, Smartphone } from 'lucide-react'
import { Logo } from '@/components/logo'
import { GoalRing } from '@/components/goal-ring'

const platforms = ['Uber', 'Bolt', 'Heetch', 'Blacklane', 'Sixt Ride', 'Taxi Vert', 'Clients privés']

const points = [
  { icon: Gauge, title: 'Bénéfice réel', text: 'Ce qui te reste vraiment, après commissions, part employeur et dépenses.' },
  { icon: Layers, title: 'Toutes tes plateformes', text: 'Uber, Bolt, Heetch, Blacklane, clients privés : un seul tableau de bord.' },
  { icon: Smartphone, title: 'Pensé pour la route', text: 'Une saisie en 10 secondes depuis ton téléphone, entre deux courses.' },
]

const steps = [
  ['Ajoute tes revenus', 'Une course privée ou ton relevé Uber de la semaine, en quelques champs.'],
  ['Note tes dépenses', 'Carburant, péage, lavage : DWAY gère la part de ton employeur et les remboursements.'],
  ['Lis ton vrai chiffre', 'Bénéfice réel, objectif sur 4 semaines, moyenne par course : tout au même endroit.'],
]

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Halo doré derrière le hero */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col px-5">
        <header className="flex items-center justify-between py-6">
          <Logo className="text-sm" />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn px-3 text-muted hover:text-fg">Connexion</Link>
            <Link href="/signup" className="btn-primary hidden sm:inline-flex">Commencer</Link>
          </nav>
        </header>

        <section className="grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-xs font-medium text-accent-2">
              <span className="size-1.5 rounded-full bg-accent" />
              Le cockpit du chauffeur professionnel
            </p>
            <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Sache enfin ce que tu gagnes <span className="text-gold">vraiment.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              DWAY centralise tes revenus, tes dépenses et tes courses, et calcule ton bénéfice réel en temps réel.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3.5 text-[15px]">
                Créer mon compte <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="btn-ghost px-6 py-3.5 text-[15px]">J’ai déjà un compte</Link>
            </div>
            <p className="mt-4 text-xs text-muted">Gratuit pour commencer · sans carte bancaire</p>
          </div>

          <CockpitPreview />
        </section>

        <section className="border-y border-border py-6">
          <p className="eyebrow text-center">Tous tes revenus au même endroit</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-fg/70">
            {platforms.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>

        <section className="grid gap-4 py-20 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <h2 className="mt-5 font-medium">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </section>

        <section className="pb-20">
          <p className="eyebrow">Comment ça marche</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Trois gestes, et ton vrai chiffre s’affiche.</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map(([title, text], i) => (
              <li key={title} className="border-t border-border pt-5">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <h3 className="mt-2 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="card-glow mb-16 flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Prends le volant de tes chiffres.</h2>
            <p className="mt-2 text-muted">Ton compte est prêt en une minute.</p>
          </div>
          <Link href="/signup" className="btn-primary px-6 py-3.5 text-[15px]">
            Créer mon compte <ArrowRight className="size-4" />
          </Link>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-8 text-xs text-muted">
          <Logo className="text-xs" />
          <p>© 2026 DWAY · Bruxelles</p>
        </footer>
      </div>
    </div>
  )
}

/** Aperçu statique du dashboard, avec des chiffres d’exemple. */
function CockpitPreview() {
  const rows: [string, string][] = [
    ['CA brut', '4 820,00 €'],
    ['Commissions plateformes', '−1 012,20 €'],
    ['Part employeur', '−1 903,90 €'],
    ['Pourboires', '+186,00 €'],
    ['Dépenses à ta charge', '−412,50 €'],
  ]
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-accent/5 blur-2xl" />
      <div className="card-glow relative p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Bénéfice réel · 4 semaines</p>
            <p className="mt-3 whitespace-nowrap text-4xl font-semibold tracking-tight sm:text-5xl">1 677,40 €</p>
            <p className="mt-2 text-sm text-muted">Objectif : 5 500 € de CA brut</p>
          </div>
          <GoalRing value={0.88} size={76} label="88 %" />
        </div>
        <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[11px] text-muted/70">Chiffres d’exemple</p>
      </div>
    </div>
  )
}
