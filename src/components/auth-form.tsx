'use client'

import { useActionState } from 'react'
import type { AuthState } from '@/app/(auth)/actions'

type Field = { name: string; label: string; type: string; autoComplete: string; placeholder?: string }

export function AuthForm({
  action, fields, submit, next,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>
  fields: Field[]
  submit: string
  next?: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  if (state?.message) {
    return <p className="rounded-xl bg-surface-2 p-4 text-sm">{state.message}</p>
  }

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="label">{f.label}</label>
          <input id={f.name} className="input" required {...f} />
        </div>
      ))}
      {state?.error && <p role="alert" className="text-sm text-negative">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending ? 'Un instant…' : submit}
      </button>
    </form>
  )
}
