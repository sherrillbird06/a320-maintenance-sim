# A320 Maintenance & Inspection Simulator

A browser-based training simulator: walk into a maintenance hangar, take an inspection
assignment on an Airbus A320, examine the aircraft, find the discrepancies yourself, look things
up in an ATA-organized technical library, and write up your findings in a maintenance logbook.
It also carries an A&P study guide for the FAA aviation mechanic knowledge tests, linked to the
same systems on the aircraft.

**Live site:** https://sherrillbird06.github.io/a320-maintenance-sim/

> **Training simulation — not approved maintenance data.** Nothing here is an Airbus or airline
> procedure. The inspection exercises contain no torque values, tolerances, servicing quantities,
> intervals or inspection limits. Real maintenance is done only to current, approved,
> aircraft-specific documentation.

## Status

The project is built in milestones; each one is tested and deployed before the next starts.

| #   | Milestone                                                              | Status                                                                                                                                        |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Foundations: toolchain, data model, sources, asset pipeline, look test | Done                                                                                                                                          |
| 1   | Aircraft exterior: airframe, engines, landing gear, livery             | First pass built: all 209 exterior components; many shapes provisional                                                                        |
| 2   | Hangar, access stands, ground equipment, lighting                      | First pass built: simple shapes, no baked lighting, stands cannot be climbed                                                                  |
| 3   | Inspection core: walking, selection, component information             | Working: walk, collide, select, zoom, flashlight, turn the fan; descriptions written for landing gear, engines and flight controls only       |
| 4   | Defects, randomized scenarios, grading, discrepancy reports, logbook   | Working for four assignments                                                                                                                  |
| 5   | Workstation UI, ATA library, progression                               | Built: 19-chapter library, checklist, aircraft diagram, technician profile, training levels                                                   |
| 6   | Engine, hydraulic and flight-control tasks; difficulty levels          | Built: tires (level 4), flight controls (3), hydraulic leaks (5), engine inlet and fan (6); levels 1, 2 and 7 have no assignment yet          |
| 7   | Cockpit and aircraft systems modules                                   | Not started                                                                                                                                   |
| 8   | Advanced troubleshooting scenarios, performance pass                   | Not started                                                                                                                                   |
| 9   | A&P study guide                                                        | First pass built: 40 topics in General, Airframe and Powerplant, search, reviewed marks, links to library chapters; no practice questions yet |

What you can do today: accept one of four work orders, walk around the aircraft in the hangar,
select any of its 209 exterior components, find randomized defects (tire damage, flight-control
surface damage, hydraulic leaks, engine inlet and fan blade damage), write up discrepancy reports,
sign off, read a graded review that explains each result, and see the inspection in the logbook
and your training record. Most shapes are still simple and are labelled provisional in the model
scripts ([asset list](docs/asset-list.md)).

## A&P study guide

The study guide holds the project owner's review notes for the FAA General, Airframe and
Powerplant knowledge tests: 40 topics, 219 review points and 5 formula boxes, imported whole by
`npm run study` and checked by a test that fails if anything is dropped. Topics link to the
technical library chapter for the same system on the aircraft, and library chapters link back.

It is general study material about aircraft of every kind, so unlike the inspection exercises
it does contain figures and formulas. It is not A320 data, it has not yet been checked line by
line against the current FAA handbooks, and it is no substitute for them, the Aviation Mechanic
ACS or 14 CFR.

## How it is built

- **Static site, no server.** Vite, React, TypeScript (strict), three.js through React Three
  Fiber. Deployed to GitHub Pages by CI.
- **All content is data.** Components, ATA chapters, zones, systems, defects and scenarios are
  typed records validated with Zod (`src/data`). A component's id is also the name of its mesh
  in the model file, and a test fails if the two ever disagree.
- **Logic apart from rendering.** Pure, unit-tested functions; the 3D scene and UI are driven
  from them.
- **Models are code.** Each model is a Blender Python script (`assets-src/blender`) run headless,
  then compressed with glTF-Transform. `npm run models` rebuilds them; the results are committed
  so the site builds without Blender.
- **Budgets are enforced.** First load at most 40 MB and per-model triangle limits
  (`budgets.json`), checked in CI.

```
src/data      component registry, ATA chapters, sources, schemas
src/world     3D scene, materials, lighting
src/app       shell, support checks, notices
tools         model and budget checks shared by tests and scripts
assets-src    Blender model scripts and the model build
tests         unit tests (Vitest) and browser tests (Playwright)
docs          design, sources, generated asset list
```

## Run it

Needs Node.js 24 or newer.

```bash
npm install
npm run dev
```

| Command                         | What it does                                          |
| ------------------------------- | ----------------------------------------------------- |
| `npm run check`                 | Lint, type-check and unit tests                       |
| `npm run e2e`                   | Browser tests against a production build              |
| `npm run build`                 | Production build into `dist/`                         |
| `npm run check:budgets`         | Size and triangle budgets (run after a build)         |
| `npm run models`                | Rebuild the models (needs Blender 5.2)                |
| `npm run study -- <guide.html>` | Re-import the A&P study guide from its source page    |
| `npm run docs`                  | Regenerate `docs/sources.md` and `docs/asset-list.md` |

Desktop only: the simulator uses a keyboard and mouse and needs WebGL 2.

## Accuracy and sources

Aircraft facts come only from public documents, each cited in [docs/sources.md](docs/sources.md):
the Airbus _Aircraft Characteristics – Airport and Maintenance Planning_ document, the EASA type
certificate data sheet, and FAA handbooks and advisory circulars for general inspection
knowledge. A fact that could not be verified is left out. No maintenance manual content is
reproduced.

The aircraft is an A320-214 in a paint scheme inspired by an airline livery, with no airline
marks. Its registration, N320IS, is fictional: it contains the letter I, which the FAA never
issues, so it cannot match a real aircraft.

This project is not affiliated with, endorsed by, or sponsored by Airbus, American Airlines, or
any aviation authority. Airbus and A320 are trademarks of Airbus.

## Licence

Code: [MIT](LICENSE). Third-party textures and lighting are CC0 from Poly Haven.

The design is in [docs/superpowers/specs](docs/superpowers/specs).
