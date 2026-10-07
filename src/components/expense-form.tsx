'use client'

import { useActionState, useState } from 'react'
import { CATEGORIES, DEFAULT_EXPENSE_SHARE } from '@/lib/constants'
import { splitExpense } from '@/lib/finance'
import { money } from '@/lib/format'
import type { FormState } from '@/lib/form'
import type { Expense, ExpenseCategory } from '@/lib/types'
import { Field } from './revenue-form'

const num = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.')) || 0

type Props = Omit<Parameters<typeof ExpenseFields>[0], 'state' | 'pending'> & {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

export function ExpenseForm({ action, ...props }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  // La clé change après chaque ajout réussi : les champs repartent à zéro.
  return (
    <form action={formAction} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <ExpenseFields key={state?.ok ?? 0} state={state} pending={pending} {...props} />
    </form>
  )
}

function ExpenseFields({
  state, pending, initial, today, employed, submitLabel = 'Ajouter',
}: {
  state: FormState
  pending: boolean
  initial?: Expense
  today: string
  /** Le chauffeur travaille pour un employeur : on propose le partage des frais. */
  employed: boolean
  submitLabel?: string
}) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [share, setShare] = useState(String(initial?.employer_share_pct ?? (employed ? DEFAULT_EXPENSE_SHARE.carburant : 0)))


  const s = splitExpense({ amount: num(amount), employer_share_pct: num(share), reimbursed: false })

  return (
    <>
      <Field label="Date">
        <input name="date" type="date" required defaultValue={initial?.date ?? today} className="input" />
      </Field>
      <Field label="Catégorie">
        <select
          name="category"
          defaultValue={initial?.category ?? 'carburant'}
          onChange={(e) => employed && setShare(String(DEFAULT_EXPENSE_SHARE[e.target.value as ExpenseCategory] ?? 0))}
          className="input"
        >
          {Object.entries(CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field label="Libellé" className="col-span-2">
        <input name="label" defaultValue={initial?.label ?? ''} placeholder="Plein Total Ixelles, lavage Classe V…" className="input" />
      </Field>

      <Field label="Montant TTC (€)">
        <input name="amount" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="input" />
      </Field>
      <Field label="Part employeur (%)">
        <input name="employer_share_pct" inputMode="decimal" value={share} onChange={(e) => setShare(e.target.value)} className="input" />
      </Field>
      <Field label="Notes" className="col-span-2">
        <input name="notes" defaultValue={initial?.notes ?? ''} className="input" />
      </Field>

      <label className="col-span-2 flex items-center gap-2.5 text-sm sm:col-span-4">
        <input type="checkbox" name="reimbursed" defaultChecked={initial?.reimbursed ?? false} className="size-4 accent-[var(--fg)]" />
        La part employeur m’a déjà été remboursée
      </label>

      <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm sm:col-span-4">
        <span className="text-muted">{s.employer > 0 ? `Employeur : ${money(s.employer)}` : 'Entièrement à ta charge'}</span>
        <span>À ta charge : <strong className="font-semibold">{money(s.mine)}</strong></span>
      </div>

      <div className="col-span-2 flex items-center gap-3 sm:col-span-4">
        <button disabled={pending} className="btn-primary">{pending ? 'Enregistrement…' : submitLabel}</button>
        {state?.error && <p role="alert" className="text-sm text-negative">{state.error}</p>}
      </div>
    </>
  )
}
