import { ataTitle } from './ata'
import { COMPONENTS } from './components'
import { ZONES } from './zones'

export type AssetGroup = 'hangar' | 'access' | 'gse' | 'props' | 'defects' | 'people' | 'materials'

export interface EnvironmentAsset {
  id: string
  name: string
  group: AssetGroup
  /** Milestone in which the asset is built. */
  milestone: number
}

const GROUP_TITLES: Record<AssetGroup, string> = {
  hangar: 'Hangar',
  access: 'Access equipment',
  gse: 'Ground support equipment',
  props: 'Props',
  defects: 'Defect visuals',
  people: 'People',
  materials: 'Materials',
}

function group(name: AssetGroup, milestone: number, items: [id: string, name: string][]) {
  return items.map(([id, itemName]): EnvironmentAsset => ({
    id,
    name: itemName,
    group: name,
    milestone,
  }))
}

/** Everything that is not part of the aircraft: the hangar, its equipment, and defect visuals. */
export const ENVIRONMENT_ASSETS: EnvironmentAsset[] = [
  ...group('hangar', 2, [
    ['hangar_shell', 'Hangar walls, truss roof and sliding doors'],
    ['hangar_floor', 'Painted concrete floor with parking and safety markings'],
    ['hangar_lights', 'High-bay light fittings'],
    ['documentation_station', 'Aircraft documentation station'],
    ['stores_wall', 'Offices and stores wall'],
  ]),
  ...group('access', 2, [
    ['engine_stand', 'Engine access stand'],
    ['wing_stand', 'Wing access stand'],
    ['tail_lift', 'Tail lift platform'],
    ['door_stairs', 'Stairs at the forward left door'],
    ['step_ladder', 'Step ladder'],
  ]),
  ...group('gse', 2, [
    ['tow_tug', 'Tow tug'],
    ['tow_bar', 'Tow bar'],
    ['ground_power_unit', 'Ground power unit'],
    ['hydraulic_cart', 'Hydraulic service cart'],
    ['nitrogen_cart', 'Nitrogen service cart'],
    ['axle_jack', 'Axle jack (static)'],
    ['drip_tray', 'Drip tray'],
  ]),
  ...group('props', 2, [
    ['toolbox_roll_cab', 'Roll-cab toolbox'],
    ['workbench', 'Workbench'],
    ['safety_cone', 'Safety cone'],
    ['wheel_chock', 'Wheel chock'],
    ['gear_pin', 'Landing gear ground lock pin with streamer'],
    ['fire_extinguisher', 'Wheeled fire extinguisher'],
    ['waste_bin', 'Waste and FOD bin'],
    ['hangar_signage', 'Safety signage'],
  ]),
  ...group('defects', 4, [
    ['defect_tire_cut', 'Tire cut'],
    ['defect_tire_wear', 'Tire tread worn through'],
    ['defect_hydraulic_streak', 'Hydraulic fluid streak'],
    ['defect_hydraulic_drip', 'Hydraulic fluid drip and puddle'],
  ]),
  ...group('defects', 6, [
    ['defect_dent', 'Skin dent'],
    ['defect_scratch', 'Skin scratch or gouge'],
    ['defect_missing_fastener', 'Missing fastener'],
    ['defect_damaged_fastener', 'Damaged fastener'],
    ['defect_fan_blade_nick', 'Fan blade leading-edge nick'],
    ['defect_cracked_lens', 'Cracked light lens'],
    ['defect_corrosion', 'Corrosion patch'],
    ['defect_torn_seal', 'Torn door or panel seal'],
  ]),
  ...group('people', 2, [['technician', 'Maintenance technician (cut if no licence-clean model)']]),
  ...group('materials', 1, [
    ['mat_fuselage_paint', 'Fuselage paint with panel lines and rivets'],
    ['mat_livery', 'Livery and tail stripes'],
    ['mat_stencils', 'Exterior stencils and placards'],
    ['mat_tire_rubber', 'Tire rubber'],
    ['mat_gear_metal', 'Landing gear painted and plated metal'],
    ['mat_glass', 'Window glass'],
  ]),
  ...group('materials', 2, [
    ['mat_concrete', 'Hangar floor concrete (CC0 scan)'],
    ['mat_painted_steel', 'Painted structural steel'],
    ['mat_yellow_equipment', 'Equipment safety-yellow paint'],
  ]),
]

/** Markdown for docs/asset-list.md. */
export function renderAssetListDoc(): string {
  const lines = [
    '# Asset list',
    '',
    'Generated from `src/data/components` and `src/data/assets.ts` — edit the data, then run',
    '`npm run docs`.',
    '',
    `## Aircraft — ${COMPONENTS.length} inspectable components`,
    '',
    'Each component is one mesh whose name equals its id. Zone E is the separate cockpit model;',
    'everything else is the exterior model.',
    '',
  ]

  for (const zone of ZONES) {
    const components = COMPONENTS.filter((c) => c.zone === zone.id)
    if (components.length === 0) continue
    lines.push(
      `### Zone ${zone.id} — ${zone.title} (${components.length})`,
      '',
      '| Id | Component | ATA | Side |',
      '| --- | --- | --- | --- |',
    )
    for (const c of components) {
      lines.push(
        `| \`${c.id}\` | ${c.name} | ${c.ata} ${ataTitle(c.ata) ?? ''} | ${c.side ?? '—'} |`,
      )
    }
    lines.push('')
  }

  lines.push('## Hangar, equipment and effects', '')
  for (const [groupId, title] of Object.entries(GROUP_TITLES)) {
    const assets = ENVIRONMENT_ASSETS.filter((a) => a.group === groupId)
    lines.push(`### ${title}`, '', '| Id | Asset | Milestone |', '| --- | --- | --- |')
    for (const a of assets) lines.push(`| \`${a.id}\` | ${a.name} | ${a.milestone} |`)
    lines.push('')
  }

  return lines.join('\n')
}
