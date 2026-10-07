import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ExpenseForm } from '@/components/expense-form'
import { PageHeader, Skeleton } from '@/components/page-header'
import { createClient } from '@/lib/supabase/server'
import { todayIso } from '@/lib/period'
import { updateExpense } from '../actions'

export const metadata = { title: 'Modifier une dépense' }

export default function EditExpensePage({ params }: PageProps<'/depenses/[id]'>) {
  return (
    <>
      <PageHeader title="Modifier la dépense" action={<Link href="/depenses" className="btn-ghost">Annuler</Link>} />
      <Suspense fallback={<Skeleton className="h-72" />}>
        <Edit params={params} />
      </Suspense>
    </>
  )
}

async function Edit({ params }: { params: PageProps<'/depenses/[id]'>['params'] }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('expenses').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  return (
    <section className="card p-6">
      <ExpenseForm action={updateExpense.bind(null, id)} initial={data} today={todayIso()} employed submitLabel="Enregistrer" />
    </section>
  )
}
