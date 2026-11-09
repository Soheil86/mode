import IssueForm from './IssueForm'
import { getUsers, requireUser } from '@/lib/dal'

const NewIssue = async () => {
  await requireUser()
  const users = await getUsers()

  return <IssueForm users={users} />
}

export default NewIssue
