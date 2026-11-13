# Asset list

Generated from `src/data/components` and `src/data/assets.ts` — edit the data, then run
`npm run docs`.

## Aircraft — 254 inspectable components

Each component is one mesh whose name equals its id. Zone E is the separate cockpit model;
everything else is the exterior model.

### Zone A — Forward fuselage (46)

| Id | Component | ATA | Side |
| --- | --- | --- | --- |
| `radome` | Radome | 53 Fuselage | — |
| `nose_skin_lh` | Nose skin, left | 53 Fuselage | LH |
| `nose_skin_rh` | Nose skin, right | 53 Fuselage | RH |
| `fwd_fuselage_skin_lh` | Forward fuselage skin, left | 53 Fuselage | LH |
| `fwd_fuselage_skin_rh` | Forward fuselage skin, right | 53 Fuselage | RH |
| `fwd_fuselage_belly` | Forward fuselage lower skin | 53 Fuselage | — |
| `windshield_lh` | Windshield, left | 56 Windows | LH |
| `windshield_rh` | Windshield, right | 56 Windows | RH |
| `sliding_window_lh` | Sliding side window, left | 56 Windows | LH |
| `sliding_window_rh` | Sliding side window, right | 56 Windows | RH |
| `fixed_side_window_lh` | Fixed side window, left | 56 Windows | LH |
| `fixed_side_window_rh` | Fixed side window, right | 56 Windows | RH |
| `cabin_windows_lh` | Cabin windows, left | 56 Windows | LH |
| `cabin_windows_rh` | Cabin windows, right | 56 Windows | RH |
| `pax_door_fwd_lh` | Forward passenger/crew door, left | 52 Doors | LH |
| `pax_door_fwd_rh` | Forward passenger/crew door, right | 52 Doors | RH |
| `fwd_cargo_door` | Forward cargo door | 52 Doors | RH |
| `fwd_cargo_compartment` | Forward cargo compartment | 25 Equipment / Furnishings | — |
| `avionics_bay_access_door` | Avionics compartment access door | 52 Doors | — |
| `external_power_door` | External power receptacle door | 24 Electrical Power | — |
| `pitot_probe_1` | Pitot probe 1 | 34 Navigation | — |
| `pitot_probe_2` | Pitot probe 2 | 34 Navigation | — |
| `pitot_probe_3` | Pitot probe 3 | 34 Navigation | — |
| `static_probe_1_lh` | Static probe 1, left | 34 Navigation | LH |
| `static_probe_1_rh` | Static probe 1, right | 34 Navigation | RH |
| `static_probe_2_lh` | Static probe 2, left | 34 Navigation | LH |
| `static_probe_2_rh` | Static probe 2, right | 34 Navigation | RH |
| `static_probe_stby_lh` | Standby static probe, left | 34 Navigation | LH |
| `static_probe_stby_rh` | Standby static probe, right | 34 Navigation | RH |
| `aoa_sensor_1` | Angle-of-attack sensor 1 | 34 Navigation | — |
| `aoa_sensor_2` | Angle-of-attack sensor 2 | 34 Navigation | — |
| `aoa_sensor_3` | Angle-of-attack sensor 3 | 34 Navigation | — |
| `tat_probe_1` | Total air temperature probe 1 | 34 Navigation | — |
| `tat_probe_2` | Total air temperature probe 2 | 34 Navigation | — |
| `vhf_antenna_1` | VHF antenna 1 | 23 Communications | — |
| `vhf_antenna_2` | VHF antenna 2 | 23 Communications | — |
| `vhf_antenna_3` | VHF antenna 3 | 23 Communications | — |
| `tcas_antenna_top` | TCAS antenna, upper | 34 Navigation | — |
| `tcas_antenna_bottom` | TCAS antenna, lower | 34 Navigation | — |
| `taxi_light` | Taxi light | 33 Lights | — |
| `takeoff_light` | Take-off light | 33 Lights | — |
| `runway_turnoff_light_lh` | Runway turn-off light, left | 33 Lights | LH |
| `runway_turnoff_light_rh` | Runway turn-off light, right | 33 Lights | RH |
| `upper_beacon` | Upper anti-collision beacon | 33 Lights | — |
| `lower_beacon` | Lower anti-collision beacon | 33 Lights | — |
| `drain_mast_fwd` | Forward drain mast | 38 Water / Waste | — |

### Zone B — Wings and engines (90)

| Id | Component | ATA | Side |
| --- | --- | --- | --- |
| `wing_upper_skin_lh` | Wing upper surface, left | 57 Wings | LH |
| `wing_upper_skin_rh` | Wing upper surface, right | 57 Wings | RH |
| `wing_lower_skin_lh` | Wing lower surface, left | 57 Wings | LH |
| `wing_lower_skin_rh` | Wing lower surface, right | 57 Wings | RH |
| `wingtip_fence_lh` | Wing tip fence, left | 57 Wings | LH |
| `wingtip_fence_rh` | Wing tip fence, right | 57 Wings | RH |
| `wing_access_panels_lh` | Wing lower access panels, left | 57 Wings | LH |
| `wing_access_panels_rh` | Wing lower access panels, right | 57 Wings | RH |
| `flap_track_fairing_2_lh` | Flap track fairing 2, left | 57 Wings | LH |
| `flap_track_fairing_2_rh` | Flap track fairing 2, right | 57 Wings | RH |
| `flap_track_fairing_3_lh` | Flap track fairing 3, left | 57 Wings | LH |
| `flap_track_fairing_3_rh` | Flap track fairing 3, right | 57 Wings | RH |
| `flap_track_fairing_4_lh` | Flap track fairing 4, left | 57 Wings | LH |
| `flap_track_fairing_4_rh` | Flap track fairing 4, right | 57 Wings | RH |
| `belly_fairing` | Belly fairing | 53 Fuselage | — |
| `slat_1_lh` | Slat 1, left | 27 Flight Controls | LH |
| `slat_1_rh` | Slat 1, right | 27 Flight Controls | RH |
| `slat_2_lh` | Slat 2, left | 27 Flight Controls | LH |
| `slat_2_rh` | Slat 2, right | 27 Flight Controls | RH |
| `slat_3_lh` | Slat 3, left | 27 Flight Controls | LH |
| `slat_3_rh` | Slat 3, right | 27 Flight Controls | RH |
| `slat_4_lh` | Slat 4, left | 27 Flight Controls | LH |
| `slat_4_rh` | Slat 4, right | 27 Flight Controls | RH |
| `slat_5_lh` | Slat 5, left | 27 Flight Controls | LH |
| `slat_5_rh` | Slat 5, right | 27 Flight Controls | RH |
| `flap_inboard_lh` | Inboard flap, left | 27 Flight Controls | LH |
| `flap_inboard_rh` | Inboard flap, right | 27 Flight Controls | RH |
| `flap_outboard_lh` | Outboard flap, left | 27 Flight Controls | LH |
| `flap_outboard_rh` | Outboard flap, right | 27 Flight Controls | RH |
| `spoiler_1_lh` | Spoiler 1, left | 27 Flight Controls | LH |
| `spoiler_1_rh` | Spoiler 1, right | 27 Flight Controls | RH |
| `spoiler_2_lh` | Spoiler 2, left | 27 Flight Controls | LH |
| `spoiler_2_rh` | Spoiler 2, right | 27 Flight Controls | RH |
| `spoiler_3_lh` | Spoiler 3, left | 27 Flight Controls | LH |
| `spoiler_3_rh` | Spoiler 3, right | 27 Flight Controls | RH |
| `spoiler_4_lh` | Spoiler 4, left | 27 Flight Controls | LH |
| `spoiler_4_rh` | Spoiler 4, right | 27 Flight Controls | RH |
| `spoiler_5_lh` | Spoiler 5, left | 27 Flight Controls | LH |
| `spoiler_5_rh` | Spoiler 5, right | 27 Flight Controls | RH |
| `aileron_lh` | Aileron, left | 27 Flight Controls | LH |
| `aileron_rh` | Aileron, right | 27 Flight Controls | RH |
| `refuel_coupling` | Refuel/defuel coupling | 28 Fuel | RH |
| `refuel_panel` | Refuel/defuel control panel | 28 Fuel | RH |
| `gravity_refuel_cap_lh` | Overwing gravity refuel cap, left | 28 Fuel | LH |
| `gravity_refuel_cap_rh` | Overwing gravity refuel cap, right | 28 Fuel | RH |
| `fuel_vent_inlet_lh` | Fuel tank vent inlet, left | 28 Fuel | LH |
| `fuel_vent_inlet_rh` | Fuel tank vent inlet, right | 28 Fuel | RH |
| `fuel_level_indicators_lh` | Magnetic fuel level indicators, left | 28 Fuel | LH |
| `fuel_level_indicators_rh` | Magnetic fuel level indicators, right | 28 Fuel | RH |
| `pack_ram_air_inlet_lh` | Air conditioning pack ram air inlet, left | 21 Air Conditioning | LH |
| `pack_ram_air_inlet_rh` | Air conditioning pack ram air inlet, right | 21 Air Conditioning | RH |
| `lp_ground_air_connection` | Low-pressure ground air connection | 21 Air Conditioning | — |
| `hp_ground_air_connection` | High-pressure ground air connection | 36 Pneumatic | — |
| `rat_door` | Ram air turbine door | 29 Hydraulic Power | — |
| `overwing_exit_fwd_lh` | Forward overwing emergency exit, left | 52 Doors | LH |
| `overwing_exit_fwd_rh` | Forward overwing emergency exit, right | 52 Doors | RH |
| `overwing_exit_aft_lh` | Aft overwing emergency exit, left | 52 Doors | LH |
| `overwing_exit_aft_rh` | Aft overwing emergency exit, right | 52 Doors | RH |
| `nav_light_lh` | Wing navigation light, left | 33 Lights | LH |
| `nav_light_rh` | Wing navigation light, right | 33 Lights | RH |
| `wing_strobe_light_lh` | Wing strobe light, left | 33 Lights | LH |
| `wing_strobe_light_rh` | Wing strobe light, right | 33 Lights | RH |
| `landing_light_lh` | Retractable landing light, left | 33 Lights | LH |
| `landing_light_rh` | Retractable landing light, right | 33 Lights | RH |
| `wing_scan_light_lh` | Wing and engine scan light, left | 33 Lights | LH |
| `wing_scan_light_rh` | Wing and engine scan light, right | 33 Lights | RH |
| `static_dischargers_wing_lh` | Wing static dischargers, left | 23 Communications | LH |
| `static_dischargers_wing_rh` | Wing static dischargers, right | 23 Communications | RH |
| `eng1_inlet_cowl` | Engine 1 inlet cowl | 71 Power Plant | LH |
| `eng2_inlet_cowl` | Engine 2 inlet cowl | 71 Power Plant | RH |
| `eng1_spinner` | Engine 1 fan spinner | 72 Engine | LH |
| `eng2_spinner` | Engine 2 fan spinner | 72 Engine | RH |
| `eng1_fan` | Engine 1 fan | 72 Engine | LH |
| `eng2_fan` | Engine 2 fan | 72 Engine | RH |
| `eng1_fan_cowl_inboard` | Engine 1 fan cowl door, inboard | 71 Power Plant | LH |
| `eng2_fan_cowl_inboard` | Engine 2 fan cowl door, inboard | 71 Power Plant | RH |
| `eng1_fan_cowl_outboard` | Engine 1 fan cowl door, outboard | 71 Power Plant | LH |
| `eng2_fan_cowl_outboard` | Engine 2 fan cowl door, outboard | 71 Power Plant | RH |
| `eng1_reverser_cowl_inboard` | Engine 1 thrust reverser cowl, inboard | 78 Exhaust | LH |
| `eng2_reverser_cowl_inboard` | Engine 2 thrust reverser cowl, inboard | 78 Exhaust | RH |
| `eng1_reverser_cowl_outboard` | Engine 1 thrust reverser cowl, outboard | 78 Exhaust | LH |
| `eng2_reverser_cowl_outboard` | Engine 2 thrust reverser cowl, outboard | 78 Exhaust | RH |
| `eng1_exhaust_nozzle` | Engine 1 exhaust nozzle | 78 Exhaust | LH |
| `eng2_exhaust_nozzle` | Engine 2 exhaust nozzle | 78 Exhaust | RH |
| `eng1_exhaust_plug` | Engine 1 exhaust plug | 78 Exhaust | LH |
| `eng2_exhaust_plug` | Engine 2 exhaust plug | 78 Exhaust | RH |
| `eng1_pylon` | Engine 1 pylon | 54 Nacelles / Pylons | LH |
| `eng2_pylon` | Engine 2 pylon | 54 Nacelles / Pylons | RH |
| `eng1_drain_mast` | Engine 1 drain mast | 71 Power Plant | LH |
| `eng2_drain_mast` | Engine 2 drain mast | 71 Power Plant | RH |

### Zone C — Landing gear (45)

| Id | Component | ATA | Side |
| --- | --- | --- | --- |
| `nlg_shock_strut` | Nose gear shock strut | 32 Landing Gear | — |
| `nlg_torque_links` | Nose gear torque links | 32 Landing Gear | — |
| `nlg_drag_strut` | Nose gear drag strut | 32 Landing Gear | — |
| `nlg_steering_actuator` | Nose wheel steering actuator | 32 Landing Gear | — |
| `nlg_wheel_lh` | Nose wheel, left | 32 Landing Gear | LH |
| `nlg_wheel_rh` | Nose wheel, right | 32 Landing Gear | RH |
| `nlg_tire_lh` | Nose wheel tire, left | 32 Landing Gear | LH |
| `nlg_tire_rh` | Nose wheel tire, right | 32 Landing Gear | RH |
| `nlg_door_fwd_lh` | Nose gear forward door, left | 32 Landing Gear | LH |
| `nlg_door_fwd_rh` | Nose gear forward door, right | 32 Landing Gear | RH |
| `nlg_door_aft_lh` | Nose gear aft door, left | 32 Landing Gear | LH |
| `nlg_door_aft_rh` | Nose gear aft door, right | 32 Landing Gear | RH |
| `nlg_bay` | Nose gear bay | 32 Landing Gear | — |
| `apu_external_panel` | External APU shutdown panel on the nose gear | 49 Airborne Auxiliary Power | — |
| `mlg_shock_strut_lh` | Main gear shock strut, left | 32 Landing Gear | LH |
| `mlg_shock_strut_rh` | Main gear shock strut, right | 32 Landing Gear | RH |
| `mlg_side_stay_lh` | Main gear side stay, left | 32 Landing Gear | LH |
| `mlg_side_stay_rh` | Main gear side stay, right | 32 Landing Gear | RH |
| `mlg_torque_links_lh` | Main gear torque links, left | 32 Landing Gear | LH |
| `mlg_torque_links_rh` | Main gear torque links, right | 32 Landing Gear | RH |
| `mlg_retraction_actuator_lh` | Main gear retraction actuator, left | 32 Landing Gear | LH |
| `mlg_retraction_actuator_rh` | Main gear retraction actuator, right | 32 Landing Gear | RH |
| `mlg_brake_lines_lh` | Main gear brake hydraulic lines, left | 32 Landing Gear | LH |
| `mlg_brake_lines_rh` | Main gear brake hydraulic lines, right | 32 Landing Gear | RH |
| `mlg_door_main_lh` | Main gear door, left | 32 Landing Gear | LH |
| `mlg_door_main_rh` | Main gear door, right | 32 Landing Gear | RH |
| `mlg_door_hinged_lh` | Main gear hinged fairing door, left | 32 Landing Gear | LH |
| `mlg_door_hinged_rh` | Main gear hinged fairing door, right | 32 Landing Gear | RH |
| `mlg_bay_lh` | Main gear bay, left | 32 Landing Gear | LH |
| `mlg_bay_rh` | Main gear bay, right | 32 Landing Gear | RH |
| `mlg_wheel_1` | Main wheel 1 | 32 Landing Gear | LH |
| `mlg_wheel_2` | Main wheel 2 | 32 Landing Gear | LH |
| `mlg_wheel_3` | Main wheel 3 | 32 Landing Gear | RH |
| `mlg_wheel_4` | Main wheel 4 | 32 Landing Gear | RH |
| `mlg_tire_1` | Main wheel tire 1 | 32 Landing Gear | LH |
| `mlg_tire_2` | Main wheel tire 2 | 32 Landing Gear | LH |
| `mlg_tire_3` | Main wheel tire 3 | 32 Landing Gear | RH |
| `mlg_tire_4` | Main wheel tire 4 | 32 Landing Gear | RH |
| `mlg_brake_1` | Brake assembly 1 | 32 Landing Gear | LH |
| `mlg_brake_2` | Brake assembly 2 | 32 Landing Gear | LH |
| `mlg_brake_3` | Brake assembly 3 | 32 Landing Gear | RH |
| `mlg_brake_4` | Brake assembly 4 | 32 Landing Gear | RH |
| `hyd_service_panel_green` | Green hydraulic system service panel | 29 Hydraulic Power | — |
| `hyd_service_panel_yellow` | Yellow hydraulic system service panel | 29 Hydraulic Power | — |
| `hyd_service_panel_blue` | Blue hydraulic system service panel | 29 Hydraulic Power | — |

### Zone D — Rear fuselage and tail (28)

| Id | Component | ATA | Side |
| --- | --- | --- | --- |
| `aft_fuselage_skin_lh` | Aft fuselage skin, left | 53 Fuselage | LH |
| `aft_fuselage_skin_rh` | Aft fuselage skin, right | 53 Fuselage | RH |
| `aft_fuselage_belly` | Aft fuselage lower skin | 53 Fuselage | — |
| `tail_cone` | Tail cone | 53 Fuselage | — |
| `vertical_stabilizer` | Vertical stabilizer | 55 Stabilizers | — |
| `horizontal_stabilizer_lh` | Horizontal stabilizer, left | 55 Stabilizers | LH |
| `horizontal_stabilizer_rh` | Horizontal stabilizer, right | 55 Stabilizers | RH |
| `rudder` | Rudder | 27 Flight Controls | — |
| `elevator_lh` | Elevator, left | 27 Flight Controls | LH |
| `elevator_rh` | Elevator, right | 27 Flight Controls | RH |
| `pax_door_aft_lh` | Aft passenger/crew door, left | 52 Doors | LH |
| `pax_door_aft_rh` | Aft passenger/crew door, right | 52 Doors | RH |
| `aft_cargo_door` | Aft cargo door | 52 Doors | RH |
| `bulk_cargo_door` | Bulk cargo door | 52 Doors | RH |
| `aft_cargo_compartment` | Aft cargo compartment | 25 Equipment / Furnishings | — |
| `apu_exhaust` | APU exhaust | 49 Airborne Auxiliary Power | — |
| `apu_air_inlet` | APU air intake | 49 Airborne Auxiliary Power | — |
| `apu_access_door_lh` | APU compartment access door, left | 52 Doors | LH |
| `apu_access_door_rh` | APU compartment access door, right | 52 Doors | RH |
| `outflow_valve` | Cabin pressure outflow valve | 21 Air Conditioning | — |
| `potable_water_service_panel` | Potable water service panel | 38 Water / Waste | — |
| `waste_service_panel` | Waste service panel | 38 Water / Waste | — |
| `drain_mast_aft` | Aft drain mast | 38 Water / Waste | — |
| `logo_light_lh` | Logo light, left | 33 Lights | LH |
| `logo_light_rh` | Logo light, right | 33 Lights | RH |
| `tail_nav_light` | Tail navigation light | 33 Lights | — |
| `tail_strobe_light` | Tail strobe light | 33 Lights | — |
| `static_dischargers_tail` | Tail static dischargers | 23 Communications | — |

### Zone E — Cockpit (45)

| Id | Component | ATA | Side |
| --- | --- | --- | --- |
| `cockpit_pfd_capt` | Primary flight display, captain | 31 Indicating / Recording Systems | — |
| `cockpit_pfd_fo` | Primary flight display, first officer | 31 Indicating / Recording Systems | — |
| `cockpit_nd_capt` | Navigation display, captain | 31 Indicating / Recording Systems | — |
| `cockpit_nd_fo` | Navigation display, first officer | 31 Indicating / Recording Systems | — |
| `cockpit_ewd` | Engine/warning display | 31 Indicating / Recording Systems | — |
| `cockpit_sd` | System display | 31 Indicating / Recording Systems | — |
| `cockpit_standby_instruments` | Standby instruments | 34 Navigation | — |
| `cockpit_gear_lever` | Landing gear lever | 32 Landing Gear | — |
| `cockpit_autobrake_panel` | Landing gear indicator and autobrake panel | 32 Landing Gear | — |
| `cockpit_glareshield` | Glareshield | 31 Indicating / Recording Systems | — |
| `cockpit_fcu` | Flight control unit | 22 Auto Flight | — |
| `cockpit_efis_panel_capt` | EFIS control panel, captain | 31 Indicating / Recording Systems | — |
| `cockpit_efis_panel_fo` | EFIS control panel, first officer | 31 Indicating / Recording Systems | — |
| `cockpit_overhead_panel` | Overhead panel | 31 Indicating / Recording Systems | — |
| `cockpit_ovhd_elec` | Overhead ELEC panel | 24 Electrical Power | — |
| `cockpit_ovhd_hyd` | Overhead HYD panel | 29 Hydraulic Power | — |
| `cockpit_ovhd_fuel` | Overhead FUEL panel | 28 Fuel | — |
| `cockpit_ovhd_air_cond` | Overhead AIR COND panel | 21 Air Conditioning | — |
| `cockpit_ovhd_cabin_press` | Overhead CABIN PRESS panel | 21 Air Conditioning | — |
| `cockpit_ovhd_apu` | Overhead APU panel | 49 Airborne Auxiliary Power | — |
| `cockpit_ovhd_fire` | Overhead FIRE panel | 26 Fire Protection | — |
| `cockpit_ovhd_anti_ice` | Overhead ANTI ICE panel | 30 Ice and Rain Protection | — |
| `cockpit_ovhd_ext_lights` | Overhead EXT LT panel | 33 Lights | — |
| `cockpit_ovhd_adirs` | Overhead ADIRS panel | 34 Navigation | — |
| `cockpit_ovhd_flt_ctl` | Overhead FLT CTL panel | 27 Flight Controls | — |
| `cockpit_pedestal` | Centre pedestal | 31 Indicating / Recording Systems | — |
| `cockpit_mcdu_capt` | Multipurpose control and display unit, captain | 22 Auto Flight | — |
| `cockpit_mcdu_fo` | Multipurpose control and display unit, first officer | 22 Auto Flight | — |
| `cockpit_radio_panel_capt` | Radio management panel, captain | 23 Communications | — |
| `cockpit_radio_panel_fo` | Radio management panel, first officer | 23 Communications | — |
| `cockpit_ecam_control_panel` | ECAM control panel | 31 Indicating / Recording Systems | — |
| `cockpit_thrust_levers` | Thrust levers | 76 Engine Controls | — |
| `cockpit_engine_master_switches` | Engine master switches | 76 Engine Controls | — |
| `cockpit_flap_lever` | Flap lever | 27 Flight Controls | — |
| `cockpit_speedbrake_lever` | Speed brake lever | 27 Flight Controls | — |
| `cockpit_parking_brake` | Parking brake handle | 32 Landing Gear | — |
| `cockpit_sidestick_capt` | Sidestick, captain | 27 Flight Controls | — |
| `cockpit_sidestick_fo` | Sidestick, first officer | 27 Flight Controls | — |
| `cockpit_rudder_pedals_capt` | Rudder pedals, captain | 27 Flight Controls | — |
| `cockpit_rudder_pedals_fo` | Rudder pedals, first officer | 27 Flight Controls | — |
| `cockpit_cb_panel_overhead` | Overhead circuit breaker panel | 24 Electrical Power | — |
| `cockpit_cb_panel_rear` | Rear circuit breaker panel | 24 Electrical Power | — |
| `cockpit_seat_capt` | Pilot seat, captain | 25 Equipment / Furnishings | — |
| `cockpit_seat_fo` | Pilot seat, first officer | 25 Equipment / Furnishings | — |
| `cockpit_door` | Flight deck door | 52 Doors | — |

## Hangar, equipment and effects

### Hangar

| Id | Asset | Milestone |
| --- | --- | --- |
| `hangar_shell` | Hangar walls, truss roof and sliding doors | 2 |
| `hangar_floor` | Painted concrete floor with parking and safety markings | 2 |
| `hangar_lights` | High-bay light fittings | 2 |
| `documentation_station` | Aircraft documentation station | 2 |
| `stores_wall` | Offices and stores wall | 2 |

### Access equipment

| Id | Asset | Milestone |
| --- | --- | --- |
| `engine_stand` | Engine access stand | 2 |
| `wing_stand` | Wing access stand | 2 |
| `tail_lift` | Tail lift platform | 2 |
| `door_stairs` | Stairs at the forward left door | 2 |
| `step_ladder` | Step ladder | 2 |

### Ground support equipment

| Id | Asset | Milestone |
| --- | --- | --- |
| `tow_tug` | Tow tug | 2 |
| `tow_bar` | Tow bar | 2 |
| `ground_power_unit` | Ground power unit | 2 |
| `hydraulic_cart` | Hydraulic service cart | 2 |
| `nitrogen_cart` | Nitrogen service cart | 2 |
| `axle_jack` | Axle jack (static) | 2 |
| `drip_tray` | Drip tray | 2 |

### Props

| Id | Asset | Milestone |
| --- | --- | --- |
| `toolbox_roll_cab` | Roll-cab toolbox | 2 |
| `workbench` | Workbench | 2 |
| `safety_cone` | Safety cone | 2 |
| `wheel_chock` | Wheel chock | 2 |
| `gear_pin` | Landing gear ground lock pin with streamer | 2 |
| `fire_extinguisher` | Wheeled fire extinguisher | 2 |
| `waste_bin` | Waste and FOD bin | 2 |
| `hangar_signage` | Safety signage | 2 |

### Defect visuals

| Id | Asset | Milestone |
| --- | --- | --- |
| `defect_tire_cut` | Tire cut | 4 |
| `defect_tire_wear` | Tire tread worn through | 4 |
| `defect_hydraulic_streak` | Hydraulic fluid streak | 4 |
| `defect_hydraulic_drip` | Hydraulic fluid drip and puddle | 4 |
| `defect_dent` | Skin dent | 6 |
| `defect_scratch` | Skin scratch or gouge | 6 |
| `defect_missing_fastener` | Missing fastener | 6 |
| `defect_damaged_fastener` | Damaged fastener | 6 |
| `defect_fan_blade_nick` | Fan blade leading-edge nick | 6 |
| `defect_cracked_lens` | Cracked light lens | 6 |
| `defect_corrosion` | Corrosion patch | 6 |
| `defect_torn_seal` | Torn door or panel seal | 6 |

### People

| Id | Asset | Milestone |
| --- | --- | --- |
| `technician` | Maintenance technician (cut if no licence-clean model) | 2 |

### Materials

| Id | Asset | Milestone |
| --- | --- | --- |
| `mat_fuselage_paint` | Fuselage paint with panel lines and rivets | 1 |
| `mat_livery` | Livery and tail stripes | 1 |
| `mat_stencils` | Exterior stencils and placards | 1 |
| `mat_tire_rubber` | Tire rubber | 1 |
| `mat_gear_metal` | Landing gear painted and plated metal | 1 |
| `mat_glass` | Window glass | 1 |
| `mat_concrete` | Hangar floor concrete (CC0 scan) | 2 |
| `mat_painted_steel` | Painted structural steel | 2 |
| `mat_yellow_equipment` | Equipment safety-yellow paint | 2 |
