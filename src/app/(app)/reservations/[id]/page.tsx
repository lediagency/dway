import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BookingForm } from '@/components/booking-form'
import { PageHeader, Skeleton } from '@/components/page-header'
import { createClient } from '@/lib/supabase/server'
import { todayIso } from '@/lib/period'
import { updateBooking } from '../actions'

export const metadata = { title: 'Modifier une réservation' }

export default function EditBookingPage({ params }: PageProps<'/reservations/[id]'>) {
  return (
    <>
      <PageHeader title="Modifier la réservation" action={<Link href="/reservations" className="btn-ghost">Annuler</Link>} />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Edit params={params} />
      </Suspense>
    </>
  )
}

async function Edit({ params }: { params: PageProps<'/reservations/[id]'>['params'] }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  return (
    <section className="card p-6">
      <BookingForm action={updateBooking.bind(null, id)} initial={data} defaultShare={0} today={todayIso()} submitLabel="Enregistrer" />
    </section>
  )
}
