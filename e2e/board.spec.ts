import { expect, test } from '@playwright/test'
import {
  boardColumn,
  boardUrl,
  createIssue,
  dragToColumn,
  newUser,
  signUp,
  unique,
} from './helpers'

test('dragging a card changes its status and survives a reload', async ({
  page,
}) => {
  await signUp(page)
  const title = unique('Drag')
  await createIssue(page, title)

  await page.goto(boardUrl(title))
  await expect(boardColumn(page, 'Backlog').getByText(title)).toBeVisible()

  await dragToColumn(page, title, 'Done')
  await expect(boardColumn(page, 'Done').getByText(title)).toBeVisible()

  await page.reload()
  await expect(boardColumn(page, 'Done').getByText(title)).toBeVisible()
})

test('a dropped card moves before the server responds', async ({ page }) => {
  await signUp(page)
  const title = unique('Optimistic')
  await createIssue(page, title)
  await page.goto(boardUrl(title))
  await expect(boardColumn(page, 'Backlog').getByText(title)).toBeVisible()

  await page.route('**/dashboard*', async (route) => {
    if (route.request().method() === 'POST') {
      await new Promise((resolve) => setTimeout(resolve, 2_000))
    }
    await route.continue()
  })

  await dragToColumn(page, title, 'Todo')
  await expect(boardColumn(page, 'Todo').getByText(title)).toBeVisible({
    timeout: 1_000,
  })
})

test('a card returns to its column when the move fails', async ({ page }) => {
  await signUp(page)
  const title = unique('Rollback')
  await createIssue(page, title)
  await page.goto(boardUrl(title))
  await expect(boardColumn(page, 'Backlog').getByText(title)).toBeVisible()

  await page.route('**/dashboard*', (route) =>
    route.request().method() === 'POST' ? route.abort() : route.continue(),
  )

  await dragToColumn(page, title, 'Done')
  await expect(page.getByText('Could not reach the server')).toBeVisible()
  await expect(boardColumn(page, 'Backlog').getByText(title)).toBeVisible()
})

test('a card can be moved with the keyboard', async ({ page }) => {
  await signUp(page)
  const title = unique('Keyboard')
  await createIssue(page, title)
  await page.goto(boardUrl(title))

  const handle = page.getByRole('button', { name: `Move ${title}` })
  await handle.focus()
  await page.keyboard.press('ArrowRight')

  await expect(boardColumn(page, 'Todo').getByText(title)).toBeVisible()
  await expect(handle).toBeFocused()
})

test('other people cannot move an issue, but its assignee can', async ({
  browser,
}) => {
  const owner = await newUser(browser)
  const assignee = await newUser(browser)
  const other = await newUser(browser)
  const title = unique('Assigned')
  await createIssue(owner.page, title, { assignee: assignee.name })

  await other.page.goto(boardUrl(title))
  await expect(other.page.getByLabel('Locked')).toBeVisible()
  await dragToColumn(other.page, title, 'Done')
  await expect(
    boardColumn(other.page, 'Backlog').getByText(title),
  ).toBeVisible()

  await assignee.page.goto(boardUrl(title))
  await dragToColumn(assignee.page, title, 'Done')
  await expect(boardColumn(assignee.page, 'Done').getByText(title)).toBeVisible()

  await assignee.page.reload()
  await expect(boardColumn(assignee.page, 'Done').getByText(title)).toBeVisible()

  await owner.context.close()
  await assignee.context.close()
  await other.context.close()
})
