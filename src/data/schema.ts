import { z } from 'zod'

/**
 * Shapes of all simulator content. Content is data: every record here is plain,
 * serialisable and validated, and the 3D scene and UI are driven from it.
 */

/** Lowercase words joined by single underscores. A component id is also its glTF node name. */
export const ID_PATTERN = /^[a-z0-9]+(_[a-z0-9]+)*$/
const Id = z.string().regex(ID_PATTERN, 'id must be lowercase words joined by single underscores')

const AtaChapterNumber = z.string().regex(/^\d{2}$/, 'ATA reference must be a two-digit chapter')

export const ZoneIdSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'F'])
export type ZoneId = z.infer<typeof ZoneIdSchema>

export const SystemIdSchema = z.enum([
  'electrical',
  'hydraulic',
  'pneumatic',
  'air-conditioning',
  'flight-controls',
  'landing-gear',
  'fuel',
  'engine',
  'apu',
  'fire-protection',
])
export type SystemId = z.infer<typeof SystemIdSchema>

export const SideSchema = z.enum(['LH', 'RH'])
export type Side = z.infer<typeof SideSchema>

export const ModelIdSchema = z.enum(['exterior', 'cockpit'])
export type ModelId = z.infer<typeof ModelIdSchema>

export const AtaChapterSchema = z.object({
  chapter: AtaChapterNumber,
  title: z.string().min(1),
  /** Named in the owner's brief. */
  fromBrief: z.boolean(),
  /** Has a page in the technical library. Other chapters appear only as report choices. */
  library: z.boolean(),
})
export type AtaChapter = z.infer<typeof AtaChapterSchema>

export const ZoneSchema = z.object({ id: ZoneIdSchema, title: z.string().min(1) })
export type Zone = z.infer<typeof ZoneSchema>

export const SystemSchema = z.object({
  id: SystemIdSchema,
  title: z.string().min(1),
  ata: AtaChapterNumber,
})
export type System = z.infer<typeof SystemSchema>

export const SourceSchema = z.object({
  id: Id,
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().min(1),
  licence: z.string().min(1),
  usedFor: z.string().min(1),
})
export type Source = z.infer<typeof SourceSchema>

export const ComponentSchema = z.object({
  id: Id,
  name: z.string().min(1),
  zone: ZoneIdSchema,
  ata: AtaChapterNumber,
  side: SideSchema.optional(),
  /** Which model file holds this component's mesh. */
  model: ModelIdSchema,
  systems: z.array(SystemIdSchema),
  // The three text fields below become required in Milestone 3, when component info is shown.
  description: z.string().min(1).optional(),
  normalCondition: z.string().min(1).optional(),
  checks: z.array(z.string().min(1)).min(1).optional(),
})
export type Component = z.infer<typeof ComponentSchema>

// ---------------------------------------------------------------------------
// Shapes used from Milestone 4 on. Defined now so the registry, scenario
// generator and logbook are built against one agreed vocabulary.
// ---------------------------------------------------------------------------

const Vec3 = z.tuple([z.number(), z.number(), z.number()])

export const DefectCategorySchema = z.enum([
  'tire',
  'hydraulic-leak',
  'panel-damage',
  'fastener',
  'foreign-object-damage',
  'light',
  'corrosion',
  'seal',
  'abnormal-condition',
])
export type DefectCategory = z.infer<typeof DefectCategorySchema>

/** How a defect is drawn on the aircraft. */
export const DefectVisualSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('decal'), texture: z.string().min(1), sizeM: z.number().positive() }),
  z.object({ kind: z.literal('mesh-swap'), variantNode: Id }),
  z.object({ kind: z.literal('hidden-part'), node: Id }),
  z.object({ kind: z.literal('drip'), texture: z.string().min(1), sizeM: z.number().positive() }),
])
export type DefectVisual = z.infer<typeof DefectVisualSchema>

/** A hand-placed spot on a component where a defect may appear, in the model's own space. */
export const DefectAnchorSchema = z.object({
  componentId: Id,
  position: Vec3,
  normal: Vec3,
})
export type DefectAnchor = z.infer<typeof DefectAnchorSchema>

export const HydraulicSystemSchema = z.enum(['green', 'blue', 'yellow'])
export type HydraulicSystem = z.infer<typeof HydraulicSystemSchema>

export const DefectTypeSchema = z.object({
  id: Id,
  category: DefectCategorySchema,
  label: z.string().min(1),
  anchors: z.array(DefectAnchorSchema).min(1),
  visual: DefectVisualSchema,
  /** The write-up a technician would give, and plausible wrong ones offered beside it. */
  correctCondition: z.string().min(1),
  wrongConditions: z.array(z.string().min(1)).min(2),
  /** Why this is a discrepancy and how it is recognised. Never cites a limit. */
  explanation: z.string().min(1),
  libraryChapters: z.array(AtaChapterNumber).min(1),
})
export type DefectType = z.infer<typeof DefectTypeSchema>

/** A normal feature that a novice may mistake for damage. Reporting it is an incorrect finding. */
export const DistractorSchema = z.object({
  id: Id,
  componentId: Id,
  name: z.string().min(1),
  explanation: z.string().min(1),
})
export type Distractor = z.infer<typeof DistractorSchema>

export const AircraftConfigSchema = z.object({
  flapsExtended: z.boolean(),
  slatsExtended: z.boolean(),
  spoilersRaised: z.boolean(),
  openDoors: z.array(Id),
})
export type AircraftConfig = z.infer<typeof AircraftConfigSchema>

export const ScenarioTemplateSchema = z.object({
  id: Id,
  level: z.number().int().min(1).max(7),
  title: z.string().min(1),
  zones: z.array(ZoneIdSchema).min(1),
  defectCount: z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  defectPool: z.array(DefectCategorySchema).min(1),
  distractorCount: z.number().int().min(0),
  aircraftConfig: AircraftConfigSchema,
  referenceChapters: z.array(AtaChapterNumber),
  parTimeMinutes: z.number().positive(),
})
export type ScenarioTemplate = z.infer<typeof ScenarioTemplateSchema>

/** What the player records about one suspected discrepancy. */
export const FindingSchema = z.object({
  componentId: Id,
  taggedPoint: Vec3,
  ata: AtaChapterNumber,
  category: DefectCategorySchema,
  condition: z.string().min(1),
  hydraulicSystem: HydraulicSystemSchema.optional(),
  /** Saved with the report but not graded. */
  remarks: z.string(),
})
export type Finding = z.infer<typeof FindingSchema>

export const LogbookEntrySchema = z.object({
  workOrder: z.string().min(1),
  registration: z.string().min(1),
  model: z.string().min(1),
  msn: z.string().min(1),
  assignment: z.string().min(1),
  zones: z.array(ZoneIdSchema).min(1),
  ataReferences: z.array(AtaChapterNumber),
  findings: z.array(FindingSchema),
  technicianName: z.string().min(1),
  technicianId: z.string().min(1),
  status: z.enum(['open', 'in-progress', 'completed']),
  /** ISO 8601 date-time the entry was opened. */
  openedAt: z.string().min(1),
  timeTakenSeconds: z.number().min(0),
  signedOff: z.boolean(),
})
export type LogbookEntry = z.infer<typeof LogbookEntrySchema>
