import { expect, test, type Page, type Route } from '@playwright/test'
import { createIssue, newUser, openIssue, unique } from './helpers'

// Records a Server Action call as the browser sends it, without letting it run
async function captureAction(page: Page, path: string, trigger: () => unknown) {
  let captured: { headers: Record<string, string>; body: string } | undefined

  const handler = async (route: Route) => {
    const request = route.request()
    if (request.method() === 'POST' && request.headers()['next-action']) {
      captured = {
        headers: {
          'next-action': request.headers()['next-action'],
          'content-type': request.headers()['content-type'],
        },
        body: request.postData() ?? '',
      }
      await route.abort()
      return
    }
    await route.continue()
  }

  await page.route(`**${path}`, handler)
  await trigger()
  await expect.poll(() => captured).toBeTruthy()
  await page.unroute(`**${path}`, handler)

  return captured!
}

test('only the owner sees edit and delete controls', async ({ browser }) => {
  const owner = await newUser(browser)
  const other = await newUser(browser)
  const title = unique('Owned')

  await createIssue(owner.page, title)
  const path = await openIssue(owner.page, title)
  await expect(owner.page.getByRole('link', { name: 'Edit' })).toBeVisible()

  await other.page.goto(path)
  await expect(other.page.getByRole('heading', { name: title })).toBeVisible()
  await expect(other.page.getByRole('link', { name: 'Edit' })).toHaveCount(0)
  await expect(other.page.getByRole('button', { name: 'Delete' })).toHaveCount(
    0,
  )

  await other.page.goto(`${path}/edit`)
  await expect(other.page).toHaveURL(path)
  await owner.context.close()
  await other.context.close()
})

test('the server refuses a delete from someone who is not the owner', async ({
  browser,
}) => {
  const owner = await newUser(browser)
  const attacker = await newUser(browser)
  const title = unique('Protected')

  await createIssue(owner.page, title)
  const path = await openIssue(owner.page, title)

  const call = await captureAction(owner.page, path, async () => {
    await owner.page.getByRole('button', { name: 'Delete' }).click()
    await owner.page.getByRole('button', { name: 'Delete' }).click()
  })

  // Replays the exact request, this time with the other user's session
  const response = await attacker.context.request.post(path, {
    headers: call.headers,
    data: call.body,
  })
  expect(await response.text()).toContain('do not have permission')

  await owner.page.goto(path)
  await expect(owner.page.getByRole('heading', { name: title })).toBeVisible()
  await owner.context.close()
  await attacker.context.close()
})

test('the server refuses an edit from someone who is not the owner', async ({
  browser,
}) => {
  const owner = await newUser(browser)
  const attacker = await newUser(browser)
  const title = unique('Locked')

  await createIssue(owner.page, title)
  const path = await openIssue(owner.page, title)
  await owner.page.goto(`${path}/edit`)

  const call = await captureAction(owner.page, `${path}/edit`, () =>
    owner.page.getByRole('button', { name: 'Update Issue' }).click(),
  )

  const response = await attacker.context.request.post(`${path}/edit`, {
    headers: call.headers,
    data: call.body,
  })
  expect(await response.text()).toContain('do not have permission')
  await owner.context.close()
  await attacker.context.close()
})

test('the API needs a real session', async ({ request, browser }) => {
  const fake = { Authorization: 'x' }

  expect((await request.get('/api/issue')).status()).toBe(401)
  expect((await request.get('/api/issue', { headers: fake })).status()).toBe(401)
  expect(
    (
      await request.post('/api/issue', {
        headers: fake,
        data: { title: 'Should not be saved', userId: 'anyone' },
      })
    ).status(),
  ).toBe(401)

  const user = await newUser(browser)
  expect((await user.context.request.get('/api/issue')).status()).toBe(200)
  await user.context.close()
})

test('password hashes never reach the browser', async ({ browser }) => {
  const user = await newUser(browser)
  const title = unique('Secret')

  await createIssue(user.page, title)
  const path = await openIssue(user.page, title)

  for (const url of ['/dashboard', '/dashboard?view=board', path, `${path}/edit`]) {
    const html = await (await user.context.request.get(url)).text()
    expect(html).not.toMatch(/\$2[aby]\$\d\d\$/)
  }
  await user.context.close()
})
