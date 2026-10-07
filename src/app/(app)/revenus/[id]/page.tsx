import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHeader, Skeleton } from '@/components/page-header'
import { RevenueForm } from '@/components/revenue-form'
import { createClient } from '@/lib/supabase/server'
import { todayIso } from '@/lib/period'
import { updateRevenue } from '../actions'

export const metadata = { title: 'Modifier un revenu' }

export default function EditRevenuePage({ params }: PageProps<'/revenus/[id]'>) {
  return (
    <>
      <PageHeader title="Modifier le revenu" action={<Link href="/revenus" className="btn-ghost">Annuler</Link>} />
      <Suspense fallback={<Skeleton className="h-72" />}>
        <Edit params={params} />
      </Suspense>
    </>
  )
}

async function Edit({ params }: { params: PageProps<'/revenus/[id]'>['params'] }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('revenues').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  return (
    <section className="card p-6">
      <RevenueForm action={updateRevenue.bind(null, id)} initial={data} defaultShare={0} today={todayIso()} submitLabel="Enregistrer" />
    </section>
  )
}
