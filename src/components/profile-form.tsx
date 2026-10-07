'use client'

import { useActionState } from 'react'
import type { FormState } from '@/lib/form'
import type { Profile } from '@/lib/types'
import { Field } from './revenue-form'

export function ProfileForm({ action, profile }: { action: (s: FormState, f: FormData) => Promise<FormState>; profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(action, undefined)
  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Nom complet"><input name="full_name" defaultValue={profile?.full_name ?? ''} className="input" /></Field>
      <Field label="Téléphone"><input name="phone" type="tel" defaultValue={profile?.phone ?? ''} className="input" /></Field>
      <Field label="Société"><input name="company_name" defaultValue={profile?.company_name ?? ''} className="input" /></Field>
      <Field label="N° TVA / BCE"><input name="vat_number" defaultValue={profile?.vat_number ?? ''} placeholder="BE0123.456.789" className="input" /></Field>

      <div className="mt-4 border-t border-border pt-6 sm:col-span-2">
        <h2 className="font-medium">Calcul du bénéfice</h2>
        <p className="mt-1 text-sm text-muted">Si tu roules pour un employeur, indique la part de tes revenus nets qui lui revient. Mets 0 si tu es indépendant.</p>
      </div>
      <Field label="Objectif de CA brut sur 4 semaines (€)"><input name="goal_4w" inputMode="decimal" defaultValue={profile?.goal_4w ?? 5500} className="input" /></Field>
      <Field label="Part employeur par défaut (%)"><input name="default_employer_share" inputMode="decimal" defaultValue={profile?.default_employer_share ?? 0} className="input" /></Field>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-primary">{pending ? 'Enregistrement…' : 'Enregistrer'}</button>
        {state?.error && <p role="alert" className="text-sm text-negative">{state.error}</p>}
        {state?.ok && !pending && <p className="text-sm text-positive">Enregistré.</p>}
      </div>
    </form>
  )
}
