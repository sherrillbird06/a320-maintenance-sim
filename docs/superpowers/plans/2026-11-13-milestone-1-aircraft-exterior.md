| 8 | Registry agreement and budget | **Registry agreement done:** exterior.glb holds all 209 exterior components and passes the check, at about 170,000 of 400,000 triangles. **Owner review (quality gate) not yet held** |
| 7 | Materials and livery: paint with seams and rivets, stencils, glass, unbranded scheme, registration | **Partly done.** Painted skin with seams and rivets on the fuselage, striped tail, registration. Not done: stencils and placards, wing and nacelle surface detail, sidewall markings, real glass, weathering |
| 6 | Probes, antennas, lights, service panels, drain masts, static dischargers | **Built, simplified.** Service-point stations are sourced; probe, antenna and light positions were read by eye from undimensioned Airbus figures and are provisional |
| 5 | Landing gear: struts, torque links, stays, actuators, wheels, brakes, doors, bays | **Built, simplified.** Every gear component is its own mesh; stations, track, wheel spacing and tire sizes are tested against published values. Provisional: all strut, link, brake, door and bay shapes |
# Milestone 1 — Aircraft Exterior: slice plan

**Goal:** an A320-214 exterior that an A320-familiar viewer recognizes at hangar, walkaround and close-inspection distance, split into the registry's 209 exterior components.

**Standard:** `SIMULATOR_MASTER_STANDARD.md`. **Spec:** `docs/superpowers/specs/2026-11-13-a320-maintenance-sim-design.md`.

**Method:** every slice is a change to `assets-src/blender/*.py`, rebuilt with `npm run models`, checked by dimension tests against `src/data/aircraft.ts`, then judged in `?scene=aircraft` against reference photos before it is called done. Outlines are measured from the Airbus dimension figure; anything not sourced is labelled PROVISIONAL in the script.

| Slice | Content | Done when |
| --- | --- | --- |
| 1 | Overall shape: fuselage, wings, tail, nacelles, pylons, gear stand-ins | **Done.** 8 dimension tests pass. Shape only: no detail, provisional aerofoils, nacelles, gear |
| 2 | Fuselage detail: belly fairing, wing root, cockpit glazing, cabin windows, doors, cargo doors, radome and skin panel split, tail cone, APU exhaust | **Done.** Door and exit stations and widths are tested against the Airbus door figures. Provisional: window size, glazing outlines, sill heights, fairing shape |
| 3 | Wing detail: slats 1–5, flaps, spoilers 1–5, ailerons, flap track fairings, fence; tail surfaces: rudder, elevators | **Partly done.** Surfaces are separate inspectable meshes in the right order. Not done: hinge pivots, lights, access panels. Provisional: every split position |
| 4 | Power plant: inlet, spinner, 36-blade fan that turns, fan cowls, reverser cowls, nozzle, plug, pylon, drain mast | **Partly done.** All 11 components per engine exist; fan has 36 blades on an axis-centred origin. Not done: turning it in the app, photo comparison. Provisional: all cross-sections |
| 5 | Landing gear: struts, torque links, stays, actuators, wheels, brakes, doors, bays | Each gear component is its own mesh; wheels and tires at sourced sizes |
| 6 | Probes, antennas, lights, service panels, drain masts, static dischargers | Positions match the Airbus antenna, light and service figures |
| 7 | Materials and livery: paint with seams and rivets, stencils, glass, unbranded scheme, registration | Holds up at close range in hangar lighting |
| 8 | Registry agreement and budget | `exterior.glb` passes the registry check with all 209 ids, under 400,000 triangles; owner review (quality gate) |
