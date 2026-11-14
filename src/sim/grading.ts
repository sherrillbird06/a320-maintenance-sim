import type { DefectType, Finding } from '../data/schema'
import type { PlacedDefect, Scenario } from './scenario'

/** How close a tag must be to a defect to count as having found it. */
export const TAG_RADIUS_M = 0.25

export interface FindingChecks {
  location: boolean
  ata: boolean
  category: boolean
  condition: boolean
  /** Present only for defects that belong to one hydraulic system. */
  system?: boolean
}

export interface GradedFinding {
  finding: Finding
  verdict: 'correct' | 'partial' | 'incorrect'
  /** Present when the finding matched a real defect. */
  checks?: FindingChecks
  explanation: string
}

export interface MissedDefect {
  defect: PlacedDefect
  label: string
  explanation: string
}

export interface InspectionResult {
  findings: GradedFinding[]
  missed: MissedDefect[]
  summary: { correct: number; partial: number; incorrect: number; missed: number; accuracy: number }
}

function distance(a: readonly number[], b: readonly number[]): number {
  return Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0), (a[2] ?? 0) - (b[2] ?? 0))
}

const NOTHING_THERE =
  'There is no discrepancy at the tagged location. Reporting a sound part costs time and can ground an aircraft for nothing; confirm what you see before writing it up.'
const ALREADY_REPORTED = 'This discrepancy was already reported. A defect is written up once.'

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1)

/**
 * Compares what the technician reported with what is actually wrong with the
 * aircraft, and explains every result. A defect counts as found only when the
 * tag is on the right component and close to the defect itself.
 */
export function gradeInspection(
  scenario: Scenario,
  findings: readonly Finding[],
  defectTypes: readonly DefectType[],
): InspectionResult {
  const typeOf = (defect: PlacedDefect) => defectTypes.find((t) => t.id === defect.defectTypeId)
  const claimed = new Set<PlacedDefect>()
  const graded: GradedFinding[] = []

  for (const finding of findings) {
    const near = scenario.defects.filter(
      (d) =>
        d.componentId === finding.componentId &&
        distance(d.position, finding.taggedPoint) <= TAG_RADIUS_M,
    )
    const match = near.find((d) => !claimed.has(d))
    const type = match && typeOf(match)

    if (!match || !type) {
      graded.push({
        finding,
        verdict: 'incorrect',
        explanation: near.length > 0 ? ALREADY_REPORTED : NOTHING_THERE,
      })
      continue
    }

    claimed.add(match)
    const checks: FindingChecks = {
      location: true,
      ata: type.libraryChapters.includes(finding.ata),
      category: finding.category === type.category,
      condition: finding.condition === type.correctCondition,
    }
    const problems: string[] = []
    if (!checks.ata) problems.push(`the ATA chapter should be ${type.libraryChapters[0]}`)
    if (!checks.category) problems.push(`the discrepancy type should be "${type.label}"`)
    if (!checks.condition) {
      problems.push(`the observed condition should read "${type.correctCondition}"`)
    }
    if (type.hydraulicSystem) {
      checks.system = finding.hydraulicSystem === type.hydraulicSystem
      if (!checks.system) {
        problems.push(`the hydraulic system should be ${capitalize(type.hydraulicSystem)}`)
      }
    }

    graded.push({
      finding,
      verdict: problems.length === 0 ? 'correct' : 'partial',
      checks,
      explanation:
        problems.length === 0
          ? type.explanation
          : `You found the discrepancy, but ${problems.join(', and ')}. ${type.explanation}`,
    })
  }

  const missed: MissedDefect[] = scenario.defects
    .filter((d) => !claimed.has(d))
    .map((defect) => {
      const type = typeOf(defect)
      return {
        defect,
        label: type?.label ?? defect.defectTypeId,
        explanation: `Not reported. ${type?.explanation ?? ''}`.trim(),
      }
    })

  const correct = graded.filter((g) => g.verdict === 'correct').length
  const partial = graded.filter((g) => g.verdict === 'partial').length
  const incorrect = graded.filter((g) => g.verdict === 'incorrect').length
  const possible = scenario.defects.length + incorrect
  const accuracy = possible === 0 ? 1 : (correct + 0.5 * partial) / possible

  return {
    findings: graded,
    missed,
    summary: { correct, partial, incorrect, missed: missed.length, accuracy },
  }
}
