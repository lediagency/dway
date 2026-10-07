import { Suspense } from 'react'
import { PageHeader, Skeleton } from '@/components/page-header'
import { ProfileForm } from '@/components/profile-form'
import { getProfile } from '@/lib/data'
import { logout } from '../../(auth)/actions'
import { saveProfile } from './actions'

export const metadata = { title: 'Paramètres' }

export default function ParametresPage() {
  return (
    <>
      <PageHeader title="Paramètres" subtitle="Ton profil et les règles de calcul de ton bénéfice." />
      <section className="card max-w-3xl p-6">
        <Suspense fallback={<Skeleton className="h-80" />}>
          <Profile />
        </Suspense>
      </section>
      <form action={logout} className="mt-6">
        <button className="btn-ghost">Se déconnecter</button>
      </form>
    </>
  )
}

async function Profile() {
  const profile = await getProfile()
  return <ProfileForm action={saveProfile} profile={profile} />
}
