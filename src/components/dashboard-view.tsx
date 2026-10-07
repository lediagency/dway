import Link from 'next/link'
import { Hash, Plus, Receipt, Undo2, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FlowChart, type Bucket } from '@/components/flow-chart'
import { GoalRing } from '@/components/goal-ring'
import { PageHeader } from '@/components/page-header'
import { PeriodTabs } from '@/components/period-tabs'
import { CATEGORIES, SOURCES } from '@/lib/constants'
import { computeTotals, splitExpense, splitRevenue } from '@/lib/finance'
import { money, money0 } from '@/lib/format'
import { daysBetween, type PeriodKey } from '@/lib/period'
import type { Expense, Profile, Revenue } from '@/lib/types'

export function DashboardView({
  period, from, to, goalFrom, profile, allRevenues, allExpenses,
}: {
  period: PeriodKey
  from: string
  to: string
  goalFrom: string
  profile: Pick<Profile, 'full_name' | 'goal_4w'> | null
  allRevenues: Revenue[]
  allExpenses: Expense[]
}) {
  const revenues = allRevenues.filter((r) => r.date >= from)
  const expenses = allExpenses.filter((e) => e.date >= from)
  const t = computeTotals(revenues, expenses)
  const goalGross = computeTotals(allRevenues.filter((r) => r.date >= goalFrom), []).gross
  const goal = Number(profile?.goal_4w ?? 5500)
  const firstName = profile?.full_name?.split(' ')[0]

  const empty = allRevenues.length === 0 && allExpenses.length === 0

  return (
    <>
      <PageHeader
        title={firstName ? `Bonjour ${firstName}` : 'Dashboard'}
        subtitle={`Du ${fmt(from)} au ${fmt(to)}`}
        action={<PeriodTabs current={period} basePath="/dashboard" />}
      />

      {empty && (
        <div className="card-glow mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-medium">Ton cockpit est prêt.</p>
            <p className="text-sm text-muted">Ajoute un premier revenu (une course ou ton relevé Uber de la semaine) pour voir ton bénéfice réel.</p>
          </div>
          <Link href="/revenus" className="btn-primary"><Plus className="size-4" />Ajouter un revenu</Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bénéfice réel */}
        <section className="card-glow p-6 sm:p-8 lg:col-span-2">
          <p className="eyebrow text-accent">Bénéfice réel</p>
          <p className={`mt-3 whitespace-nowrap text-5xl font-semibold tracking-tight sm:text-7xl ${t.profit < 0 ? 'text-negative' : ''}`}>
            {money(t.profit)}
          </p>
          <p className="mt-2 text-sm text-muted">Ce qui te reste vraiment, hors impôts et cotisations sociales.</p>

          <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
            <Row label="CA brut" value={t.gross} />
            <Row label="Commissions plateformes" value={-t.fees} />
            {t.employer > 0 && <Row label="Part employeur" value={-t.employer} />}
            {t.tips > 0 && <Row label="Pourboires (100 % pour toi)" value={t.tips} />}
            <Row label="Dépenses à ta charge" value={-t.myExpenses} />
            <Row label="Bénéfice réel" value={t.profit} strong />
          </dl>
        </section>

        {/* Objectif 4 semaines */}
        <section className="card flex flex-col p-6">
          <p className="eyebrow">Objectif 4 semaines</p>
          <div className="mt-4 flex items-center gap-5" role="progressbar" aria-valuenow={Math.round((goalGross / goal) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <GoalRing value={goalGross / goal} size={104} label={`${Math.round((goalGross / goal) * 100)} %`} />
            <div>
              <p className="text-3xl font-semibold tracking-tight">{money0(goalGross)}</p>
              <p className="text-sm text-muted">de CA brut sur {money0(goal)}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Moyenne par semaine</dt><dd className="font-medium">{money0(goalGross / 4)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Objectif par semaine</dt><dd className="font-medium">{money0(goal / 4)}</dd></div>
          </dl>
          <p className="mt-auto pt-5 text-sm text-muted">
            {goalGross >= goal
              ? 'Objectif atteint sur les 28 derniers jours.'
              : `Il manque ${money0(goal - goalGross)}, soit ${money0((goal - goalGross) / 7)} par jour sur une semaine.`}
          </p>
          <p className="mt-1 text-xs text-muted">28 jours glissants · <Link href="/parametres" className="underline-offset-2 hover:underline">modifier</Link></p>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Wallet} label="CA net" value={money(t.net)} hint="après commissions" />
        <Kpi icon={Hash} label="Courses" value={String(t.rides)} hint={t.rides ? `${money(t.gross / t.rides)} en moyenne` : '—'} />
        <Kpi icon={Receipt} label="Dépenses" value={money(t.myExpenses)} hint={t.expenses !== t.myExpenses ? `sur ${money(t.expenses)} payées` : 'à ta charge'} />
        <Kpi icon={Undo2} label="À te faire rembourser" value={money(t.toReimburse)} hint="part employeur des frais" />
      </div>

      <section className="card mt-4 p-6">
        <h2 className="eyebrow mb-5">Revenus et dépenses</h2>
        <FlowChart buckets={buildBuckets(period, from, to, revenues, expenses)} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Breakdown
          title="CA brut par plateforme"
          rows={group(revenues, (r) => SOURCES[r.source], (r) => splitRevenue(r).gross)}
          emptyText="Aucun revenu sur la période."
        />
        <Breakdown
          title="Dépenses par catégorie (ta part)"
          rows={group(expenses, (e) => CATEGORIES[e.category], (e) => splitExpense(e).mine)}
          emptyText="Aucune dépense sur la période."
        />
      </div>
    </>
  )
}

const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' })

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-2.5 ${strong ? 'font-semibold text-accent-2' : ''}`}>
      <dt className={strong ? '' : 'text-muted'}>{label}</dt>
      <dd>{money(value)}</dd>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 text-xs font-medium text-muted"><Icon className="size-3.5 text-accent" strokeWidth={2} />{label}</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
      <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>
    </div>
  )
}

function group<T>(items: T[], key: (i: T) => string, value: (i: T) => number) {
  const map = new Map<string, number>()
  for (const i of items) map.set(key(i), (map.get(key(i)) ?? 0) + value(i))
  return [...map.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
}

function Breakdown({ title, rows, emptyText }: { title: string; rows: [string, number][]; emptyText: string }) {
  const max = Math.max(1, ...rows.map(([, v]) => v))
  const total = rows.reduce((s, [, v]) => s + v, 0)
  return (
    <section className="card p-6">
      <h2 className="eyebrow mb-5">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {rows.map(([label, v]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between">
                <span>{label}</span>
                <span className="text-muted"><span className="font-medium text-fg">{money(v)}</span> · {Math.round((v / total) * 100)} %</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${(v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function buildBuckets(
  period: PeriodKey, from: string, to: string,
  revenues: Parameters<typeof computeTotals>[0], expenses: Parameters<typeof computeTotals>[1],
): Bucket[] {
  const byMonth = period === 'annee'
  const keyOf = (d: string) => (byMonth ? d.slice(0, 7) : d)
  const keys = byMonth
    ? [...new Set(daysBetween(from, to).map(keyOf))]
    : daysBetween(from, to)
  const map = new Map<string, Bucket>(keys.map((k) => [k, {
    key: k,
    label: byMonth
      ? new Date(k + '-01T00:00:00').toLocaleDateString('fr-BE', { month: 'short' })
      : new Date(k + 'T00:00:00').toLocaleDateString('fr-BE', period === 'semaine' ? { weekday: 'short' } : { day: 'numeric', month: 'numeric' }),
    revenue: 0,
    expense: 0,
  }]))
  for (const r of revenues) { const b = map.get(keyOf(r.date)); if (b) b.revenue += splitRevenue(r).mine }
  for (const e of expenses) { const b = map.get(keyOf(e.date)); if (b) b.expense += splitExpense(e).mine }
  return [...map.values()]
}
