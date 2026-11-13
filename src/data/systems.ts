import type { System } from './schema'

/** The ten educational system modules, each with the ATA chapter that covers it. */
export const SYSTEMS: System[] = [
  { id: 'electrical', title: 'Electrical power', ata: '24' },
  { id: 'hydraulic', title: 'Hydraulic power', ata: '29' },
  { id: 'pneumatic', title: 'Pneumatic systems', ata: '36' },
  { id: 'air-conditioning', title: 'Air conditioning', ata: '21' },
  { id: 'flight-controls', title: 'Flight controls', ata: '27' },
  { id: 'landing-gear', title: 'Landing gear', ata: '32' },
  { id: 'fuel', title: 'Fuel systems', ata: '28' },
  { id: 'engine', title: 'Engine systems', ata: '72' },
  { id: 'apu', title: 'Auxiliary Power Unit', ata: '49' },
  { id: 'fire-protection', title: 'Fire protection', ata: '26' },
]
