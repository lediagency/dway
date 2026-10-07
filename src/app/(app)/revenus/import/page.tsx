import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { PageHeader, Skeleton } from '@/components/page-header'
import { UberImport } from '@/components/uber-import'
import { getProfile } from '@/lib/data'
import { importUber } from '../actions'

export const metadata = { title: 'Importer depuis Uber' }

async function Form() {
  const profile = await getProfile()
  return <UberImport action={importUber} defaultShare={Number(profile?.default_employer_share ?? 0)} />
}

export default function ImportPage() {
  return (
    <>
      <Link href="/revenus" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" />Revenus
      </Link>
      <PageHeader title="Importer depuis Uber" subtitle="Copie ton historique de courses Uber, colle-le ici : DWAY ajoute chaque course." />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Form />
      </Suspense>
    </>
  )
}
