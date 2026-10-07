'use client'

import { useActionState, useState } from 'react'
import { PAYMENT_METHODS, SOURCES } from '@/lib/constants'
import { splitRevenue } from '@/lib/finance'
import { money } from '@/lib/format'
import type { FormState } from '@/lib/form'
import type { Revenue } from '@/lib/types'

const num = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.')) || 0

type Props = Omit<Parameters<typeof RevenueFields>[0], 'state' | 'pending'> & {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

export function RevenueForm({ action, ...props }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  // La clé change après chaque ajout réussi : les champs repartent à zéro.
  return (
    <form action={formAction} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <RevenueFields key={state?.ok ?? 0} state={state} pending={pending} {...props} />
    </form>
  )
}

function RevenueFields({
  state, pending, initial, defaultShare, today, submitLabel = 'Ajouter',
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
  const [share, setShare] = useState(String(initial?.employer_share_pct ?? defaultShare))


  const s = splitRevenue({ gross_amount: num(gross), platform_fees: num(fees), tips: num(tips), employer_share_pct: num(share) })

  return (
    <>
      <Field label="Date" className="col-span-1">
        <input name="date" type="date" required defaultValue={initial?.date ?? today} className="input" />
      </Field>
      <Field label="Source" className="col-span-1">
        <select name="source" defaultValue={initial?.source ?? 'uber'} className="input">
          {Object.entries(SOURCES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Libellé" className="col-span-2">
        <input name="label" defaultValue={initial?.label ?? ''} placeholder="Relevé semaine 41, Zaventem → Gare du Midi…" className="input" />
      </Field>

      <Field label="Montant brut (€)">
        <input name="gross_amount" inputMode="decimal" required value={gross} onChange={(e) => setGross(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Commissions (€)">
        <input name="platform_fees" inputMode="decimal" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Pourboires (€)">
        <input name="tips" inputMode="decimal" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Nb de courses">
        <input name="rides_count" type="number" min={0} defaultValue={initial?.rides_count ?? 1} className="input" />
      </Field>

      <Field label="Paiement">
        <select name="payment_method" defaultValue={initial?.payment_method ?? 'app'} className="input">
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
          {s.tips > 0 && <> · pourboires +{money(s.tips)}</>}
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

export function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}
