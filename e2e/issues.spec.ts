import { expect, test } from '@playwright/test'
import {
  createIssue,
  formAlert,
  issueLink,
  openIssue,
  signUp,
  unique,
} from './helpers'

test.beforeEach(async ({ page }) => {
  await signUp(page)
})

test('creating an issue returns to the list and leaves a clean form', async ({
  page,
}) => {
  const title = unique('Create')
  await page.goto('/issues/new')
  await page.getByLabel('Title').fill(title)
  await page.getByRole('button', { name: 'Create Issue' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(issueLink(page, title)).toBeVisible()

  await page.getByRole('link', { name: 'New Issue' }).first().click()
  await expect(page).toHaveURL('/issues/new')
  await expect(page.getByLabel('Title')).toHaveValue('')
  await expect(formAlert(page)).toHaveCount(0)
})

test('editing an issue returns to the list with the new title', async ({
  page,
}) => {
  const title = unique('Edit')
  const updated = `${title}-updated`
  await createIssue(page, title)
  await openIssue(page, title)

  await page.getByRole('link', { name: 'Edit' }).click()
  await page.getByLabel('Title').fill(updated)
  await page.getByRole('button', { name: 'Update Issue' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(issueLink(page, updated)).toBeVisible()
})

test('a user can assign an issue and see it on the issue page', async ({
  page,
  browser,
}) => {
  const teammateContext = await browser.newContext()
  const teammate = await signUp(await teammateContext.newPage())
  const title = unique('Assign')

  await createIssue(page, title, { assignee: teammate.name })
  await openIssue(page, title)

  await expect(
    page.getByRole('definition').filter({ hasText: teammate.name }),
  ).toBeVisible()
  await teammateContext.close()
})

test('deleting an issue removes it from the list', async ({ page }) => {
  const title = unique('Delete')
  await createIssue(page, title)
  await openIssue(page, title)

  await page.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(issueLink(page, title)).toHaveCount(0)
})

test('the API rejects an invalid issue', async ({ page }) => {
  const response = await page.request.post('/api/issue', {
    data: { title: 'x' },
  })
  expect(response.status()).toBe(400)
})
