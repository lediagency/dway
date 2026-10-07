'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BOOKING_STATUS, PAYMENT_METHODS } from '@/lib/constants'
import { bookingNumber } from '@/lib/booking'
import { isoDate, parseAmount, parsePct, text, time, type FormState } from '@/lib/form'
import { createClient } from '@/lib/supabase/server'
import type { BookingStatus } from '@/lib/types'

function read(formData: FormData) {
  const payment = String(formData.get('payment_method'))
  const status = String(formData.get('status') ?? 'confirmee')
  const values = {
    client_name: text(formData.get('client_name')),
    client_phone: text(formData.get('client_phone')),
    date: isoDate(formData.get('date')),
    time: time(formData.get('time')),
    pickup: text(formData.get('pickup')),
    dropoff: text(formData.get('dropoff')),
    passengers: Math.round(Number(formData.get('passengers') || 1)),
    vehicle: text(formData.get('vehicle')),
    price: parseAmount(formData.get('price')),
    payment_method: payment,
    flight_number: text(formData.get('flight_number'))?.toUpperCase() ?? null,
    employer_share_pct: parsePct(formData.get('employer_share_pct')),
    status,
    notes: text(formData.get('notes')),
  }
  if (!values.client_name) return { error: 'Indique le nom du client.' }
  if (!values.date || !values.time) return { error: 'Date ou heure invalide.' }
  if (!values.pickup || !values.dropoff) return { error: 'Indique le départ et la destination.' }
  if (!(values.passengers >= 1 && values.passengers <= 60)) return { error: 'Nombre de passagers invalide.' }
  if (!values.price) return { error: 'Indique le prix.' }
  if (!(payment in PAYMENT_METHODS) || !(status in BOOKING_STATUS)) return { error: 'Paiement ou statut invalide.' }
  if (values.employer_share_pct === null) return { error: 'La part employeur doit être entre 0 et 100 %.' }
  return { values }
}

function refresh() {
  revalidatePath('/reservations')
  revalidatePath('/courses')
  revalidatePath('/revenus')
  revalidatePath('/dashboard')
}

export async function createBooking(_: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('bookings').insert(values)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  return { ok: Date.now() }
}

export async function updateBooking(id: string, _: FormState, formData: FormData): Promise<FormState> {
  const { values, error } = read(formData)
  if (!values) return { error }
  const supabase = await createClient()
  const { error: dbError } = await supabase.from('bookings').update(values).eq('id', id)
  if (dbError) return { error: 'Enregistrement impossible. Réessaie.' }
  refresh()
  redirect('/reservations')
}

export async function setBookingStatus(id: string, status: Exclude<BookingStatus, 'effectuee'>) {
  const supabase = await createClient()
  await supabase.from('bookings').update({ status }).eq('id', id)
  refresh()
}

/** Marque la réservation comme effectuée et l'enregistre comme course (une seule fois). */
export async function completeBooking(id: string) {
  const supabase = await createClient()
  const { data: b } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle()
  if (!b) return

  const { data: existing } = await supabase.from('revenues').select('id').eq('booking_id', id).maybeSingle()
  if (!existing) {
    const { error } = await supabase.from('revenues').insert({
      kind: 'course',
      booking_id: b.id,
      date: b.date,
      start_time: b.time,
      source: 'prive',
      label: `Réservation ${bookingNumber(b.number)} · ${b.client_name}`,
      pickup: b.pickup,
      dropoff: b.dropoff,
      rides_count: 1,
      gross_amount: b.price,
      platform_fees: 0,
      tips: 0,
      payment_method: b.payment_method,
      employer_share_pct: b.employer_share_pct,
      client_id: b.client_id,
    })
    if (error) return
  }
  await supabase.from('bookings').update({ status: 'effectuee' }).eq('id', id)
  refresh()
}

export async function deleteBooking(id: string) {
  const supabase = await createClient()
  await supabase.from('bookings').delete().eq('id', id)
  refresh()
}
