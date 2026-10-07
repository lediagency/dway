import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ArrowRight, Phone, Plane, Users } from 'lucide-react'
import { BookingActions } from '@/components/booking-actions'
import { BookingForm } from '@/components/booking-form'
import { PageHeader, Skeleton } from '@/components/page-header'
import { bookingNumber, bookingRecap, dayLabel, hhmm } from '@/lib/booking'
import { BOOKING_STATUS, PAYMENT_METHODS } from '@/lib/constants'
import { getBookings, getProfile } from '@/lib/data'
import { money } from '@/lib/format'
import { todayIso } from '@/lib/period'
import type { Booking, BookingStatus } from '@/lib/types'
import { completeBooking, createBooking, deleteBooking, setBookingStatus } from './actions'

export const metadata = { title: 'Réservations' }

export default function ReservationsPage({ searchParams }: PageProps<'/reservations'>) {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /><Skeleton className="h-64" /></div>}>
      <Reservations searchParams={searchParams} />
    </Suspense>
  )
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  a_confirmer: 'border-accent/40 text-accent',
  confirmee: 'border-border text-fg',
  effectuee: 'border-positive/30 text-positive',
  annulee: 'border-border text-muted line-through',
}

async function Reservations({ searchParams }: { searchParams: PageProps<'/reservations'>['searchParams'] }) {
  await connection() // « à venir » dépend de la date du jour
  const view = (await searchParams).vue === 'passees' ? 'passees' : 'avenir'
  const today = todayIso()
  const [profile, bookings] = await Promise.all([getProfile(), getBookings(view, today)])

  const days = new Map<string, Booking[]>()
  for (const b of bookings) days.set(b.date, [...(days.get(b.date) ?? []), b])
  const total = bookings.filter((b) => b.status !== 'annulee').reduce((s, b) => s + Number(b.price), 0)

  return (
    <>
      <PageHeader
        title="Réservations"
        subtitle={view === 'avenir'
          ? `${bookings.length} à venir · ${money(total)} prévus`
          : `${bookings.length} passée${bookings.length > 1 ? 's' : ''}`}
        action={
          <div className="inline-flex rounded-xl border border-border bg-surface p-1 text-sm">
            {(['avenir', 'passees'] as const).map((v) => (
              <Link key={v} href={`/reservations?vue=${v}`} scroll={false}
                className={`rounded-lg px-3 py-1.5 transition ${v === view ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}>
                {v === 'avenir' ? 'À venir' : 'Passées'}
              </Link>
            ))}
          </div>
        }
      />

      {view === 'avenir' && (
        <details className="card group mb-6 p-6" open={bookings.length === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
            Nouvelle réservation
            <span className="text-sm font-normal text-muted group-open:hidden">Ajouter</span>
          </summary>
          <div className="mt-5">
            <BookingForm action={createBooking} defaultShare={Number(profile?.default_employer_share ?? 0)} today={today} />
          </div>
        </details>
      )}

      {bookings.length === 0 ? (
        <p className="card p-6 text-sm text-muted">{view === 'avenir' ? 'Aucune réservation à venir.' : 'Aucune réservation passée.'}</p>
      ) : (
        <div className="space-y-8">
          {[...days.entries()].map(([date, list]) => (
            <section key={date}>
              <h2 className="mb-3 text-sm font-medium first-letter:uppercase text-muted">{dayLabel(date, today)}</h2>
              <ul className="space-y-3">
                {list.map((b) => {
                  const open = b.status === 'a_confirmer' || b.status === 'confirmee'
                  return (
                    <li key={b.id} className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-start ${b.status === 'annulee' ? 'opacity-60' : ''}`}>
                      <div className="flex items-baseline gap-3 sm:w-24 sm:flex-col sm:gap-1">
                        <span className="text-2xl font-semibold tracking-tight">{hhmm(b.time)}</span>
                        <span className="text-xs text-muted">{bookingNumber(b.number)}</span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{b.client_name}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[b.status]}`}>{BOOKING_STATUS[b.status]}</span>
                        </div>
                        <p className="flex min-w-0 items-center gap-1.5 text-sm">
                          <span className="truncate">{b.pickup}</span>
                          <ArrowRight className="size-3.5 shrink-0 text-muted" />
                          <span className="truncate">{b.dropoff}</span>
                        </p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{b.passengers}</span>
                          {b.vehicle && <span>{b.vehicle}</span>}
                          {b.flight_number && <span className="inline-flex items-center gap-1"><Plane className="size-3.5" />{b.flight_number}</span>}
                          {b.client_phone && (
                            <a href={`tel:${b.client_phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 hover:text-fg"><Phone className="size-3.5" />{b.client_phone}</a>
                          )}
                          {b.notes && <span className="truncate">{b.notes}</span>}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <p className="text-right">
                          <span className="text-lg font-semibold">{money(Number(b.price))}</span>
                          <span className="ml-2 text-xs text-muted">{PAYMENT_METHODS[b.payment_method]}</span>
                        </p>
                        <BookingActions
                          id={b.id}
                          recap={bookingRecap(b)}
                          open={open}
                          canConfirm={b.status === 'a_confirmer'}
                          onConfirm={setBookingStatus.bind(null, b.id, 'confirmee')}
                          onComplete={completeBooking.bind(null, b.id)}
                          onCancel={setBookingStatus.bind(null, b.id, 'annulee')}
                          onDelete={deleteBooking.bind(null, b.id)}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
