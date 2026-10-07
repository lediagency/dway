import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
import { signup } from '../actions'

export const metadata = { title: 'Créer un compte' }

const fields = [
  { name: 'full_name', label: 'Nom complet', type: 'text', autoComplete: 'name', placeholder: 'Prénom Nom' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', placeholder: 'toi@exemple.be' },
  { name: 'password', label: 'Mot de passe', type: 'password', autoComplete: 'new-password', placeholder: '8 caractères minimum' },
]

export default function SignupPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Crée ton cockpit</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Gratuit, sans carte bancaire.</p>
      <AuthForm action={signup} fields={fields} submit="Créer mon compte" />
      <p className="mt-6 text-center text-sm text-muted">
        Déjà inscrit ? <Link href="/login" className="font-medium text-fg">Se connecter</Link>
      </p>
    </>
  )
}
