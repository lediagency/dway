import Link from 'next/link'
import { PERIODS, type PeriodKey } from '@/lib/period'

export function PeriodTabs({ current, basePath }: { current: PeriodKey; basePath: string }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto whitespace-nowrap rounded-xl border border-border bg-surface p-1 text-sm">
      {(Object.keys(PERIODS) as PeriodKey[]).map((key) => (
        <Link
          key={key}
          href={`${basePath}?p=${key}`}
          scroll={false}
          className={`rounded-lg px-3 py-1.5 transition ${key === current ? 'bg-surface-2 text-fg shadow-[inset_0_0_0_1px_var(--border)]' : 'text-muted hover:text-fg'}`}
        >
          {PERIODS[key]}
        </Link>
      ))}
    </div>
  )
}
