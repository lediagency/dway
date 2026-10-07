import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { Pencil } from 'lucide-react'
import { DeleteButton } from '@/components/delete-button'
import { PageHeader, Skeleton } from '@/components/page-header'
import { PeriodTabs } from '@/components/period-tabs'
import { RevenueForm } from '@/components/revenue-form'
import { PAYMENT_METHODS, SOURCES } from '@/lib/constants'
import { getProfile, getRevenues } from '@/lib/data'
import { computeTotals, splitRevenue } from '@/lib/finance'
import { money, shortDate } from '@/lib/format'
import { parsePeriod, periodRange, todayIso } from '@/lib/period'
import { createRevenue, deleteRevenue } from './actions'

export const metadata = { title: 'Revenus' }

export default function RevenusPage({ searchParams }: PageProps<'/revenus'>) {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-72" /><Skeleton className="h-64" /></div>}>
      <Revenus searchParams={searchParams} />
    </Suspense>
  )
}

async function Revenus({ searchParams }: { searchParams: PageProps<'/revenus'>['searchParams'] }) {
  await connection() // la période dépend de la date du jour
  const period = parsePeriod((await searchParams).p)
  const { from, to } = periodRange(period)
  const [profile, revenues] = await Promise.all([getProfile(), getRevenues(from, to)])
  const t = computeTotals(revenues, [])

  return (
    <>
      <PageHeader
        title="Revenus"
        subtitle={`${money(t.gross)} brut · ${money(t.myRevenue)} pour toi · ${t.rides} courses`}
        action={<PeriodTabs current={period} basePath="/revenus" />}
      />

      <section className="card mb-6 p-6">
        <h2 className="mb-5 font-medium">Nouveau revenu</h2>
        <RevenueForm action={createRevenue} defaultShare={Number(profile?.default_employer_share ?? 0)} today={todayIso()} />
      </section>

      <section className="card overflow-hidden">
        {revenues.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aucun revenu sur cette période.</p>
        ) : (
          <ul className="divide-y divide-border">
            {revenues.map((r) => {
              const s = splitRevenue(r)
              return (
                <li key={r.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="w-14 shrink-0 text-sm text-muted">{shortDate(r.date)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{SOURCES[r.source]}{r.label && <span className="font-normal text-muted"> · {r.label}</span>}</p>
                    <p className="truncate text-xs text-muted">
                      {r.rides_count} course{r.rides_count > 1 ? 's' : ''} · {PAYMENT_METHODS[r.payment_method]} · brut {money(s.gross)}
                      {s.fees > 0 && ` · comm. ${money(s.fees)}`}
                      {s.employer > 0 && ` · employeur ${money(s.employer)}`}
                      {s.tips > 0 && ` · pourboire ${money(s.tips)}`}
                    </p>
                  </div>
                  <span className="text-right text-sm font-semibold">{money(s.mine)}</span>
                  <div className="flex shrink-0">
                    <Link href={r.kind === 'course' ? `/courses/${r.id}` : `/revenus/${r.id}`} className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg" aria-label="Modifier">
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton action={deleteRevenue.bind(null, r.id)} label="ce revenu" />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
