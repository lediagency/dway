import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { Pencil } from 'lucide-react'
import { DeleteButton } from '@/components/delete-button'
import { ExpenseForm } from '@/components/expense-form'
import { PageHeader, Skeleton } from '@/components/page-header'
import { PeriodTabs } from '@/components/period-tabs'
import { ReimburseButton } from '@/components/reimburse-button'
import { CATEGORIES } from '@/lib/constants'
import { getExpenses, getProfile } from '@/lib/data'
import { computeTotals, splitExpense } from '@/lib/finance'
import { money, shortDate } from '@/lib/format'
import { parsePeriod, periodRange, todayIso } from '@/lib/period'
import { createExpense, deleteExpense, markReimbursed } from './actions'

export const metadata = { title: 'Dépenses' }

export default function DepensesPage({ searchParams }: PageProps<'/depenses'>) {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-72" /><Skeleton className="h-64" /></div>}>
      <Depenses searchParams={searchParams} />
    </Suspense>
  )
}

async function Depenses({ searchParams }: { searchParams: PageProps<'/depenses'>['searchParams'] }) {
  await connection() // la période dépend de la date du jour
  const period = parsePeriod((await searchParams).p)
  const { from, to } = periodRange(period)
  const [profile, expenses] = await Promise.all([getProfile(), getExpenses(from, to)])
  const t = computeTotals([], expenses)
  const employed = Number(profile?.default_employer_share ?? 0) > 0

  return (
    <>
      <PageHeader
        title="Dépenses"
        subtitle={`${money(t.myExpenses)} à ta charge · ${money(t.expenses)} payées${t.toReimburse > 0 ? ` · ${money(t.toReimburse)} à te faire rembourser` : ''}`}
        action={<PeriodTabs current={period} basePath="/depenses" />}
      />

      <section className="card mb-6 p-6">
        <h2 className="mb-5 font-medium">Nouvelle dépense</h2>
        <ExpenseForm action={createExpense} today={todayIso()} employed={employed} />
      </section>

      <section className="card overflow-hidden">
        {expenses.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aucune dépense sur cette période.</p>
        ) : (
          <ul className="divide-y divide-border">
            {expenses.map((e) => {
              const s = splitExpense(e)
              return (
                <li key={e.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="w-14 shrink-0 text-sm text-muted">{shortDate(e.date)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{CATEGORIES[e.category]}{e.label && <span className="font-normal text-muted"> · {e.label}</span>}</p>
                    <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>payé {money(s.amount)}{s.employer > 0 && ` · employeur ${money(s.employer)}`}</span>
                      {s.toReimburse > 0 && <ReimburseButton action={markReimbursed.bind(null, e.id)} />}
                      {s.employer > 0 && e.reimbursed && <span>· remboursé</span>}
                    </p>
                  </div>
                  <span className="text-right text-sm font-semibold">−{money(s.mine)}</span>
                  <div className="flex shrink-0">
                    <Link href={`/depenses/${e.id}`} className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg" aria-label="Modifier">
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton action={deleteExpense.bind(null, e.id)} label="cette dépense" />
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
