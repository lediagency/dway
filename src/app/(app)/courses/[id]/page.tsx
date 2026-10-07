import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CourseForm } from '@/components/course-form'
import { PageHeader, Skeleton } from '@/components/page-header'
import { createClient } from '@/lib/supabase/server'
import { todayIso } from '@/lib/period'
import { updateCourse } from '../actions'

export const metadata = { title: 'Modifier une course' }

export default function EditCoursePage({ params }: PageProps<'/courses/[id]'>) {
  return (
    <>
      <PageHeader title="Modifier la course" action={<Link href="/courses" className="btn-ghost">Annuler</Link>} />
      <Suspense fallback={<Skeleton className="h-80" />}>
        <Edit params={params} />
      </Suspense>
    </>
  )
}

async function Edit({ params }: { params: PageProps<'/courses/[id]'>['params'] }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('revenues').select('*').eq('id', id).eq('kind', 'course').maybeSingle()
  if (!data) notFound()
  return (
    <section className="card p-6">
      <CourseForm action={updateCourse.bind(null, id)} initial={data} defaultShare={0} today={todayIso()} submitLabel="Enregistrer" />
    </section>
  )
}
