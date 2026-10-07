'use client'

import { useActionState } from 'react'
import { BOOKING_STATUS, PAYMENT_METHODS } from '@/lib/constants'
import type { FormState } from '@/lib/form'
import type { Booking } from '@/lib/types'
import { Field } from './revenue-form'

type Props = Omit<Parameters<typeof BookingFields>[0], 'state' | 'pending'> & {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

export function BookingForm({ action, ...props }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  // La clé change après chaque ajout réussi : les champs repartent à zéro.
  return (
    <form action={formAction} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <BookingFields key={state?.ok ?? 0} state={state} pending={pending} {...props} />
    </form>
  )
}

function BookingFields({
  state, pending, initial, defaultShare, today, submitLabel = 'Créer la réservation',
}: {
  state: FormState
  pending: boolean
  initial?: Booking
  defaultShare: number
  today: string
  submitLabel?: string
}) {
  return (
    <>
      <Field label="Client" className="col-span-2">
        <input name="client_name" required defaultValue={initial?.client_name ?? ''} placeholder="Nom du client ou de la société" className="input" />
      </Field>
      <Field label="Téléphone" className="col-span-2">
        <input name="client_phone" type="tel" defaultValue={initial?.client_phone ?? ''} placeholder="+32 4xx xx xx xx" className="input" />
      </Field>

      <Field label="Date">
        <input name="date" type="date" required defaultValue={initial?.date ?? today} className="input" />
      </Field>
      <Field label="Heure">
        <input name="time" type="time" required defaultValue={initial?.time?.slice(0, 5) ?? ''} className="input" />
      </Field>
      <Field label="Passagers">
        <input name="passengers" type="number" min={1} max={60} defaultValue={initial?.passengers ?? 1} className="input" />
      </Field>
      <Field label="N° de vol">
        <input name="flight_number" defaultValue={initial?.flight_number ?? ''} placeholder="SN3204" className="input uppercase" />
      </Field>

      <Field label="Départ" className="col-span-2">
        <input name="pickup" required defaultValue={initial?.pickup ?? ''} placeholder="Adresse ou aéroport" className="input" />
      </Field>
      <Field label="Destination" className="col-span-2">
        <input name="dropoff" required defaultValue={initial?.dropoff ?? ''} placeholder="Adresse ou aéroport" className="input" />
      </Field>

      <Field label="Prix (€)">
        <input name="price" inputMode="decimal" required defaultValue={initial?.price ?? ''} placeholder="0,00" className="input" />
      </Field>
      <Field label="Paiement">
        <select name="payment_method" defaultValue={initial?.payment_method ?? 'cash'} className="input">
          {Object.entries(PAYMENT_METHODS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Véhicule">
        <input name="vehicle" defaultValue={initial?.vehicle ?? ''} placeholder="Classe V, Classe S…" className="input" />
      </Field>
      <Field label="Part employeur (%)">
        <input name="employer_share_pct" inputMode="decimal" defaultValue={initial?.employer_share_pct ?? defaultShare} className="input" />
      </Field>

      <Field label="Statut">
        <select name="status" defaultValue={initial?.status ?? 'confirmee'} className="input">
          {Object.entries(BOOKING_STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Notes" className="col-span-2 sm:col-span-3">
        <input name="notes" defaultValue={initial?.notes ?? ''} placeholder="Siège enfant, pancarte au nom du client…" className="input" />
      </Field>

      <div className="col-span-2 flex items-center gap-3 sm:col-span-4">
        <button disabled={pending} className="btn-primary">{pending ? 'Enregistrement…' : submitLabel}</button>
        {state?.error && <p role="alert" className="text-sm text-negative">{state.error}</p>}
      </div>
    </>
  )
}
