import { useId } from 'react'

/** Jauge circulaire (0 → 1), façon compteur de tableau de bord. */
export function GoalRing({ value, size = 120, label }: { value: number; size?: number; label?: string }) {
  const stroke = Math.max(5, size / 14)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  const id = useId()
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-2)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)}
        />
      </svg>
      {label && (
        <span className="absolute inset-0 grid place-items-center font-semibold tracking-tight" style={{ fontSize: size / 5 }}>
          {label}
        </span>
      )}
    </div>
  )
}
