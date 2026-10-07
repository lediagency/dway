import { useId } from 'react'

export function LogoMark({ className = 'size-7' }: { className?: string }) {
  // Identifiant unique : le logo apparaît plusieurs fois par page (dont des copies masquées).
  const id = useId()
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d08a" />
          <stop offset="1" stopColor="#c9973a" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill={`url(#${id})`} />
      <path d="M7 6.5h4.2a5.5 5.5 0 0 1 0 11H7z" fill="none" stroke="#120d03" strokeWidth="2.2" />
      <circle cx="17.6" cy="17" r="1.6" fill="#120d03" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-semibold tracking-[0.2em] ${className}`}>
      <LogoMark />
      DWAY
    </span>
  )
}
