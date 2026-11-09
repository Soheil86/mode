import { expect, test } from '@playwright/test'
import { signUp } from './helpers'

test('the theme toggle applies and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(
    page.getByRole('button', { name: 'Switch to light mode' }),
  ).toBeVisible()
})

test('the theme follows the system until one is chosen', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page)
    await expect(page.getByLabel('Search')).toBeVisible()
  })

  test('c opens the new issue form', async ({ page }) => {
    await page.keyboard.press('c')
    await expect(page).toHaveURL('/issues/new')
  })

  test('/ focuses search, and typing there does not trigger shortcuts', async ({
    page,
  }) => {
    await page.keyboard.press('/')
    await expect(page.getByLabel('Search')).toBeFocused()

    await page.keyboard.type('cb')
    await expect(page.getByLabel('Search')).toHaveValue('cb')
    await expect(page).not.toHaveURL('/issues/new')
    await expect(page).not.toHaveURL(/view=board/)
  })

  test('b and l switch views', async ({ page }) => {
    await page.keyboard.press('b')
    await expect(page).toHaveURL(/view=board/)

    await page.keyboard.press('l')
    await expect(page).not.toHaveURL(/view=board/)
  })

  test('? opens the help dialog and Escape closes it', async ({ page }) => {
    await page.keyboard.press('?')
    const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' })
    await expect(dialog).toBeVisible()

    await page.keyboard.press('c')
    await expect(page).toHaveURL('/dashboard')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})

test('the page has no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await signUp(page)
  await page.goto('/dashboard?view=board')
  await expect(page.getByRole('region', { name: 'Done' })).toBeVisible()
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Issues' })).toBeVisible()

  expect(errors).toEqual([])
})
