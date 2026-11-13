# A320 Maintenance & Inspection Simulator — Design

Date: 2026-11-13. Status: approved by the owner on 2026-11-13.

Items marked **(call)** are decisions Claude made and the owner can overrule. Everything else comes from the owner's brief.

## 1. Intent

A browser-based training simulator where the player walks into a maintenance hangar, is assigned an inspection on an Airbus A320 in an American Airlines-inspired livery, physically examines the aircraft, finds discrepancies without being told where they are, consults an ATA-organized technical library, and documents findings in a simulated logbook.

**Why:** it is a GitHub portfolio piece. A hiring manager should be able to click one link, be inspecting the aircraft within seconds, and then read clean code behind it. **(call)** Assumed viewer: someone who gives it two to five minutes — live demo first, README second, code third. It has to hold up for both an aviation reader (terminology, documentation practice) and a software reader (architecture, tests).

## 2. Goals, non-goals, anti-goals

**Goals, in the owner's priority order**
1. Accurate, recognizable A320.
2. Realistic inspection experience: walk, look, zoom, discover.
3. Authentic maintenance terminology.
4. Interactive components and randomized inspection scenarios.
5. ATA chapter organization throughout.
6. Realistic discrepancy reporting and logbook.
7. High-quality, operational-feeling hangar.
8. Educational accuracy, clearly separated from approved maintenance data.

**Non-goals:** flight simulation; working avionics or system simulation; multiplayer; accounts or a backend; VR; phone/tablet play; cabin interior; engine internals behind opened cowls (possible later).

**Anti-goals — these make it a failure even if it works**
- The aircraft reads as a generic low-detail airliner.
- Anything looks like, or could be mistaken for, approved maintenance instructions.
- Any invented torque value, tolerance, quantity, interval or limit.
- The sim points the player at the defects.
- The UI looks like a game menu or a generic template.
- A hiring manager has to install something to see it.

## 3. Constraints

- **No real procedures or limits.** Defects are qualitative. Grading covers locating, identifying, ATA-referencing and documenting — never applying a limit. Every reference screen and logbook page carries "Training simulation — not approved maintenance data".
- **Sources.** Aircraft facts come from public material only: Airbus *Aircraft Characteristics – Airport and Maintenance Planning*, the EASA type certificate data sheet, and public photos. General inspection knowledge (tire damage, corrosion, leaks, fasteners) comes from FAA public-domain handbooks (AMT Handbook series, AC 43.13-1B), cited. A fact that cannot be verified is left out, not guessed.
- **The Scribd AMM reference** is a 27-page document; only its title and summary are readable without an account. It is not used for content and nothing from it is reproduced. The library mirrors the public ATA structure (chapter-section-subject; page-block types such as Description & Operation, Servicing, Inspection/Check) with original text.
- **Trademarks.** **(call)** AA-inspired paint scheme (silver-grey fuselage, striped red/white/blue tail) without the real wordmark or logo; fictional N-number, MSN and work-order numbers. README states no affiliation with American Airlines or Airbus.
- **Licensing.** Own code MIT **(call)**. Third-party assets CC0 only (e.g. Poly Haven textures and HDRIs) so the public repo is clean.
- **Quality bar.** The owner judges visuals hard and wants to see only finished work. Each visual milestone is judged in the final lighting before it is shown.

## 4. Approaches considered

| Approach | Trade-off |
|---|---|
| **Web: TypeScript, three.js, React — chosen** | Runs from a link on GitHub Pages; repo is readable code; the documentation UI is plain HTML; Claude can build and test it end to end. Realism ceiling is below Unreal and the download must stay small. |
| Unreal Engine 5 | Best visuals. Repo is mostly binary, viewers must download gigabytes or watch a video, and the editor work would fall on the owner. |
| Godot 4 | Git-friendly, but its browser export uses the weaker renderer and it adds little over the web approach. |
| Roblox | Owner ruled it out: this is a portfolio project, not a Roblox game. |

The owner said to do whatever is best for a hiring manager; web was picked for the one-click demo and reviewable code.

## 5. Architecture

**Stack (call):** Vite, React, TypeScript (strict), three.js through React Three Fiber, Zustand for state, three-mesh-bvh for walking collision, Vitest for unit tests, Playwright for browser tests, ESLint and Prettier, GitHub Actions deploying to GitHub Pages. Models are made in Blender and exported as compressed glTF.

**No server.** It is a static site. Scenarios come from a seeded random generator in the browser; the seed is printed on the work order so any scenario can be replayed. Progress and the logbook live in the browser's local storage.

**Repo layout (new repo, working name `a320-maintenance-sim`)**

```
src/data/     component registry, defect catalog, scenario templates, levels, ATA library text
src/sim/      pure logic, no rendering: scenario generator, grading, progression, logbook model
src/world/    3D scene: aircraft, hangar, defect visuals, lighting, player, inspect mode
src/ui/       workstation: work order, diagram, checklist, library, logbook, discrepancy form, profile
src/state/    stores and local-storage persistence
public/models compressed .glb and textures
assets-src/   Blender source files
tests/        unit and browser tests
docs/         this design, source list, screenshots
```

**The rule that holds it together:** all content is data. Each inspectable component has one record whose id equals the name of its mesh in the aircraft model. A test fails the build if a record has no mesh or a tagged mesh has no record.

**Data records**
- **Component:** id, name, inspection zone (A–E), ATA chapter-section, description, what normal looks like, what a technician checks, related systems.
- **Defect type:** category, components it can appear on, authored anchor points on each, how it is shown (decal overlay, swapped mesh, hidden part, drip particles), the correct write-up, plausible wrong write-ups, the explanation of why, library links.
- **Distractor:** a normal feature that looks suspicious to a novice (drain mast, static wick, vent scoop, sealant line). Reporting one is an incorrect finding, with an explanation of what it is. Distractors never depend on a limit.
- **Scenario template:** level, zones, defect-count range, defect pool, distractor count, aircraft configuration (flaps/slats extended, which doors open), reference cards, par time.
- **Finding (player's):** component, tagged point on the surface, ATA chapter, defect type, observed condition, free-text remarks.
- **Logbook entry:** work-order number, registration, model, MSN, assignment, zone, ATA reference, findings, technician name and ID, status, date, time taken, sign-off.

**Inspection loop — the owner's eight steps**
1. Assignment: accept a work order at the workstation.
2. Aircraft identification: read the registration off the aircraft and confirm it against the work order.
3. Zone: the work order names the zone, never the defect.
4. Reference: open the linked library cards.
5. Physical inspection: first-person walk, crouch, flashlight; aim at a component to see its name; enter a close-up view to orbit and zoom.
6. Defect identification: in close-up, tag the spot believed defective.
7. Documentation: the discrepancy form pre-fills the component; the player chooses ATA chapter, defect type and observed condition, and adds remarks.
8. Completion: sign off at the documentation station. The debrief lists correct, incorrect and missed findings, each with the reason.

**Hands-on interactions (call):** turn the engine fan by hand to check every blade; open and close selected doors and panels; ride a lift platform to reach the tail; climb access stands.

**Hydraulic findings (call).** For a leak, the form adds one field: which system (Green, Blue or Yellow). The player works it out from where the component is and from the library's system page, not from a label on the leak.

**Getting into the cockpit (call).** Up the stairs at the forward left door; the cockpit model loads as the player enters.

**Grading.** Per finding: tagged the right place, right component, right ATA chapter, right defect type, right condition. Free-text remarks are saved but not graded — they cannot be scored reliably without a server. Tracked per the brief: accuracy, correct, incorrect, missed, assignments completed, ATA chapters covered, time.

**Workstation UI.** One overlay, opened anywhere with a key and used for sign-off at the hangar's documentation station. Sections: aircraft overview, assignments, interactive aircraft diagram (2D top and side views by zone; shows checklist state, never defects), ATA browser, checklist, discrepancy reports, logbook, technician profile, training progress. Look: dense tables, monospace identifiers, status chips, neutral palette, no decorative animation.

## 6. The aircraft

**(call)** A320-214, CFM56-5B engines, wingtip fences. Built at real scale from published dimensions (length 37.57 m, span 34.10 m, fuselage width 3.95 m, tail height 12.08 m standing empty in maintenance configuration), as read from the Airbus document in Milestone 0 and recorded with figure references in `src/data/aircraft.ts`.

One mesh per inspectable component — 254 in the registry built in Milestone 0 (the first estimate was 150–180; mirrored left/right parts account for most of the difference):

- **A. Forward fuselage:** radome, nose skin panels, windshields and side windows, probes and static ports, forward doors, forward cargo door and compartment, external power door, antennas, lights.
- **B. Wings and engines (each side):** inlet cowl, spinner and fan blades, fan cowls, reverser cowl, exhaust, pylon; wing skins, slats 1–5, flaps and track fairings, spoilers 1–5, aileron, wingtip fence, underwing tank access panels, fuel vent, refuel coupling, static wicks, lights.
- **C. Landing gear:** nose gear (strut, torque links, steering, wheels, tires, doors); each main gear (strut, side stay, torque links, wheels, tires, brakes, hoses, doors); gear bays with visible hydraulic components.
- **D. Rear fuselage and tail:** vertical stabilizer, rudder, horizontal stabilizers, elevators, APU exhaust, inlet and access doors, aft doors, aft and bulk cargo doors, aft skin, drain masts.
- **E. Cockpit** (separate model, loaded on entry): instrument panel with six displays, glareshield panel, overhead panel by system, pedestal, sidesticks, circuit-breaker panels. Displays show original, simplified, static pages — representative, not functional.
- **F. Systems:** ten modules (electrical, hydraulic, pneumatic, air conditioning, flight controls, landing gear, fuel, engine, APU, fire protection), each with an original schematic and a "show on aircraft" link.

Moving surfaces and doors have pivots so a scenario can present the aircraft with flaps, slats and spoilers extended or doors open.

## 7. Other assets

- **Hangar:** shell with truss roof and doors, high-bay lights, painted floor with markings and stains, documentation station, offices or stores wall.
- **Access and ground equipment:** engine and wing stands, tail lift platform, stairs, tow bar and tug, ground power unit, hydraulic cart, nitrogen cart, jacks (static), drip trays.
- **Props:** roll-cab toolboxes, workbenches, cones, chocks, gear pins with streamers, fire extinguishers, bins, signage.
- **Defect visuals:** tire cuts and wear, hydraulic streaks, drips and puddles, dents and scratches, missing or damaged fasteners, nicked fan blade, cracked lens, corrosion patches, torn seals.
- **Technicians:** realistic people need a rigged model with a licence that allows a public repo. If none is found, people are cut rather than shipped looking wrong, and the hangar gets its operational feel from equipment, open toolboxes and sound.
- **Materials:** CC0 scanned sets for concrete, steel and rubber; authored paint, livery and stencil textures.

## 8. Technical library

Chapters from the brief: 05, 12, 21, 24, 27, 28, 29, 32, 49, 52, 53, 57, 72. **(call)** Added because the brief's own component list needs them: 26 Fire Protection, 33 Lights, 36 Pneumatic, 55 Stabilizers, 56 Windows, 71 Power Plant.

Each chapter page: what the chapter covers, the components on this aircraft with links to them, general inspection knowledge with its public source, and a note on what the real manual chapter contains — without reproducing it.

## 9. Progression

Seven levels as in the brief: Aircraft Familiarization, General Aircraft Inspection, Airframe Inspection, Landing Gear Inspection, Aircraft Systems Familiarization, Engine Inspection, Advanced Troubleshooting Scenarios. A level unlocks when the previous one's assignments are completed at a set accuracy. Difficulty raises defect count, subtlety and distractors, and trims the reference hints.

## 10. Milestones

Each ends with tests passing, the live site updated and a playtest. The next does not start until then.

| # | Milestone | Done when |
|---|---|---|
| 0 | Foundations: repo, toolchain, automatic deploy, data schemas with validation tests, cited A320 source list, final asset list, size and frame-rate budgets, a look test (painted panel, tire, floor patch in target lighting) | Empty scene live on GitHub Pages; look test meets the bar |
| 1 | Aircraft exterior: airframe, engines, gear, livery, moving surfaces | An A320-familiar viewer recognizes it and its inspection areas; passes the owner's quality bar. **Gate:** if it fails, switch to a licensed base model before continuing |
| 2 | Hangar, stands, equipment, lighting | Reads as a working hangar around the aircraft |
| 3 | Inspection core: walking, close-up view, component info; Level 1 | Every component can be found, viewed and read about |
| 4 | Defects, scenario generator, grading, discrepancy form, logbook — on the landing gear task | One full loop from assignment to sign-off, different each run |
| 5 | Full workstation UI, ATA library, progression, saving | All sections in the brief work; progress survives a reload |
| 6 | Engine, hydraulic and flight-control tasks; airframe zones; difficulty levels | The brief's Tasks 1–4 playable |
| 7 | Cockpit and the ten systems modules | Areas E and F complete |
| 8 | Advanced troubleshooting scenarios, performance pass, README with screenshots and a short clip | Levels 1–7 playable end to end; repo is portfolio-ready |

## 11. Limitations and risks

1. **The aircraft model is the biggest risk.** It is built by scripted Blender work from public drawings. Gear and fan detail take the most iteration. Milestone 1 is a hard gate for this reason.
2. **Realism ceiling.** Browser rendering has no ray tracing. The hangar uses baked lighting; real-time shadows are limited to a few lights.
3. **Download size.** **(call)** Targets: about 40 MB first load, exterior under roughly 400k triangles, cockpit loaded separately, 60 fps on a mid-range laptop.
4. **Desktop only.** Keyboard and mouse. Phones get a notice and the README clip.
5. **No backend.** Progress is per browser. The answer key is in the page, so it is not cheat-proof — acceptable for a training demo.
6. **No real limits.** A defect is always obviously a defect, and a distractor is always a normal feature; nothing borderline, because borderline needs real limits.
7. **People may be cut** (see section 7).
8. **Machine setup.** Node.js and the GitHub CLI are not installed on the owner's PC, and Blender must be open with its MCP add-on running before modeling starts.

## 12. Left to the builder

Library versions; exact collision method; file naming; texture resolutions within the size budget; accuracy threshold for unlocking levels; par times; UI layout details within the stated look; whether Blender sources go in the repo through Git LFS or stay out.
