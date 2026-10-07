'use client'

import { useTransition } from 'react'

export function ReimburseButton({ action }: { action: () => Promise<void> }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => action())}
      className="rounded-full border border-accent/40 px-2.5 py-0.5 text-[11px] font-medium text-accent transition hover:bg-accent/10 disabled:opacity-50"
      title="Marquer comme remboursé"
    >
      {pending ? '…' : 'À rembourser'}
    </button>
  )
}
