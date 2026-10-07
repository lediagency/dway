import { AuthForm } from '@/components/auth-form'
import { updatePassword } from '../actions'

export const metadata = { title: 'Nouveau mot de passe' }

const fields = [{ name: 'password', label: 'Nouveau mot de passe (8 caractères minimum)', type: 'password', autoComplete: 'new-password' }]

export default function NewPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Choisis ton nouveau mot de passe DWAY.</p>
      <AuthForm action={updatePassword} fields={fields} submit="Enregistrer et me connecter" />
    </>
  )
}
