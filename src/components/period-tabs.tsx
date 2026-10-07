import Link from 'next/link'
import { PERIODS, type PeriodKey } from '@/lib/period'

export function PeriodTabs({ current, basePath }: { current: PeriodKey; basePath: string }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto whitespace-nowrap glass rounded-2xl p-1 text-sm">
      {(Object.keys(PERIODS) as PeriodKey[]).map((key) => (
        <Link
          key={key}
          href={`${basePath}?p=${key}`}
          scroll={false}
          className={`rounded-xl px-3 py-1.5 transition ${key === current ? 'bg-white/10 text-fg shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12)]' : 'text-muted hover:text-fg'}`}
        >
          {PERIODS[key]}
        </Link>
      ))}
    </div>
  )
}
