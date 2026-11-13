// Fails when the built site or a model is over budget. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { checkBudgets, type BudgetedModel, type Budgets } from '../tools/checkBudgets.ts'
import { readModel } from '../tools/readModel.ts'

const DIST = 'dist'
/** Loaded only when the player enters the flight deck, so not part of the first load. */
const DEFERRED = [join(DIST, 'models', 'cockpit.glb')]

function bytesIn(dir: string): number {
  let total = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) total += bytesIn(path)
    else if (!DEFERRED.includes(path)) total += statSync(path).size
  }
  return total
}

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const budgets = JSON.parse(readFileSync('budgets.json', 'utf8')) as Budgets
const triangles: Partial<Record<BudgetedModel, number>> = {}
for (const model of Object.keys(budgets.triangles) as BudgetedModel[]) {
  const path = join('public', 'models', `${model}.glb`)
  if (existsSync(path)) triangles[model] = (await readModel(path)).triangles
}

const measured = { firstLoadBytes: bytesIn(DIST), triangles }
const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
console.log(
  `first load ${megabytes(measured.firstLoadBytes)} of ${megabytes(budgets.firstLoadBytes)}`,
)
for (const model of Object.keys(budgets.triangles) as BudgetedModel[]) {
  const count = triangles[model]
  console.log(
    `${model}: ${count === undefined ? 'not built yet' : `${count} of ${budgets.triangles[model]} triangles`}`,
  )
}

const problems = checkBudgets(measured, budgets)
for (const problem of problems) console.error(`OVER BUDGET — ${problem}`)
process.exit(problems.length > 0 ? 1 : 0)
