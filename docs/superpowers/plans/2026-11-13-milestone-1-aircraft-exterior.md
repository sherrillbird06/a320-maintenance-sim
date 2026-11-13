# Milestone 1 — Aircraft Exterior: slice plan

**Goal:** an A320-214 exterior that an A320-familiar viewer recognizes at hangar, walkaround and close-inspection distance, split into the registry's 209 exterior components.

**Standard:** `SIMULATOR_MASTER_STANDARD.md`. **Spec:** `docs/superpowers/specs/2026-11-13-a320-maintenance-sim-design.md`.

**Method:** every slice is a change to `assets-src/blender/*.py`, rebuilt with `npm run models`, checked by dimension tests against `src/data/aircraft.ts`, then judged in `?scene=aircraft` against reference photos before it is called done. Outlines are measured from the Airbus dimension figure; anything not sourced is labelled PROVISIONAL in the script.

| Slice | Content | Done when |
| --- | --- | --- |
| 1 | Overall shape: fuselage, wings, tail, nacelles, pylons, gear stand-ins | **Done.** 8 dimension tests pass. Shape only: no detail, provisional aerofoils, nacelles, gear |
| 2 | Fuselage detail: belly fairing, wing root, cockpit glazing, cabin windows, doors, cargo doors, radome and skin panel split, tail cone, APU exhaust | Fuselage components exist under registry ids; door and window positions match the Airbus door figure |
| 3 | Wing detail: slats 1–5, flaps, spoilers 1–5, ailerons, flap track fairings, fence, lights, access panels; tail surfaces: rudder, elevators | Surfaces are separate meshes with pivots; planform matches the figure |
| 4 | Power plant: inlet, spinner, 36-blade fan that turns, fan cowls, reverser cowls, nozzle, plug, pylon, drain mast | CFM56-5B recognizable from the front and side; references recorded |
| 5 | Landing gear: struts, torque links, stays, actuators, wheels, brakes, doors, bays | Each gear component is its own mesh; wheels and tires at sourced sizes |
| 6 | Probes, antennas, lights, service panels, drain masts, static dischargers | Positions match the Airbus antenna, light and service figures |
| 7 | Materials and livery: paint with seams and rivets, stencils, glass, unbranded scheme, registration | Holds up at close range in hangar lighting |
| 8 | Registry agreement and budget | `exterior.glb` passes the registry check with all 209 ids, under 400,000 triangles; owner review (quality gate) |
