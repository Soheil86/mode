import { cn } from '@/lib/utils'
import React, { forwardRef } from 'react'

// Form
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

export function Form({ className, children, ...props }: FormProps) {
  return (
    <form className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  )
}

// Form Group
interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function FormGroup({ className, children, ...props }: FormGroupProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function FormLabel({ className, children, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}

// Form Input
type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border-medium dark:bg-[#222222] dark:text-gray-100 dark:placeholder:text-gray-500',
          className
        )}
        {...props}
      />
    )
  }
)
FormInput.displayName = 'FormInput'

// Form Textarea
type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border-medium dark:bg-[#222222] dark:text-gray-100 dark:placeholder:text-gray-500',
          className
        )}
        {...props}
      />
    )
  }
)
FormTextarea.displayName = 'FormTextarea'

// Form Select
interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<{ label: string; value: string }>
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, children, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border-medium dark:bg-[#222222] dark:text-gray-100',
          className
        )}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    )
  }
)
FormSelect.displayName = 'FormSelect'

// Form Error
interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function FormError({ className, children, ...props }: FormErrorProps) {
  return (
    <p
      role="alert"
      className={cn('text-sm font-medium text-red-500', className)}
      {...props}
    >
      {children}
    </p>
  )
}

// Field-level errors. An input only points at its error element when one
// exists, so screen readers aren't sent to something that isn't there.
type FieldErrors = Record<string, string[]> | undefined

export function fieldErrorProps(name: string, errors: FieldErrors) {
  const hasError = Boolean(errors?.[name])

  return {
    'aria-invalid': hasError || undefined,
    'aria-describedby': hasError ? `${name}-error` : undefined,
    className: hasError ? 'border-red-500' : undefined,
  }
}

export function FieldError({
  name,
  errors,
}: {
  name: string
  errors: FieldErrors
}) {
  const message = errors?.[name]?.[0]
  if (!message) return null

  return (
    <p id={`${name}-error`} className="text-sm text-red-500">
      {message}
    </p>
  )
}
