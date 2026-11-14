# A320 Maintenance & Inspection Simulator

A browser-based training simulator: walk into a maintenance hangar, take an inspection
assignment on an Airbus A320, examine the aircraft, find the discrepancies yourself, look things
up in an ATA-organized technical library, and write up your findings in a maintenance logbook.

**Live site:** https://sherrillbird06.github.io/a320-maintenance-sim/

> **Training simulation — not approved maintenance data.** Nothing here is an Airbus or airline
> procedure. The simulator contains no torque values, tolerances, servicing quantities, intervals
> or inspection limits. Real maintenance is done only to current, approved, aircraft-specific
> documentation.

## Status

The project is built in milestones; each one is tested and deployed before the next starts.

| #   | Milestone                                                              | Status                                                                                |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 0   | Foundations: toolchain, data model, sources, asset pipeline, look test | Done                                                                                  |
| 1   | Aircraft exterior: airframe, engines, landing gear, livery             | First pass built: all 209 exterior components; close-up detail and review still to do |
| 2   | Hangar, access stands, ground equipment, lighting                      | First pass built: simple shapes, no baked lighting                                    |
| 3   | Inspection core: walking, selection, component information             | Working: walk, select, zoom, flashlight; component descriptions not written yet       |
| 4   | Defects, randomized scenarios, grading, discrepancy reports, logbook   | Working for one assignment (wheels and tires)                                         |
| 5   | Workstation UI, ATA library, progression                               | Not started                                                                           |
| 6   | Engine, hydraulic and flight-control tasks; difficulty levels          | Not started                                                                           |
| 7   | Cockpit and aircraft systems modules                                   | Not started                                                                           |
| 8   | Advanced troubleshooting scenarios, performance pass                   | Not started                                                                           |

What you can do today: accept a work order, walk around the aircraft in the hangar, select any of its
209 exterior components, find randomized tire defects, write up discrepancy reports, sign off, read a
graded review that explains each result, and see the inspection in the logbook. Most shapes are still
simple and are labelled provisional in the model scripts ([asset list](docs/asset-list.md)).

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

| Command                 | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm run check`         | Lint, type-check and unit tests                       |
| `npm run e2e`           | Browser tests against a production build              |
| `npm run build`         | Production build into `dist/`                         |
| `npm run check:budgets` | Size and triangle budgets (run after a build)         |
| `npm run models`        | Rebuild the models (needs Blender 5.2)                |
| `npm run docs`          | Regenerate `docs/sources.md` and `docs/asset-list.md` |

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
