import { expect, test } from '@playwright/test'
import { watchPage } from './watch'

test('look test loads every asset with no errors', async ({ page }) => {
  const problems = watchPage(page)
  const tire = page.waitForResponse((response) => response.url().endsWith('lookdev_tire.glb'))
  await page.goto('./?scene=lookdev')

  await expect(page.locator('canvas')).toBeVisible()
  expect((await tire).status()).toBe(200)
  await page.waitForLoadState('networkidle')

  expect(problems.failedRequests).toEqual([])
  expect(problems.consoleErrors).toEqual([])
})

test('a model that fails to load is reported by file name', async ({ page }) => {
  await page.route('**/lookdev_tire.glb', (route) => route.abort())
  await page.goto('./?scene=lookdev')

  await expect(page.getByRole('alert')).toContainText('lookdev_tire.glb')
})
