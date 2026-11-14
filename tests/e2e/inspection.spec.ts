import { expect, test, type Page } from '@playwright/test'
import { watchPage } from './watch'

interface Defect {
  componentId: string
  position: [number, number, number]
}

/** The scenario's answer key, read from the store the page exposes under ?e2e=1. */
async function defects(page: Page): Promise<Defect[]> {
  return page.evaluate(() => {
    const store = (
      window as unknown as { __session: { getState: () => { scenario: { defects: Defect[] } } } }
    ).__session
    return store.getState().scenario.defects
  })
}

async function selectOnAircraft(page: Page, defect: Defect) {
  await page.evaluate((d) => {
    const store = (
      window as unknown as { __session: { getState: () => { select: (s: unknown) => void } } }
    ).__session
    store.getState().select({ componentId: d.componentId, point: d.position })
  }, defect)
}

async function acceptWorkOrder(page: Page, seed: string) {
  await page.getByLabel('Technician name').fill('A. Technician')
  await page.getByLabel('Technician ID').fill('T-0042')
  await page.getByLabel(/Replay work order/).fill(seed)
  await page.getByRole('button', { name: 'Accept work order' }).click()
}

test('a work order cannot be accepted without a technician name and ID', async ({ page }) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: 'Accept work order' }).click()
  await expect(page.getByRole('alert')).toContainText('name and ID')
})

test('full inspection: accept, report a real defect, sign off, review, logbook', async ({
  page,
}) => {
  const problems = watchPage(page)
  await page.goto('./?e2e=1')
  await acceptWorkOrder(page, '4242')
  await expect(page.getByText('WO-4242')).toBeVisible()

  const [first] = await defects(page)
  if (!first) throw new Error('scenario has no defects')
  await selectOnAircraft(page, first)
  await expect(page.getByText('Selected component')).toBeVisible()
  await page.getByRole('button', { name: 'Report discrepancy' }).click()

  const report = page.getByRole('dialog', { name: 'Discrepancy report' })
  await expect(report.getByRole('button', { name: 'Record finding' })).toBeDisabled()
  await report.getByLabel('ATA chapter').selectOption('32')
  await report.getByLabel('Discrepancy type').selectOption('tire')
  const options = await report.getByLabel('Observed condition').locator('option').allTextContents()
  // The form offers several wordings and does not reveal which is right.
  expect(options.length).toBeGreaterThan(3)
  await report.getByLabel('Observed condition').selectOption({ index: 1 })
  await report.getByRole('button', { name: 'Record finding' }).click()

  await page.keyboard.press('Tab')
  const workstation = page.getByRole('dialog', { name: 'Workstation' })
  await expect(workstation.getByRole('row')).toHaveCount(2)
  await workstation.getByRole('button', { name: 'Sign off inspection' }).click()
  await workstation.getByRole('button', { name: 'Confirm sign-off' }).click()

  await expect(page.getByRole('heading', { name: /Inspection review/ })).toBeVisible()
  await expect(page.getByText(/^(Correct|Partly correct)$/).first()).toBeVisible()
  await page.getByRole('button', { name: /Close and return/ }).click()

  await expect(page.getByRole('cell', { name: 'WO-4242' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('cell', { name: 'WO-4242' })).toBeVisible()
  expect(problems.consoleErrors).toEqual([])
  expect(problems.failedRequests).toEqual([])
})

test('reporting a sound component is graded incorrect and the real defects are listed as missed', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await acceptWorkOrder(page, '4242')
  await selectOnAircraft(page, { componentId: 'rudder', position: [36, 9, 0] })
  await page.getByRole('button', { name: 'Report discrepancy' }).click()
  const report = page.getByRole('dialog', { name: 'Discrepancy report' })
  await report.getByLabel('ATA chapter').selectOption('27')
  await report.getByLabel('Discrepancy type').selectOption('tire')
  await report.getByLabel('Observed condition').selectOption({ index: 1 })
  await report.getByRole('button', { name: 'Record finding' }).click()
  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: 'Sign off inspection' }).click()
  await page.getByRole('button', { name: 'Confirm sign-off' }).click()

  await expect(page.locator('.review .chip', { hasText: /^Incorrect$/ })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Discrepancies you did not report' }),
  ).toBeVisible()
  await expect(page.locator('.review .chip', { hasText: /^Missed$/ }).first()).toBeVisible()
})

test('the engine inlet assignment can be chosen and its defects are on the engines', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await page.getByRole('radio', { name: /Engine inspection/ }).check()
  await acceptWorkOrder(page, '77')
  await expect(page.getByText('Engine inspection — inlet and fan')).toBeVisible()

  const found = await defects(page)
  expect(found.length).toBeGreaterThan(0)
  for (const defect of found) expect(defect.componentId).toMatch(/^eng[12]_(fan|inlet_cowl)$/)

  const [first] = found
  if (!first) throw new Error('scenario has no defects')
  await selectOnAircraft(page, first)
  await page.getByRole('button', { name: 'Report discrepancy' }).click()
  const report = page.getByRole('dialog', { name: 'Discrepancy report' })
  await report
    .getByLabel('ATA chapter')
    .selectOption(first.componentId.endsWith('_fan') ? '72' : '71')
  await report.getByLabel('Discrepancy type').selectOption('foreign-object-damage')
  await report
    .getByLabel('Observed condition')
    .selectOption(
      first.componentId.endsWith('_fan')
        ? 'Nick in the fan blade leading edge'
        : 'Dent in the inlet lip skin',
    )
  await report.getByRole('button', { name: 'Record finding' }).click()
  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: 'Sign off inspection' }).click()
  await page.getByRole('button', { name: 'Confirm sign-off' }).click()
  await expect(page.locator('.review .chip', { hasText: /^Correct$/ })).toBeVisible()
})
