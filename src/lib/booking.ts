import { PAYMENT_METHODS } from './constants'
import type { Booking } from './types'

export const bookingNumber = (n: number) => `#${String(n).padStart(3, '0')}`

export const hhmm = (time: string | null) => (time ? time.slice(0, 5) : '')

/** Récap au format habituel du chauffeur, prêt à coller dans WhatsApp. */
export function bookingRecap(b: Booking) {
  const date = new Date(b.date + 'T00:00:00').toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const lines = [
    `RÉSERVATION ${bookingNumber(b.number)}`,
    `Client : ${b.client_name}`,
    `Date : ${date}`,
    `Heure : ${hhmm(b.time)}`,
    `Départ : ${b.pickup}`,
    `Destination : ${b.dropoff}`,
    `Passagers : ${b.passengers}`,
    b.vehicle && `Véhicule : ${b.vehicle}`,
    `Prix : ${Number(b.price).toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' })}`,
    b.client_phone && `Téléphone : ${b.client_phone}`,
    `Paiement : ${PAYMENT_METHODS[b.payment_method]}`,
    b.flight_number && `Vol : ${b.flight_number}`,
    b.notes && `Notes : ${b.notes}`,
  ]
  return lines.filter(Boolean).join('\n')
}

export function dayLabel(date: string, today: string) {
  const d = new Date(date + 'T00:00:00')
  const t = new Date(today + 'T00:00:00')
  const diff = Math.round((d.getTime() - t.getTime()) / 86_400_000)
  if (diff === 0) return 'Aujourd’hui'
  if (diff === 1) return 'Demain'
  return d.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })
}
