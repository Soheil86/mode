'use client'

import { useActionState } from 'react'
import { unstable_rethrow, useRouter } from 'next/navigation'
import { Issue } from '@/db/schema'
import { ISSUE_STATUS, ISSUE_PRIORITY } from '@/lib/constants'
import { UserOption } from '@/lib/types'
import { displayName } from '@/lib/utils'
import Button from './ui/Button'
import {
  FieldError,
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
  fieldErrorProps,
} from './ui/Form'
import { createIssue, ActionResponse, updateIssue } from '@/app/actions/issues'

interface IssueFormProps {
  issue?: Pick<
    Issue,
    'id' | 'title' | 'description' | 'status' | 'priority' | 'assigneeId'
  >
  users: UserOption[]
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

// Next keeps visited pages alive while hidden, so a form would come back with
// its old text and messages. A new key gives each fresh visit a clean form.
export default function IssueForm(props: IssueFormProps) {
  const { bfcacheId } = useRouter()

  return <IssueFormContent key={bfcacheId} {...props} />
}

function IssueFormContent({ issue, users, isEditing = false }: IssueFormProps) {
  const router = useRouter()

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    // Extract data from form
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as
        | 'backlog'
        | 'todo'
        | 'in_progress'
        | 'done',
      priority: formData.get('priority') as 'low' | 'medium' | 'high',
      assigneeId: (formData.get('assigneeId') as string) || null,
    }

    try {
      // Call the appropriate action based on whether we're editing or creating
      // On success these redirect to the dashboard, so a returned result is a failure
      return isEditing
        ? await updateIssue(Number(issue!.id), data)
        : await createIssue(data)
    } catch (err) {
      // Let the redirect from the action through
      unstable_rethrow(err)

      return {
        success: false,
        message: (err as Error).message || 'An error occurred',
        errors: undefined,
      }
    }
  }, initialState)

  const errors = state?.errors
  const assigneeOptions = [
    { label: 'Unassigned', value: '' },
    ...users.map((user) => ({
      label: displayName(user.email),
      value: user.id,
    })),
  ]

  return (
    <Form action={formAction}>
      {state?.message && (
        <FormError className="mb-4">{state.message}</FormError>
      )}

      <FormGroup>
        <FormLabel htmlFor="title">Title</FormLabel>
        <FormInput
          id="title"
          name="title"
          placeholder="Issue title"
          defaultValue={issue?.title || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          {...fieldErrorProps('title', errors)}
        />
        <FieldError name="title" errors={errors} />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description">Description</FormLabel>
        <FormTextarea
          id="description"
          name="description"
          placeholder="Describe the issue..."
          rows={4}
          defaultValue={issue?.description || ''}
          disabled={isPending}
          {...fieldErrorProps('description', errors)}
        />
        <FieldError name="description" errors={errors} />
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormGroup>
          <FormLabel htmlFor="status">Status</FormLabel>
          <FormSelect
            id="status"
            name="status"
            defaultValue={issue?.status || 'backlog'}
            options={Object.values(ISSUE_STATUS)}
            disabled={isPending}
            required
            {...fieldErrorProps('status', errors)}
          />
          <FieldError name="status" errors={errors} />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="priority">Priority</FormLabel>
          <FormSelect
            id="priority"
            name="priority"
            defaultValue={issue?.priority || 'medium'}
            options={Object.values(ISSUE_PRIORITY)}
            disabled={isPending}
            required
            {...fieldErrorProps('priority', errors)}
          />
          <FieldError name="priority" errors={errors} />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="assigneeId">Assignee</FormLabel>
          <FormSelect
            id="assigneeId"
            name="assigneeId"
            defaultValue={issue?.assigneeId || ''}
            options={assigneeOptions}
            disabled={isPending}
            {...fieldErrorProps('assigneeId', errors)}
          />
          <FieldError name="assigneeId" errors={errors} />
        </FormGroup>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? 'Update Issue' : 'Create Issue'}
        </Button>
      </div>
    </Form>
  )
}
