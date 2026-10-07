export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-[0.18em] ${className}`}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect width="24" height="24" rx="7" className="fill-fg" />
        <path d="M7 6.5h4.2a5.5 5.5 0 0 1 0 11H7z" className="fill-none stroke-bg" strokeWidth="2.2" />
        <circle cx="17.5" cy="17" r="1.6" className="fill-accent" />
      </svg>
      DWAY
    </span>
  )
}
