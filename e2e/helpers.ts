import { expect, type Browser, type Page } from '@playwright/test'

export const PASSWORD = 'correct-horse-battery'

let counter = 0

// Next keeps visited pages in the DOM while hidden, so match only visible ones
export function visibleField(page: Page, name: string) {
  return page.locator(`input[name="${name}"]:visible`)
}

// Scoped to forms, because Next's route announcer also has role="alert"
export function formAlert(page: Page) {
  return page.locator('form [role="alert"]:visible')
}

export function unique(prefix: string) {
  return `${prefix}-${Date.now()}-${process.pid}-${counter++}`
}

export async function signUp(page: Page) {
  const name = unique('user')
  const email = `${name}@example.com`

  await page.goto('/signup')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Confirm Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL('/dashboard')

  return { email, name }
}

// A second signed-in person, in their own isolated browser session
export async function newUser(browser: Browser) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const { email, name } = await signUp(page)

  return { context, page, email, name }
}

export async function createIssue(
  page: Page,
  title: string,
  options: { assignee?: string } = {},
) {
  await page.goto('/issues/new')
  await page.getByLabel('Title').fill(title)
  if (options.assignee) {
    await page.getByLabel('Assignee').selectOption({ label: options.assignee })
  }
  await page.getByRole('button', { name: 'Create Issue' }).click()
  await expect(page).toHaveURL('/dashboard')
}

export function issueLink(page: Page, title: string) {
  return page.getByRole('link', { name: title })
}

export async function openIssue(page: Page, title: string) {
  await page.goto(`/dashboard?q=${encodeURIComponent(title)}`)
  await issueLink(page, title).click()
  await expect(page).toHaveURL(/\/issues\/\d+$/)

  return new URL(page.url()).pathname
}

export function boardUrl(title: string) {
  return `/dashboard?view=board&q=${encodeURIComponent(title)}`
}

export function boardColumn(page: Page, name: string) {
  return page.getByRole('region', { name, exact: true })
}

export async function dragToColumn(page: Page, title: string, column: string) {
  const from = await page
    .getByRole('listitem')
    .filter({ hasText: title })
    .boundingBox()
  const to = await boardColumn(page, column).boundingBox()

  await page.mouse.move(from!.x + 20, from!.y + from!.height - 12)
  await page.mouse.down()
  await page.mouse.move(to!.x + to!.width / 2, to!.y + 120, { steps: 12 })
  await page.mouse.up()
}
