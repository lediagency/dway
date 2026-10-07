import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ArrowRight, Pencil } from 'lucide-react'
import { CourseForm } from '@/components/course-form'
import { DeleteButton } from '@/components/delete-button'
import { PageHeader, Skeleton } from '@/components/page-header'
import { PeriodTabs } from '@/components/period-tabs'
import { hhmm } from '@/lib/booking'
import { PAYMENT_METHODS, SOURCES } from '@/lib/constants'
import { getProfile, getRevenues } from '@/lib/data'
import { computeTotals, splitRevenue } from '@/lib/finance'
import { money, shortDate } from '@/lib/format'
import { parsePeriod, periodRange, todayIso } from '@/lib/period'
import { createCourse, deleteCourse } from './actions'

export const metadata = { title: 'Courses' }

export default function CoursesPage({ searchParams }: PageProps<'/courses'>) {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /><Skeleton className="h-64" /></div>}>
      <Courses searchParams={searchParams} />
    </Suspense>
  )
}

async function Courses({ searchParams }: { searchParams: PageProps<'/courses'>['searchParams'] }) {
  await connection() // la période dépend de la date du jour
  const period = parsePeriod((await searchParams).p)
  const { from, to } = periodRange(period)
  const [profile, courses] = await Promise.all([getProfile(), getRevenues(from, to, 'course')])
  const t = computeTotals(courses, [])
  const km = courses.reduce((s, c) => s + Number(c.distance_km ?? 0), 0)
  const grossWithKm = courses.filter((c) => c.distance_km).reduce((s, c) => s + Number(c.gross_amount), 0)

  return (
    <>
      <PageHeader
        title="Courses"
        subtitle={`${courses.length} course${courses.length > 1 ? 's' : ''} · ${money(t.gross)} · ${money(t.myRevenue)} pour toi${km > 0 ? ` · ${money(grossWithKm / km)}/km` : ''}`}
        action={<PeriodTabs current={period} basePath="/courses" />}
      />

      <section className="card mb-6 p-6">
        <h2 className="mb-1 font-medium">Nouvelle course</h2>
        <p className="mb-5 text-sm text-muted">Pour une course détaillée. Tes relevés de plateforme hebdomadaires vont dans Revenus.</p>
        <CourseForm action={createCourse} defaultShare={Number(profile?.default_employer_share ?? 0)} today={todayIso()} />
      </section>

      <section className="card overflow-hidden">
        {courses.length === 0 ? (
          <p className="p-6 text-sm text-muted">Aucune course détaillée sur cette période.</p>
        ) : (
          <ul className="divide-y divide-border">
            {courses.map((c) => {
              const s = splitRevenue(c)
              return (
                <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 shrink-0 text-sm">
                    <p className="text-muted">{shortDate(c.date)}</p>
                    {c.start_time && <p className="text-xs text-muted/80">{hhmm(c.start_time)}</p>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                      <span className="truncate">{c.pickup || '—'}</span>
                      <ArrowRight className="size-3.5 shrink-0 text-muted" />
                      <span className="truncate">{c.dropoff || '—'}</span>
                    </p>
                    <p className="truncate text-xs text-muted">
                      {SOURCES[c.source]}{c.label && ` · ${c.label}`} · {PAYMENT_METHODS[c.payment_method]} · {money(s.gross)}
                      {c.distance_km ? ` · ${c.distance_km} km` : ''}
                      {s.tips > 0 && ` · pourboire ${money(s.tips)}`}
                    </p>
                  </div>
                  <span className="text-right text-sm font-semibold">{money(s.mine)}</span>
                  <div className="flex shrink-0">
                    <Link href={`/courses/${c.id}`} className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg" aria-label="Modifier">
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton action={deleteCourse.bind(null, c.id)} label="cette course" />
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
