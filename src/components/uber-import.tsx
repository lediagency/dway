'use client'

import Link from 'next/link'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { ImportState } from '@/app/(app)/revenus/actions'
import { money } from '@/lib/format'
import { parseUberTrips } from '@/lib/import-uber'

const steps = [
  <>Ouvre <b>drivers.uber.com</b>, puis la page <b>Historique des courses</b>.</>,
  <>Clique n’importe où dans la page, puis fais <b>Ctrl + A</b> (tout sélectionner) et <b>Ctrl + C</b> (copier).</>,
  <>Reviens ici, clique dans la zone ci-dessous et fais <b>Ctrl + V</b> (coller).</>,
  <>Vérifie le résumé, puis clique sur <b>Importer</b>. Pour les courses plus anciennes, clique sur <b>Suivant</b> chez Uber et recommence.</>,
]

type Props = {
  action: (state: ImportState, formData: FormData) => Promise<ImportState>
  defaultShare: number
}

export function UberImport(props: Props) {
  // Nouvelle clé = formulaire vierge pour importer une autre page de l’historique.
  const [round, setRound] = useState(0)
  return <ImportForm key={round} {...props} onReset={() => setRound((r) => r + 1)} />
}

function ImportForm({ action, defaultShare, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const [text, setText] = useState('')

  // Arrivée depuis le bouton « Synchroniser DWAY » : l'historique est dans l'ancre (#uber=…),
  // qui ne quitte jamais le navigateur.
  useEffect(() => {
    const data = new URLSearchParams(window.location.hash.slice(1)).get('uber')
    if (!data) return
    history.replaceState(null, '', window.location.pathname)
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique de l'ancre au montage
      setText(decodeURIComponent(escape(atob(data))))
    } catch {}
  }, [])
  const trips = useMemo(() => parseUberTrips(text), [text])
  const days = useMemo(() => {
    const map = new Map<string, { rides: number; total: number }>()
    for (const t of trips) {
      const d = map.get(t.date) ?? { rides: 0, total: 0 }
      d.rides += t.cancelled ? 0 : 1
      d.total += t.amount
      map.set(t.date, d)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [trips])
  const total = trips.reduce((s, t) => s + t.amount, 0)

  if (state?.added !== undefined) {
    return (
      <div className="card-glow flex flex-col items-start gap-4 p-6">
        <CheckCircle2 className="size-8" strokeWidth={1.5} />
        <div>
          <p className="text-lg font-semibold">
            {state.added} course{state.added > 1 ? 's' : ''} importée{state.added > 1 ? 's' : ''}
          </p>
          {!!state.skipped && <p className="text-sm text-muted">{state.skipped} déjà présente{state.skipped > 1 ? 's' : ''}, ignorée{state.skipped > 1 ? 's' : ''}.</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/revenus" className="btn-primary">Voir mes revenus</Link>
          <button type="button" onClick={onReset} className="btn-ghost">Importer une autre page</button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <form action={formAction} className="card space-y-5 p-6">
        <ol className="space-y-2.5 text-sm text-muted">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-fg">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Colle ici ton historique Uber (Ctrl + V)"
          className="input font-mono text-xs"
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-44">
            <label htmlFor="employer_share_pct" className="label">Part employeur (%)</label>
            <input id="employer_share_pct" name="employer_share_pct" defaultValue={defaultShare} inputMode="decimal" className="input" />
          </div>
          <button type="submit" disabled={pending || trips.length === 0} className="btn-primary px-6 py-3">
            {pending ? 'Import…' : trips.length ? `Importer ${trips.length} course${trips.length > 1 ? 's' : ''}` : 'Importer'}
          </button>
        </div>
        {state?.error && <p role="alert" className="text-sm text-negative">{state.error}</p>}
      </form>

      <aside className="card p-6">
        <p className="eyebrow">Aperçu</p>
        {trips.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{text ? 'Aucune course reconnue pour l’instant.' : 'Le résumé s’affiche dès que tu colles ton historique.'}</p>
        ) : (
          <>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{money(total)}</p>
            <p className="text-sm text-muted">{trips.length} ligne{trips.length > 1 ? 's' : ''} reconnue{trips.length > 1 ? 's' : ''}</p>
            <ul className="mt-5 divide-y divide-border border-t border-border text-sm">
              {days.map(([date, d]) => (
                <li key={date} className="flex justify-between py-2.5">
                  <span className="text-muted">{new Date(date + 'T00:00:00').toLocaleDateString('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' })} · {d.rides} course{d.rides > 1 ? 's' : ''}</span>
                  <span className="font-medium">{money(d.total)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  )
}

/** Script du favori : copie la page Uber ouverte et l’envoie à l’import DWAY dans un nouvel onglet. */
function bookmarklet(origin: string) {
  const code = `(()=>{if(!/uber\\.com$/.test(location.hostname)){alert('Ouvre d\\'abord ta page Historique des courses sur drivers.uber.com');return}`
    + `window.open('${origin}/revenus/import#uber='+encodeURIComponent(btoa(unescape(encodeURIComponent(document.body.innerText)))),'_blank')})()`
  return `javascript:${encodeURIComponent(code)}`
}

export function SyncButton() {
  const ref = useRef<HTMLAnchorElement>(null)
  // React bloque les liens « javascript: » dans le rendu : on pose l’adresse après coup.
  useEffect(() => { ref.current?.setAttribute('href', bookmarklet(window.location.origin)) }, [])
  return (
    <a ref={ref} onClick={(e) => e.preventDefault()} draggable className="btn-primary cursor-grab px-5 py-3 active:cursor-grabbing">
      Synchroniser DWAY
    </a>
  )
}

const syncSteps = [
  <>Affiche ta barre de favoris dans Chrome : <b>Ctrl + Maj + B</b>.</>,
  <>Fais glisser le bouton <b>Synchroniser DWAY</b> ci-dessous jusque dans cette barre (une seule fois).</>,
  <>Ouvre <b>drivers.uber.com</b>, page <b>Historique des courses</b>, puis clique sur le favori <b>Synchroniser DWAY</b>.</>,
  <>DWAY s’ouvre avec tes courses déjà remplies : vérifie le résumé et clique sur <b>Importer</b>.</>,
]

/** Carte d’installation du favori de synchronisation en 1 clic. */
export function SyncCard() {
  return (
    <section className="card-glow mb-4 grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="eyebrow">Synchronisation en 1 clic</p>
        <ol className="mt-4 space-y-2.5 text-sm text-muted">
          {syncSteps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-fg">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted/80">Rien ne passe par un intermédiaire : ton mot de passe Uber reste chez Uber, et les données vont directement de ton navigateur à DWAY.</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SyncButton />
        <span className="text-[11px] text-muted">Glisse-moi dans tes favoris</span>
      </div>
    </section>
  )
}
