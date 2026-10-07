'use client'

import { useState } from 'react'
import { money, money0 } from '@/lib/format'

export type Bucket = { key: string; label: string; revenue: number; expense: number }

/** Barres groupées : ma part des revenus vs mes dépenses, par jour ou par mois. */
export function FlowChart({ buckets }: { buckets: Bucket[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...buckets.flatMap((b) => [b.revenue, b.expense]))
  const ticks = [max, max / 2, 0]
  const showEvery = Math.ceil(buckets.length / 8)
  const h = hover === null ? null : buckets[hover]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-chart-rev" />Revenus (ta part)</span>
          <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-chart-exp" />Dépenses (ta part)</span>
        </div>
        <p className="h-4 text-xs text-muted" aria-live="polite">
          {h && <><span className="font-medium text-fg">{h.label}</span> · {money(h.revenue)} · −{money(h.expense)} · bénéfice <span className="font-medium text-fg">{money(h.revenue - h.expense)}</span></>}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex h-48 flex-col justify-between pb-0 text-right text-[11px] text-muted">
          {ticks.map((t, i) => <span key={i} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{money0(t)}</span>)}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48">
            {ticks.map((_, i) => (
              <div key={i} className="absolute inset-x-0 border-t border-border/70" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
            ))}
          </div>
          <div className="relative flex h-48 items-end" onMouseLeave={() => setHover(null)}>
            {buckets.map((b, i) => (
              <button
                key={b.key}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => setHover(i)}
                aria-label={`${b.label} : revenus ${money(b.revenue)}, dépenses ${money(b.expense)}`}
                className={`flex h-full flex-1 items-end justify-center gap-[2px] rounded-md px-[2px] outline-none transition ${hover === i ? 'bg-surface-2' : ''}`}
              >
                <span className="w-full max-w-3 rounded-t-[4px] bg-chart-rev" style={{ height: `${(b.revenue / max) * 100}%` }} />
                <span className="w-full max-w-3 rounded-t-[4px] bg-chart-exp" style={{ height: `${(b.expense / max) * 100}%` }} />
              </button>
            ))}
          </div>
          <div className="mt-2 flex text-[11px] text-muted">
            {buckets.map((b, i) => (
              <span key={b.key} className="flex-1 text-center">{i % showEvery === 0 ? b.label : ''}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
