'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteButton({ action, label }: { action: () => Promise<void>; label: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm(`Supprimer ${label} ?`) && start(() => action())}
      className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-negative disabled:opacity-40"
      aria-label={`Supprimer ${label}`}
    >
      <Trash2 className="size-4" />
    </button>
  )
}
