'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, CheckCheck, Copy, Pencil, Trash2, X } from 'lucide-react'

type Props = {
  id: string
  recap: string
  canConfirm: boolean
  open: boolean
  onConfirm: () => Promise<void>
  onComplete: () => Promise<void>
  onCancel: () => Promise<void>
  onDelete: () => Promise<void>
}

export function BookingActions({ id, recap, canConfirm, open, onConfirm, onComplete, onCancel, onDelete }: Props) {
  const [pending, start] = useTransition()
  const [copied, setCopied] = useState(false)
  const icon = 'rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-40'

  async function copy() {
    try {
      await navigator.clipboard.writeText(recap)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Presse-papiers indisponible (navigateur ancien) : rien à faire.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {open && canConfirm && (
        <button disabled={pending} onClick={() => start(onConfirm)} className="btn-ghost px-3 py-1.5 text-xs">
          <Check className="size-3.5" />Confirmer
        </button>
      )}
      {open && (
        <button disabled={pending} onClick={() => start(onComplete)} className="btn-primary px-3 py-1.5 text-xs" title="Enregistre la course dans tes revenus">
          <CheckCheck className="size-3.5" />Effectuée
        </button>
      )}
      <button onClick={copy} className={icon} aria-label="Copier le récap" title="Copier le récap (WhatsApp)">
        {copied ? <Check className="size-4 text-positive" /> : <Copy className="size-4" />}
      </button>
      <Link href={`/reservations/${id}`} className={icon} aria-label="Modifier"><Pencil className="size-4" /></Link>
      {open && (
        <button disabled={pending} onClick={() => confirm('Annuler cette réservation ?') && start(onCancel)} className={icon} aria-label="Annuler la réservation" title="Annuler">
          <X className="size-4" />
        </button>
      )}
      <button disabled={pending} onClick={() => confirm('Supprimer cette réservation ?') && start(onDelete)} className={`${icon} hover:text-negative`} aria-label="Supprimer">
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
