import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-10"><Logo /></Link>
      <div className="card w-full max-w-sm p-6 sm:p-8">{children}</div>
    </main>
  )
}
