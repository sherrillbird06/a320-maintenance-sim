import type { Source } from './schema'

const FAA_HANDBOOKS = 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation'
const US_GOV = 'U.S. Government work, public domain'

/**
 * Every public document the simulator's facts and assets come from. Aircraft
 * facts in data name one of these by id; a fact with no source is left out.
 */
export const SOURCES: Source[] = [
  {
    id: 'airbus_ac_a320',
    title:
      'A320 Aircraft Characteristics – Airport and Maintenance Planning, Revision 46 (Jul 01/26)',
    publisher: 'Airbus S.A.S.',
    url: 'https://aircraft.airbus.com/en/customer-care/fleet-wide-care/airport-operations-and-aircraft-characteristics/aircraft-characteristics',
    licence:
      '© Airbus. Published by Airbus for airport and maintenance planning. Individual dimensions are cited; no text or figures are reproduced.',
    usedFor:
      'Overall dimensions, ground clearances, and the positions of doors, landing gear, lights, probes and service points.',
  },
  {
    id: 'easa_tcds_a064',
    title: 'Type-Certificate Data Sheet EASA.A.064, Airbus A318 – A319 – A320 – A321, Issue 62',
    publisher: 'European Union Aviation Safety Agency',
    url: 'https://www.easa.europa.eu/en/downloads/16507/en',
    licence: '© European Union Aviation Safety Agency. Cited for model designations only.',
    usedFor: 'Model and engine designations.',
  },
  {
    id: 'faa_amt_general',
    title: 'Aviation Maintenance Technician Handbook – General (FAA-H-8083-30B)',
    publisher: 'Federal Aviation Administration',
    url: FAA_HANDBOOKS,
    licence: US_GOV,
    usedFor: 'General inspection concepts, corrosion, hardware, documentation practice.',
  },
  {
    id: 'faa_amt_airframe',
    title: 'Aviation Maintenance Technician Handbook – Airframe (FAA-H-8083-31B)',
    publisher: 'Federal Aviation Administration',
    url: FAA_HANDBOOKS,
    licence: US_GOV,
    usedFor:
      'General knowledge of structures, flight controls, landing gear, hydraulics, fuel and cabin systems.',
  },
  {
    id: 'faa_amt_powerplant',
    title: 'Aviation Maintenance Technician Handbook – Powerplant (FAA-H-8083-32B)',
    publisher: 'Federal Aviation Administration',
    url: FAA_HANDBOOKS,
    licence: US_GOV,
    usedFor: 'General knowledge of turbine engines, engine inspection and auxiliary power units.',
  },
  {
    id: 'faa_ac_43_13_1b',
    title:
      'Advisory Circular 43.13-1B, Acceptable Methods, Techniques, and Practices – Aircraft Inspection and Repair',
    publisher: 'Federal Aviation Administration',
    url: 'https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentid/99861',
    licence: US_GOV,
    usedFor:
      'General inspection vocabulary and defect descriptions; not used for any limit or repair on the aircraft. Also used to check hardware, rivet and wood-splice facts in the A&P study guide.',
  },
  {
    id: 'cfr_14_part_65',
    title: '14 CFR Part 65, Certification: Airmen Other Than Flight Crewmembers, § 65.83',
    publisher: 'U.S. Government (Code of Federal Regulations)',
    url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-65/subpart-D/section-65.83',
    licence: US_GOV,
    usedFor: 'Mechanic recent-experience requirement in the A&P study guide.',
  },
  {
    id: 'faa_afh',
    title: 'Airplane Flying Handbook (FAA-H-8083-3C), Chapter 15',
    publisher: 'Federal Aviation Administration',
    url: FAA_HANDBOOKS,
    licence: US_GOV,
    usedFor: 'Turboprop efficient speed range in the A&P study guide.',
  },
  {
    id: 'faa_jasc',
    title: 'Joint Aircraft System/Component (JASC) Code Table and Definitions',
    publisher: 'Federal Aviation Administration',
    url: 'https://sdrs.faa.gov/documents/JASC_Code.pdf',
    licence: US_GOV,
    usedFor: 'ATA-based chapter numbers and titles.',
  },
  {
    id: 'polyhaven_hangar_interior',
    title: 'Hangar Interior (HDRI), photography by Dimitrios Savva',
    publisher: 'Poly Haven',
    url: 'https://polyhaven.com/a/hangar_interior',
    licence: 'CC0 1.0',
    usedFor: 'Image-based lighting and reflections (public/env).',
  },
  {
    id: 'polyhaven_hangar_concrete_floor',
    title: 'Hangar Concrete Floor (texture set) by Dimitrios Savva',
    publisher: 'Poly Haven',
    url: 'https://polyhaven.com/a/hangar_concrete_floor',
    licence: 'CC0 1.0',
    usedFor: 'Hangar floor colour, normal and roughness maps (public/textures/floor).',
  },
]

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id)
}

/** Markdown for docs/sources.md. */
export function renderSourcesDoc(): string {
  const lines = [
    '# Sources',
    '',
    'Generated from `src/data/sources.ts` — edit the data, then run `npm run docs`.',
    '',
    'Every aircraft fact in the simulator cites one of these public documents. Anything that',
    'could not be verified against them is left out. None of them is reproduced here, and the',
    'simulator contains no approved maintenance data.',
    '',
  ]
  for (const source of SOURCES) {
    lines.push(
      `## ${source.title}`,
      '',
      `- **Id:** \`${source.id}\``,
      `- **Publisher:** ${source.publisher}`,
      `- **Link:** <${source.url}>`,
      `- **Licence:** ${source.licence}`,
      `- **Used for:** ${source.usedFor}`,
      '',
    )
  }
  return lines.join('\n')
}
