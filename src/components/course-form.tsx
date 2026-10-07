'use client'

import { useActionState, useState } from 'react'
import { PAYMENT_METHODS, SOURCES } from '@/lib/constants'
import { splitRevenue } from '@/lib/finance'
import { money } from '@/lib/format'
import type { FormState } from '@/lib/form'
import type { Revenue } from '@/lib/types'
import { Field } from './revenue-form'

const num = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.')) || 0

type Props = Omit<Parameters<typeof CourseFields>[0], 'state' | 'pending'> & {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

export function CourseForm({ action, ...props }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  // La clé change après chaque ajout réussi : les champs repartent à zéro.
  return (
    <form action={formAction} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <CourseFields key={state?.ok ?? 0} state={state} pending={pending} {...props} />
    </form>
  )
}

function CourseFields({
  state, pending, initial, defaultShare, today, submitLabel = 'Ajouter la course',
}: {
  state: FormState
  pending: boolean
  initial?: Revenue
  defaultShare: number
  today: string
  submitLabel?: string
}) {
  const [gross, setGross] = useState(initial ? String(initial.gross_amount) : '')
  const [fees, setFees] = useState(initial ? String(initial.platform_fees) : '')
  const [tips, setTips] = useState(initial ? String(initial.tips) : '')
  const [km, setKm] = useState(initial?.distance_km ? String(initial.distance_km) : '')
  const [share, setShare] = useState(String(initial?.employer_share_pct ?? defaultShare))

  const s = splitRevenue({ gross_amount: num(gross), platform_fees: num(fees), tips: num(tips), employer_share_pct: num(share) })
  const perKm = num(km) > 0 ? s.gross / num(km) : null

  return (
    <>
      <Field label="Date">
        <input name="date" type="date" required defaultValue={initial?.date ?? today} className="input" />
      </Field>
      <Field label="Heure">
        <input name="start_time" type="time" defaultValue={initial?.start_time?.slice(0, 5) ?? ''} className="input" />
      </Field>
      <Field label="Source">
        <select name="source" defaultValue={initial?.source ?? 'prive'} className="input">
          {Object.entries(SOURCES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Client / libellé">
        <input name="label" defaultValue={initial?.label ?? ''} placeholder="M. Dupont" className="input" />
      </Field>

      <Field label="Départ" className="col-span-2">
        <input name="pickup" defaultValue={initial?.pickup ?? ''} placeholder="Brussels Airport (BRU)" className="input" />
      </Field>
      <Field label="Destination" className="col-span-2">
        <input name="dropoff" defaultValue={initial?.dropoff ?? ''} placeholder="Hôtel Amigo, Grand-Place" className="input" />
      </Field>

      <Field label="Prix (€)">
        <input name="gross_amount" inputMode="decimal" required value={gross} onChange={(e) => setGross(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Commission (€)">
        <input name="platform_fees" inputMode="decimal" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Pourboire (€)">
        <input name="tips" inputMode="decimal" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Distance (km)">
        <input name="distance_km" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder="0" className="input" />
      </Field>

      <Field label="Paiement">
        <select name="payment_method" defaultValue={initial?.payment_method ?? 'cash'} className="input">
          {Object.entries(PAYMENT_METHODS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Part employeur (%)">
        <input name="employer_share_pct" inputMode="decimal" value={share} onChange={(e) => setShare(e.target.value)} className="input" />
      </Field>
      <Field label="Notes" className="col-span-2">
        <input name="notes" defaultValue={initial?.notes ?? ''} className="input" />
      </Field>

      <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm sm:col-span-4">
        <span className="text-muted">
          Net {money(s.net)}
          {s.employer > 0 && <> · employeur −{money(s.employer)}</>}
          {s.tips > 0 && <> · pourboire +{money(s.tips)}</>}
          {perKm !== null && <> · {money(perKm)}/km</>}
        </span>
        <span>Ta part : <strong className="font-semibold">{money(s.mine)}</strong></span>
      </div>

      <div className="col-span-2 flex items-center gap-3 sm:col-span-4">
        <button disabled={pending} className="btn-primary">{pending ? 'Enregistrement…' : submitLabel}</button>
        {state?.error && <p role="alert" className="text-sm text-negative">{state.error}</p>}
      </div>
    </>
  )
}
