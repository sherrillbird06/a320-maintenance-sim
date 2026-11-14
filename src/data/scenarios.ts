import type { ScenarioTemplate } from './schema'

/** Inspection assignments. Each run of a template is randomized from a seed. */
export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'lg_tire_inspection',
    level: 4,
    title: 'Landing gear inspection — wheels and tires',
    zones: ['C'],
    defectCount: { min: 1, max: 2 },
    defectPool: ['tire'],
    distractorCount: 0,
    aircraftConfig: {
      flapsExtended: false,
      slatsExtended: false,
      spoilersRaised: false,
      openDoors: [],
    },
    referenceChapters: ['32', '12'],
    parTimeMinutes: 10,
  },
  {
    id: 'engine_inlet_inspection',
    level: 6,
    title: 'Engine inspection — inlet and fan',
    zones: ['B'],
    defectCount: { min: 1, max: 2 },
    defectPool: ['foreign-object-damage'],
    distractorCount: 0,
    aircraftConfig: {
      flapsExtended: false,
      slatsExtended: false,
      spoilersRaised: false,
      openDoors: [],
    },
    referenceChapters: ['71', '72'],
    parTimeMinutes: 10,
  },
]
