import { getIssue, requireUser } from '@/lib/dal'
import IssueForm from '@/app/components/IssueForm'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const currentUser = await requireUser()
  const { id } = await params

  const issue = await getIssue(parseInt(id))

  if (!issue) {
    notFound()
  }

  if (issue.userId !== currentUser.id) {
    redirect(`/issues/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link
        href={`/issues/${id}`}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeftIcon size={16} className="mr-1" />
        Back to Issue
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Issue</h1>

      <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6">
        {/* Only pass the fields the form needs: props are sent to the browser */}
        <IssueForm
          issue={{
            id: issue.id,
            title: issue.title,
            description: issue.description,
            status: issue.status,
            priority: issue.priority,
          }}
          isEditing
        />
      </div>
    </div>
  )
}
