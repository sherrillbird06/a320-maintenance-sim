import {
  ComponentSchema,
  type AtaChapter,
  type Component,
  type Side,
  type Source,
  type Zone,
} from './schema'
import { COCKPIT_ZONE, SYSTEMS_ZONE } from './zones'

export interface RegistryInput {
  components: Component[]
  ata: AtaChapter[]
  zones: Zone[]
  sources: Source[]
}

/** The mirrored counterpart an id implies, and the side the id itself belongs to. */
function twinOf(id: string): { twin: string; side: Side } | undefined {
  if (id.endsWith('_lh')) return { twin: `${id.slice(0, -3)}_rh`, side: 'LH' }
  if (id.endsWith('_rh')) return { twin: `${id.slice(0, -3)}_lh`, side: 'RH' }
  // Engine 1 is on the left wing, engine 2 on the right.
  if (id.startsWith('eng1_')) return { twin: `eng2_${id.slice(5)}`, side: 'LH' }
  if (id.startsWith('eng2_')) return { twin: `eng1_${id.slice(5)}`, side: 'RH' }
  return undefined
}

function duplicates<T>(items: T[], key: (item: T) => string): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const item of items) {
    const k = key(item)
    if (seen.has(k)) repeated.add(k)
    seen.add(k)
  }
  return [...repeated]
}

/**
 * Checks the registry as a whole. Returns one message per problem, each
 * starting with the record it concerns; an empty array means the data is sound.
 */
export function validateRegistry({ components, ata, zones, sources }: RegistryInput): string[] {
  const problems: string[] = []

  for (const chapter of duplicates(ata, (c) => c.chapter)) {
    problems.push(`ATA ${chapter}: duplicate chapter`)
  }
  for (const zone of duplicates(zones, (z) => z.id)) problems.push(`zone ${zone}: duplicate zone`)
  for (const id of duplicates(sources, (s) => s.id)) problems.push(`source ${id}: duplicate id`)
  for (const source of sources) {
    if (!source.url.startsWith('https://')) problems.push(`source ${source.id}: URL must use https`)
  }

  const chapters = new Set(ata.map((c) => c.chapter))
  const zoneIds = new Set<string>(zones.map((z) => z.id))
  const ids = new Set(components.map((c) => c.id))

  for (const id of duplicates(components, (c) => c.id)) problems.push(`${id}: duplicate id`)

  for (const component of components) {
    const { id } = component
    const parsed = ComponentSchema.safeParse(component)
    if (!parsed.success) {
      problems.push(`${id}: ${parsed.error.issues[0]?.message ?? 'invalid record'}`)
      continue
    }

    if (!chapters.has(component.ata)) problems.push(`${id}: unknown ATA chapter "${component.ata}"`)

    if (!zoneIds.has(component.zone)) {
      problems.push(`${id}: unknown zone "${component.zone}"`)
    } else if (component.zone === SYSTEMS_ZONE) {
      problems.push(`${id}: zone ${SYSTEMS_ZONE} holds system modules, not components`)
    } else if (component.zone === COCKPIT_ZONE && component.model !== 'cockpit') {
      problems.push(`${id}: zone ${COCKPIT_ZONE} components must use the cockpit model`)
    } else if (component.zone !== COCKPIT_ZONE && component.model === 'cockpit') {
      problems.push(`${id}: only zone ${COCKPIT_ZONE} components may use the cockpit model`)
    }

    const mirrored = twinOf(id)
    if (mirrored) {
      if (!ids.has(mirrored.twin)) problems.push(`${id}: missing twin "${mirrored.twin}"`)
      if (component.side !== mirrored.side) {
        problems.push(
          `${id}: side "${component.side ?? 'none'}" does not match the id (expected ${mirrored.side})`,
        )
      }
    }
  }

  return problems
}
