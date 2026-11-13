import { expect, test } from '@playwright/test'
import { watchPage } from './watch'

const BANNER = 'Training simulation — not approved maintenance data'

test('loads the 3D scene from the sub-path with no errors or missing files', async ({ page }) => {
  const problems = watchPage(page)
  await page.goto('./')

  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByText(BANNER)).toBeVisible()
  await page.waitForLoadState('networkidle')

  expect(problems.failedRequests).toEqual([])
  expect(problems.consoleErrors).toEqual([])
})

test('shows the desktop-required notice on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 })
  await page.goto('./')

  await expect(page.getByRole('alert')).toContainText('A desktop or laptop is required')
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('switches to the notice when a desktop window is narrowed', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('canvas')).toBeVisible()

  await page.setViewportSize({ width: 700, height: 900 })

  await expect(page.getByRole('alert')).toContainText('A desktop or laptop is required')
})
