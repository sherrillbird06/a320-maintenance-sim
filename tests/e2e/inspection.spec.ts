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
  await expect(workstation.getByRole('button', { name: 'Remove' })).toHaveCount(1)
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

test('work order references open the technical library at that chapter', async ({ page }) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: /ATA 32/ }).click()
  const library = page.getByRole('dialog', { name: 'Technical library' })
  await expect(library.getByRole('heading', { name: /ATA 32 Landing Gear/ })).toBeVisible()
  await expect(library.getByText('not approved maintenance data')).toBeVisible()
  await expect(library.getByText(/Main gear shock strut/)).toBeVisible()

  await library.getByRole('button', { name: /29 Hydraulic Power/ }).click()
  await expect(library.getByRole('heading', { name: /ATA 29 Hydraulic Power/ })).toBeVisible()
  await expect(library.getByText(/Green, Blue and Yellow/)).toBeVisible()

  await library.getByRole('button', { name: 'Close library' }).click()
  await expect(page.getByRole('heading', { name: 'Work order' })).toBeVisible()
})

test('a selected component links to its chapter in the library', async ({ page }) => {
  await page.goto('./?e2e=1')
  await acceptWorkOrder(page, '4242')
  await selectOnAircraft(page, { componentId: 'eng1_fan', position: [12, 2, 5.75] })
  await page.getByRole('button', { name: /ATA 72/ }).click()
  await expect(page.getByRole('heading', { name: /ATA 72 Engine/ })).toBeVisible()
  await page.getByRole('button', { name: 'Close library' }).click()
  await expect(page.getByText('Selected component')).toBeVisible()
})

test('the checklist follows what is examined and the review reports what was skipped', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await acceptWorkOrder(page, '4242')
  await selectOnAircraft(page, { componentId: 'nlg_tire_lh', position: [5, 0.4, 0.25] })
  await selectOnAircraft(page, { componentId: 'nlg_tire_rh', position: [5, 0.4, -0.25] })
  await page.keyboard.press('Tab')

  const workstation = page.getByRole('dialog', { name: 'Workstation' })
  const nose = workstation.getByRole('row', { name: /Nose gear tires/ })
  await expect(nose).toContainText('2 of 2')
  await expect(nose).toContainText('Examined')
  await expect(workstation.getByRole('row', { name: /Left main gear tires/ })).toContainText(
    'Not examined',
  )

  await workstation.getByRole('button', { name: 'Sign off inspection' }).click()
  await workstation.getByRole('button', { name: 'Confirm sign-off' }).click()
  await expect(page.getByText(/2 of 3 checklist items not fully examined/)).toBeVisible()
  await expect(page.getByText(/References consulted: none/)).toBeVisible()
})

test('the training record reflects signed-off inspections', async ({ page }) => {
  await page.goto('./?e2e=1')
  await expect(page.getByRole('row', { name: /Landing Gear Inspection/ })).toContainText(
    'Available',
  )
  await expect(page.getByRole('row', { name: /Aircraft Familiarization/ })).toContainText(
    'No assignment yet',
  )

  await acceptWorkOrder(page, '4242')
  for (const defect of await defects(page)) {
    await selectOnAircraft(page, defect)
    await page.getByRole('button', { name: 'Report discrepancy' }).click()
    const report = page.getByRole('dialog', { name: 'Discrepancy report' })
    await report.getByLabel('ATA chapter').selectOption('32')
    await report.getByLabel('Discrepancy type').selectOption('tire')
    await report.getByLabel('Observed condition').selectOption({ index: 1 })
    await report.getByRole('button', { name: 'Record finding' }).click()
  }
  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: 'Sign off inspection' }).click()
  await page.getByRole('button', { name: 'Confirm sign-off' }).click()
  await page.getByRole('button', { name: /Close and return/ }).click()

  const level = page.getByRole('row', { name: /Landing Gear Inspection/ })
  await expect(level).toContainText('1')
  await expect(level).not.toContainText('Available')
  await expect(page.getByText(/ATA chapters practised/)).toBeVisible()
})

test('a hydraulic leak report asks which system and grades the answer', async ({ page }) => {
  await page.goto('./?e2e=1')
  await page.getByRole('radio', { name: /Hydraulic system/ }).check()
  await acceptWorkOrder(page, '11')
  const [first] = await defects(page)
  if (!first) throw new Error('scenario has no defects')
  const system = first.componentId.replace('hyd_service_panel_', '')
  await selectOnAircraft(page, first)
  await expect(
    page.getByRole('heading', {
      name: new RegExp(system + ' hydraulic system service panel', 'i'),
    }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Report discrepancy' }).click()
  const report = page.getByRole('dialog', { name: 'Discrepancy report' })
  await report.getByLabel('ATA chapter').selectOption('29')
  await report.getByLabel('Discrepancy type').selectOption('hydraulic-leak')
  await report
    .getByLabel('Observed condition')
    .selectOption('Fresh fluid streak with drips from the panel edge')
  // The report cannot be recorded until a system is chosen.
  await expect(report.getByRole('button', { name: 'Record finding' })).toBeDisabled()
  await report.getByLabel('Hydraulic system').selectOption(system)
  await report.getByRole('button', { name: 'Record finding' }).click()

  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: 'Sign off inspection' }).click()
  await page.getByRole('button', { name: 'Confirm sign-off' }).click()
  await expect(page.locator('.review .chip', { hasText: /^Correct$/ })).toBeVisible()
})

test('the flight control assignment places damage on wing surfaces and grades a correct report', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await page.getByRole('radio', { name: /Flight control inspection/ }).check()
  await acceptWorkOrder(page, '21')
  const found = await defects(page)
  expect(found.length).toBeGreaterThan(0)
  for (const defect of found)
    expect(defect.componentId).toMatch(/^(slat_\d|flap_inboard|flap_outboard|aileron)_(lh|rh)$/)

  const [first] = found
  if (!first) throw new Error('scenario has no defects')
  await selectOnAircraft(page, first)
  await expect(page.getByText('What to look at')).toBeVisible()
  await page.getByRole('button', { name: 'Report discrepancy' }).click()
  const report = page.getByRole('dialog', { name: 'Discrepancy report' })
  await report.getByLabel('ATA chapter').selectOption('27')
  await report.getByLabel('Discrepancy type').selectOption('panel-damage')
  const options = await report.getByLabel('Observed condition').locator('option').allTextContents()
  expect(options).toContain('Dent in the skin with scraped paint')
  expect(options).toContain('Trailing edge delaminated with lifted skin')
  await report.getByLabel('Observed condition').selectOption({ index: 1 })
  await report.getByRole('button', { name: 'Record finding' }).click()
  await page.keyboard.press('Tab')
  await page.getByRole('button', { name: 'Sign off inspection' }).click()
  await page.getByRole('button', { name: 'Confirm sign-off' }).click()
  await expect(
    page.locator('.review .chip', { hasText: /^(Correct|Partly correct)$/ }).first(),
  ).toBeVisible()
})

test('the aircraft diagram lists components by zone and never shows defects', async ({ page }) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: 'Aircraft diagram' }).click()
  const diagram = page.getByRole('dialog', { name: 'Aircraft diagram' })
  await expect(diagram.getByRole('img', { name: /Plan view/ })).toBeVisible()

  await diagram.getByRole('button', { name: /Landing gear/ }).click()
  await expect(diagram.getByRole('heading', { name: /Zone C — Landing gear/ })).toBeVisible()
  await expect(diagram.getByRole('cell', { name: 'Nose gear shock strut' })).toBeVisible()

  await diagram.getByRole('button', { name: /Rear fuselage and tail/ }).click()
  await expect(diagram.getByRole('cell', { name: 'Rudder', exact: true })).toBeVisible()
  await expect(diagram.getByText(/defect|discrepanc/i)).toHaveCount(1) // only the lead sentence saying it shows none
  await diagram.getByRole('button', { name: 'Close diagram' }).click()
  await expect(page.getByRole('heading', { name: 'Work order' })).toBeVisible()
})

test('during an inspection the diagram shows what the work order requires and what is examined', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await acceptWorkOrder(page, '4242')
  await selectOnAircraft(page, { componentId: 'nlg_tire_lh', position: [5, 0.4, 0.25] })
  await page.keyboard.press('Tab')
  await page
    .getByRole('dialog', { name: 'Workstation' })
    .getByRole('button', { name: 'Aircraft diagram' })
    .click()

  const diagram = page.getByRole('dialog', { name: 'Aircraft diagram' })
  await expect(diagram.getByRole('heading', { name: /Zone C/ })).toBeVisible()
  await expect(diagram.getByRole('row', { name: /Nose wheel tire, left/ })).toContainText(
    'Examined',
  )
  await expect(diagram.getByRole('row', { name: /Nose wheel tire, right/ })).toContainText(
    'To examine',
  )
  await expect(diagram.getByRole('row', { name: /Nose gear shock strut/ })).not.toContainText(
    'examine',
  )
})

test('the A&P study guide shows every area, searches, and remembers reviewed topics', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: 'A&P study guide' }).click()
  const guide = page.getByRole('dialog', { name: 'A&P study guide' })
  await expect(guide.getByRole('heading', { name: /Basic Electricity/ })).toBeVisible()
  await expect(guide.getByText('not A320 maintenance data')).toBeVisible()
  await expect(guide.getByText(/156 are marked “Checked”/)).toBeVisible()
  await expect(guide.getByText(/between 1\.275 and 1\.310/)).toBeVisible()
  await expect(guide.locator('.study__formula')).toContainText('P = I × E')
  await expect(guide.getByText('0 of 40 topics reviewed')).toBeVisible()

  await guide.getByRole('button', { name: 'Powerplant', exact: true }).click()
  await expect(guide.getByRole('navigation').getByRole('listitem')).toHaveCount(16)
  await guide.getByRole('button', { name: 'Propellers' }).click()
  await expect(guide.getByRole('heading', { name: /Propellers/ })).toContainText('High priority')

  await guide.getByLabel('Search all topics').fill('magneto')
  await expect(guide.getByRole('status')).toContainText('found')
  await guide.getByRole('navigation').getByRole('button', { name: 'Ignition Systems' }).click()
  await expect(guide.getByRole('heading', { name: /Ignition Systems/ })).toBeVisible()

  await guide.getByRole('button', { name: 'Mark as reviewed' }).click()
  await expect(guide.getByText('1 of 40 topics reviewed')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'A&P study guide' }).click()
  await expect(guide.getByText('1 of 40 topics reviewed')).toBeVisible()
})

test('study topics and library chapters link to each other', async ({ page }) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: 'Technical library' }).click()
  const library = page.getByRole('dialog', { name: 'Technical library' })
  await library.getByRole('button', { name: /32 Landing Gear/ }).click()
  await library.getByRole('button', { name: 'Landing Gear Systems' }).click()

  const guide = page.getByRole('dialog', { name: 'A&P study guide' })
  await expect(guide.getByRole('heading', { name: /Landing Gear Systems/ })).toBeVisible()
  await guide.getByRole('button', { name: /ATA 32/ }).click()
  await expect(library.getByRole('heading', { name: /ATA 32 Landing Gear/ })).toBeVisible()
})

test('practice questions are checked, explained and recorded in the training record', async ({
  page,
}) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: 'A&P study guide' }).click()
  const guide = page.getByRole('dialog', { name: 'A&P study guide' })
  await expect(guide.getByRole('button', { name: /Retry missed \(0\)/ })).toBeDisabled()
  await guide.getByRole('button', { name: 'Practice this topic' }).click()

  // Three questions on Basic Electricity, in a random order: two answered correctly, the last wrongly.
  const right = /^(2 amperes|It is less than the smallest branch resistance|An inductor)$/
  const wrong = /^(0\.5 ampere|It equals the sum of the branch resistances|A capacitor)$/
  for (let asked = 0; asked < 3; asked++) {
    await expect(guide.getByText(`question ${asked + 1} of 3`)).toBeVisible()
    await expect(guide.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    await guide.getByRole('radio', { name: asked < 2 ? right : wrong }).check()
    await guide.getByRole('button', { name: 'Check answer' }).click()
    await expect(guide.getByRole('status')).toContainText(asked < 2 ? 'Correct' : 'Incorrect')
    await guide.getByRole('button', { name: asked < 2 ? 'Next question' : 'See results' }).click()
  }
  await expect(guide.getByText('2 of 3 correct')).toBeVisible()
  await expect(guide.getByRole('heading', { name: 'Practice results' })).toBeVisible()
  await guide.getByRole('button', { name: 'Back to the study guide' }).click()
  await expect(guide.getByRole('button', { name: /Retry missed \(1\)/ })).toBeEnabled()
  await guide.getByRole('button', { name: 'Close study guide' }).click()

  const record = page.getByRole('table', { name: 'A&P knowledge practice' })
  await expect(record.getByRole('row', { name: /General/ })).toContainText('3 of 30')
  await expect(record.getByRole('row', { name: /Powerplant/ })).toContainText('0 of 48')
})

test('a corrected study point shows its source and the original wording', async ({ page }) => {
  await page.goto('./?e2e=1')
  await page.getByRole('button', { name: 'A&P study guide' }).click()
  const guide = page.getByRole('dialog', { name: 'A&P study guide' })
  await guide.getByRole('button', { name: 'Airframe', exact: true }).click()
  await guide.getByRole('button', { name: 'Wood Structures' }).click()
  await expect(guide.getByText(/no steeper than 15:1 for a spar splice/)).toBeVisible()
  await expect(guide.getByRole('link', { name: /AC 43.13-1B, Figure 1-5/ })).toBeVisible()
  await expect(
    guide.getByText(/The guide as supplied read: “typically about a 12:1 slope/),
  ).toBeVisible()
})
