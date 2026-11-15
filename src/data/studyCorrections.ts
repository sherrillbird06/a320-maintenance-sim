/**
 * Corrections to the study guide, each checked against a public FAA document.
 *
 * The imported guide is never edited. A correction replaces one phrase of one
 * point when the guide is loaded, and the interface shows what was changed and
 * the document it was checked against, so nothing is altered silently.
 *
 * Only points that disagreed with a source appear here. Points that were
 * checked and agreed are in `studyChecks.ts`; the rest is still unchecked.
 */
export interface StudyCorrection {
  topicId: string
  /** Index of the point within the topic. */
  point: number
  /** The phrase in the guide as supplied. */
  from: string
  /** The phrase that replaces it. */
  to: string
  /** Id in SOURCES of the document it was checked against. */
  sourceId: string
  /** Where in that document. */
  citation: string
}

export const STUDY_CORRECTIONS: StudyCorrection[] = [
  {
    topicId: 'fasteners_and_hardware',
    point: 0,
    from: 'a raised dash indicates a corrosion-resistant steel bolt, two raised dashes an aluminum-alloy bolt, and a plain/asterisk head a standard steel bolt',
    to: 'a standard steel bolt carries a raised dash or an asterisk, a corrosion-resistant steel bolt a single dash, and an aluminum-alloy bolt two raised dashes; a bolt with no marking is low strength',
    sourceId: 'faa_ac_43_13_1b',
    citation: 'AC 43.13-1B, Chapter 7, bolt identification',
  },
  {
    topicId: 'fasteners_and_hardware',
    point: 2,
    from: "2017-T4 and 2024-T3/T4 ('DD' rivets — require heat treatment/icebox storage before driving because they age-harden quickly at room temperature)",
    to: "2017-T ('D' rivets, a raised dot on the head) and 2024-T ('DD' rivets, two raised dashes) — 2017 rivets above 3/16 inch in diameter and all 2024 rivets are kept refrigerated, or re-heat-treated just before driving, because they would otherwise be too hard to drive",
    sourceId: 'faa_ac_43_13_1b',
    citation: 'AC 43.13-1B, paragraph 4-57 and Table 4-8; FAA-H-8083-30B, Chapter 7',
  },
  {
    topicId: 'regulations_privileges_and_records',
    point: 1,
    from: 'a mechanic must have performed maintenance on an appropriate class of aircraft within the preceding 24 months, or otherwise reestablish recency as the rule allows',
    to: 'within the preceding 24 months a mechanic must have spent at least 6 months working as a mechanic under the certificate and rating, technically supervising other mechanics, or supervising maintenance in an executive capacity (or a combination of these), or the FAA must have found the mechanic able to do the work',
    sourceId: 'cfr_14_part_65',
    citation: '14 CFR 65.83; also stated in FAA-H-8083-30B',
  },
  {
    topicId: 'wood_structures',
    point: 2,
    from: 'typically about a 12:1 slope for solid wood spar splices',
    to: 'no steeper than 15:1 for a spar splice; 12:1 is the steepest slope allowed for a scarf in plywood skin',
    sourceId: 'faa_ac_43_13_1b',
    citation: 'AC 43.13-1B, Figure 1-5 and paragraph 1-51; FAA-H-8083-31B, Chapter 6',
  },
  {
    topicId: 'turbine_engine_types',
    point: 2,
    from: 'efficient in the roughly 180–350 mph range',
    to: 'most efficient at speeds between 250 and 400 mph',
    sourceId: 'faa_afh',
    citation: 'Airplane Flying Handbook, Chapter 15',
  },
  {
    topicId: 'basic_electricity',
    point: 4,
    from: 'fully charged specific gravity is roughly 1.275–1.300',
    to: 'fully charged specific gravity is between 1.275 and 1.310',
    sourceId: 'faa_amt_general',
    citation: 'FAA-H-8083-30B, Chapter 5, specific gravity',
  },
  {
    topicId: 'sheet_metal_structures',
    point: 2,
    from: 'roughly 6–8× diameter typical pitch',
    to: 'a pitch of at least 3× diameter and usually 4 to 6×',
    sourceId: 'faa_amt_airframe',
    citation: 'FAA-H-8083-31B, Chapter 4, rivet spacing',
  },
  {
    topicId: 'engine_fuel_and_fuel_metering',
    point: 1,
    from: 'with humid conditions roughly in the 20–90°F range',
    to: 'at carburetor air temperatures as high as 100°F, even at relative humidity well below 100 percent',
    sourceId: 'faa_amt_powerplant',
    citation: 'FAA-H-8083-32B, Chapter 2, carburetor icing',
  },
]
