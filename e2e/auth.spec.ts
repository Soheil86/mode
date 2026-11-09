import { expect, test } from '@playwright/test'
import { PASSWORD, formAlert, signUp, visibleField } from './helpers'

test('signed-out visitors are sent to sign in', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/signin')

  await page.goto('/issues/new')
  await expect(page).toHaveURL('/signin')
})

test('a user can sign up, sign out and sign back in', async ({ page }) => {
  const { email } = await signUp(page)

  await page.getByRole('button', { name: 'Sign Out' }).click()
  await expect(page).toHaveURL('/signin')

  await visibleField(page, 'email').fill(email)
  await visibleField(page, 'password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText(email)).toBeVisible()
})

test('a wrong password shows an error and links it to the field', async ({
  page,
}) => {
  const { email } = await signUp(page)
  await page.getByRole('button', { name: 'Sign Out' }).click()
  await expect(page).toHaveURL('/signin')

  const password = visibleField(page, 'password')
  await expect(password).not.toHaveAttribute('aria-describedby')

  await visibleField(page, 'email').fill(email)
  await password.fill('not-the-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(formAlert(page)).toContainText('Invalid email or password')
  await expect(password).toHaveAttribute('aria-describedby', 'password-error')
  await expect(password).toHaveAttribute('aria-invalid', 'true')
})
