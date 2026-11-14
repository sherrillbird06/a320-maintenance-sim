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
    checklist: [
      {
        id: 'nose_tires',
        title: 'Nose gear tires, both',
        components: ['nlg_tire_lh', 'nlg_tire_rh'],
      },
      {
        id: 'left_main_tires',
        title: 'Left main gear tires, positions 1 and 2',
        components: ['mlg_tire_1', 'mlg_tire_2'],
      },
      {
        id: 'right_main_tires',
        title: 'Right main gear tires, positions 3 and 4',
        components: ['mlg_tire_3', 'mlg_tire_4'],
      },
    ],
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
    checklist: [
      { id: 'eng1_inlet', title: 'Engine 1 inlet cowl and lip', components: ['eng1_inlet_cowl'] },
      { id: 'eng1_fan', title: 'Engine 1 fan blades', components: ['eng1_fan'] },
      { id: 'eng2_inlet', title: 'Engine 2 inlet cowl and lip', components: ['eng2_inlet_cowl'] },
      { id: 'eng2_fan', title: 'Engine 2 fan blades', components: ['eng2_fan'] },
    ],
    parTimeMinutes: 10,
  },
]
