import { connection } from 'next/server'
import { Suspense } from 'react'
import { DashboardView } from '@/components/dashboard-view'
import { Skeleton } from '@/components/page-header'
import { getExpenses, getProfile, getRevenues } from '@/lib/data'
import { parsePeriod, periodRange } from '@/lib/period'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage({ searchParams }: PageProps<'/dashboard'>) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
    </div>
  )
}

async function Dashboard({ searchParams }: { searchParams: PageProps<'/dashboard'>['searchParams'] }) {
  await connection() // la période dépend de la date du jour
  const period = parsePeriod((await searchParams).p)
  const { from, to } = periodRange(period)
  const goalRange = periodRange('4semaines')
  const loadFrom = from < goalRange.from ? from : goalRange.from

  const [profile, allRevenues, allExpenses] = await Promise.all([
    getProfile(),
    getRevenues(loadFrom, to),
    getExpenses(loadFrom, to),
  ])

  return <DashboardView {...{ period, from, to, goalFrom: goalRange.from, profile, allRevenues, allExpenses }} />
}
