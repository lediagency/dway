import { LogOut } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'

export function UserBadgeView({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-xs font-semibold uppercase text-accent">
        {email.charAt(0) || '·'}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted" title={email}>{email}</span>
      <form action={logout}>
        <button className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Se déconnecter" title="Se déconnecter">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  )
}
