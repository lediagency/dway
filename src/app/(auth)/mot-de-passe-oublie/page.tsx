import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
import { forgotPassword } from '../actions'

export const metadata = { title: 'Mot de passe oublié' }

const fields = [{ name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', placeholder: 'toi@exemple.be' }]

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Indique ton e-mail : tu recevras un lien pour en choisir un nouveau.</p>
      <AuthForm action={forgotPassword} fields={fields} submit="Recevoir le lien" />
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-accent hover:text-accent-2">Retour à la connexion</Link>
      </p>
    </>
  )
}
