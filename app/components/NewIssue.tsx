import IssueForm from './IssueForm'
import { requireUser } from '@/lib/dal'

const NewIssue = async () => {
  await requireUser()

  return <IssueForm />
}

export default NewIssue
