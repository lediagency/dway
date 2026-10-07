import Link from 'next/link'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { login } from '../actions'

export const metadata = { title: 'Connexion' }

const fields = [
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', placeholder: 'toi@exemple.be' },
  { name: 'password', label: 'Mot de passe', type: 'password', autoComplete: 'current-password' },
]

async function LoginForm({ searchParams }: { searchParams: PageProps<'/login'>['searchParams'] }) {
  const { next } = await searchParams
  return <AuthForm action={login} fields={fields} submit="Se connecter" next={typeof next === 'string' ? next : undefined} />
}

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Bon retour</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Connecte-toi à ton cockpit.</p>
      <Suspense fallback={<AuthForm action={login} fields={fields} submit="Se connecter" />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
      <p className="mt-4 text-right text-sm">
        <Link href="/mot-de-passe-oublie" className="text-muted hover:text-fg">Mot de passe oublié ?</Link>
      </p>
      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ? <Link href="/signup" className="font-medium text-accent hover:text-accent-2">Créer un compte</Link>
      </p>
    </>
  )
}
