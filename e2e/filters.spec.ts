import { expect, test } from '@playwright/test'
import { createIssue, issueLink, signUp, unique } from './helpers'

test.beforeEach(async ({ page }) => {
  await signUp(page)
})

test('search updates the URL and survives a reload', async ({ page }) => {
  const prefix = unique('Search')
  const wanted = `${prefix}-wanted`
  const other = `${unique('Other')}-hidden`
  await createIssue(page, wanted)
  await createIssue(page, other)

  await page.getByLabel('Search').fill(prefix)
  await expect(page).toHaveURL(new RegExp(`q=${prefix}`))
  await expect(issueLink(page, wanted)).toBeVisible()
  await expect(issueLink(page, other)).toHaveCount(0)

  await page.reload()
  await expect(page.getByLabel('Search')).toHaveValue(prefix)
  await expect(issueLink(page, wanted)).toBeVisible()
})

test('search treats % as plain text', async ({ page }) => {
  await createIssue(page, unique('Percent'))

  await page.goto('/dashboard?q=%25%25%25')
  await expect(page.getByText('No matching issues')).toBeVisible()
})

test('filters combine, and Clear resets them', async ({ page }) => {
  const prefix = unique('Filter')
  await page.request.post('/api/issue', {
    data: { title: `${prefix}-high`, priority: 'high', status: 'todo' },
  })
  await page.request.post('/api/issue', {
    data: { title: `${prefix}-low`, priority: 'low', status: 'todo' },
  })

  await page.goto(`/dashboard?q=${prefix}`)
  await page.getByLabel('Priority').selectOption('high')
  await expect(page).toHaveURL(/priority=high/)
  await expect(issueLink(page, `${prefix}-high`)).toBeVisible()
  await expect(issueLink(page, `${prefix}-low`)).toHaveCount(0)

  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByLabel('Search')).toHaveValue('')
})

test('"Assigned to me" only shows my issues', async ({ page }) => {
  const prefix = unique('Mine')
  const { name } = await signUp(page)
  await createIssue(page, `${prefix}-assigned`, { assignee: name })
  await createIssue(page, `${prefix}-unassigned`)

  await page.goto(`/dashboard?q=${prefix}`)
  await page.getByLabel('Assignee').selectOption('me')
  await expect(page).toHaveURL(/assignee=me/)
  await expect(issueLink(page, `${prefix}-assigned`)).toBeVisible()
  await expect(issueLink(page, `${prefix}-unassigned`)).toHaveCount(0)
})

test('results are split into pages that keep the filters', async ({ page }) => {
  const prefix = unique('Page')

  for (let index = 0; index < 21; index++) {
    const response = await page.request.post('/api/issue', {
      data: { title: `${prefix}-${index}` },
    })
    expect(response.status()).toBe(201)
  }

  await page.goto(`/dashboard?q=${prefix}`)
  await expect(page.getByText('Page 1 of 2')).toBeVisible()
  await expect(page.getByRole('link', { name: prefix })).toHaveCount(20)

  await page.getByRole('link', { name: 'Next' }).click()
  await expect(page).toHaveURL(new RegExp(`q=${prefix}.*page=2`))
  await expect(page.getByText('Page 2 of 2')).toBeVisible()
  await expect(page.getByRole('link', { name: prefix })).toHaveCount(1)
})

test('invalid URL values are ignored', async ({ page }) => {
  const response = await page.goto(
    '/dashboard?status=nope&priority=nope&page=abc&view=nope',
  )
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Issues' })).toBeVisible()
})
