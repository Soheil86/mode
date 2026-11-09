import { PRIORITY_VALUES, STATUS_VALUES } from './constants'

export type Status = (typeof STATUS_VALUES)[number]
export type Priority = (typeof PRIORITY_VALUES)[number]

export type UserOption = {
  id: string
  email: string
}
