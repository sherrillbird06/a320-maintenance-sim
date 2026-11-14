import { AIRCRAFT } from '../data/aircraft'
import type { Finding, LogbookEntry, ScenarioTemplate } from '../data/schema'
import type { Scenario } from './scenario'

export interface Technician {
  name: string
  id: string
}

/** Opens a logbook entry for a work order. `openedAt` is an ISO 8601 date-time. */
export function openEntry(
  scenario: Scenario,
  template: ScenarioTemplate,
  technician: Technician,
  openedAt: string,
): LogbookEntry {
  return {
    workOrder: scenario.workOrder,
    registration: AIRCRAFT.registration.value,
    model: AIRCRAFT.model,
    msn: AIRCRAFT.msn.value,
    assignment: template.title,
    zones: [...template.zones],
    ataReferences: [...template.referenceChapters],
    findings: [],
    technicianName: technician.name,
    technicianId: technician.id,
    status: 'in-progress',
    openedAt,
    timeTakenSeconds: 0,
    signedOff: false,
  }
}

/** Returns the completed entry. An entry cannot be signed without knowing who signed it. */
export function signOff(
  entry: LogbookEntry,
  findings: readonly Finding[],
  timeTakenSeconds: number,
): LogbookEntry {
  if (!entry.technicianName.trim() || !entry.technicianId.trim()) {
    throw new Error('A technician name and ID are required to sign off an inspection')
  }
  return {
    ...entry,
    findings: [...findings],
    timeTakenSeconds,
    status: 'completed',
    signedOff: true,
  }
}
