# A320 Maintenance & Inspection Simulator

# Master Development Directive + Visual Reference Library

**Document type:** Permanent project standard\
**Purpose:** Establish the technical, visual, functional, and quality
expectations for the entire simulator.\
**Use:** Keep this file in the project repository (recommended filename:
`SIMULATOR_MASTER_STANDARD.md`) and reference it from the main build
prompt and every milestone.

------------------------------------------------------------------------

# 0. Instructions to the AI development agent

This document is a standing project requirement, not a one-time feature
request.

Before changing the project:

1.  Inspect the existing codebase, architecture, assets, and current
    implementation.
2.  Identify what already works. Preserve working functionality.
3.  Compare the current project against this standard.
4.  Produce an audit separating:
    -   technical inaccuracies or unverified assumptions;
    -   visual shortcomings;
    -   incomplete or fake functionality;
    -   architecture and performance risks;
    -   missing tests and documentation.
5.  Propose a prioritized roadmap. Separate essential work from optional
    polish.
6.  Do not perform a broad rewrite or make major architectural changes
    without approval.

For each milestone, implement a coherent, testable slice. Demonstrate
the result, identify what is genuinely complete, and disclose
limitations. Do not claim a feature works merely because code compiles
or a screen renders.

**Core principle: The objective is not to create the appearance of a
professional simulator. The objective is to build one.**

------------------------------------------------------------------------

# 1. Product vision

Build a convincing, technically grounded Airbus A320 maintenance and
inspection simulator. It should feel like a purpose-built aviation
maintenance training product---not a generic browser game, a collection
of AI-generated dashboards, or a visually impressive prototype with
superficial interactions.

The experience should allow a learner to enter a maintenance hangar,
encounter a convincingly represented A320, receive a structured training
assignment, navigate to the relevant aircraft area, inspect components,
identify discrepancies, consult relevant technical information, document
findings, and complete a meaningful training task.

The product has four connected quality dimensions:

1.  **Technical accuracy:** Aircraft configuration, component identity,
    system relationships, terminology, inspection concepts, and
    maintenance reasoning are grounded in appropriate sources.
2.  **Visual fidelity:** Aircraft geometry, components, materials,
    lighting, equipment, and environments are convincingly represented.
3.  **Functional realism:** Interactions produce coherent, persistent,
    contextually appropriate results.
4.  **Educational value:** The player learns to observe, identify,
    reason, document, and verify---not simply click through a checklist.

Do not sacrifice technical accuracy for visual appearance, or functional
depth for a polished screenshot.

------------------------------------------------------------------------

# 2. Accuracy versus visual realism

Prioritize correctness of the aircraft and maintenance experience first,
then progressively raise visual fidelity. Both matter, but a beautiful
aircraft with incorrect components or misleading procedures is not a
successful maintenance simulator.

Use a source hierarchy:

1.  Applicable, authorized manufacturer maintenance and aircraft
    documentation.
2.  Applicable FAA, EASA, or other relevant regulatory publications.
3.  Reputable technical training and maintenance references.
4.  Real-world photographs for visual appearance and context.
5.  Clearly labeled illustrative or placeholder material where
    authoritative information is unavailable.

Do not treat photographs, marketing pages, forum posts, or AI-generated
content as authoritative maintenance instructions.

When information is uncertain: - mark it as unverified; - explain what
evidence is missing; - do not invent values, component locations,
procedures, task numbers, or limits; - keep illustrative training
content separate from verified technical data.

Select and document a specific A320 variant and configuration. Record
the engine option, aircraft generation, and other relevant configuration
choices. Do not silently mix A320ceo and A320neo features, engine
variants, or equipment arrangements.

Training scenarios must be clearly distinguished from approved
maintenance instructions. Do not imply that completing the simulator
authorizes real-world maintenance or replaces approved, current
maintenance data.

------------------------------------------------------------------------

# 3. Anti-vibecoding design standard

The project must not look like a generic AI-generated web application.

Avoid: - generic dashboard templates; - oversized floating cards; -
excessive rounded corners; - random gradients; - neon blue or sci-fi
styling; - gratuitous glow effects and shadows; - unnecessary
animation; - decorative terminal effects; - emoji used as a substitute
for professional icons; - random percentages and meaningless
statistics; - repetitive card layouts for every type of information; -
inconsistent fonts, spacing, alignment, and hierarchy; - fake controls
that do not perform a real action; - placeholder data presented as real
aircraft information; - generic game HUD patterns that compete with the
aircraft.

Every interface element must have a clear purpose. Use the layout that
suits the information: task sheets, tables, structured lists, technical
diagrams, document viewers, component panels, and status indicators.

## 3.1 Visual language

Use a restrained industrial aviation aesthetic:

  -----------------------------------------------------------------------
  Element                             Direction
  ----------------------------------- -----------------------------------
  Main backgrounds                    Industrial grey, off-white, or
                                      carefully controlled charcoal

  Information surfaces                Neutral, low-contrast panels

  Primary text                        High-legibility dark or light
                                      neutral text

  Secondary text                      Muted grey

  Active selection                    Restrained aviation blue

  Caution                             Amber

  Failed / critical condition         Restrained red

  Completed task                      Muted green

  Dividers                            Thin, subtle rules

  Typography                          Consistent, professional, readable

  Spacing                             Deliberate, consistent, grid-based
  -----------------------------------------------------------------------

Do not force every screen into dark mode. Use contrast and readability
appropriate to the task and environment.

## 3.2 Information hierarchy

The player should immediately understand: - which aircraft and
configuration they are working on; - which task is active; - which
aircraft area or component is selected; - what action is expected; -
what reference or instruction applies; - what has been completed; - what
remains unresolved; - whether a finding or warning requires attention.

Avoid clutter. Show contextual information when it is relevant rather
than displaying every available statistic at once.

------------------------------------------------------------------------

# 4. Aircraft visual fidelity

The A320 must be recognizable as the selected A320 variant---not a
generic airplane with an Airbus label.

Model and verify, as applicable to the selected configuration: -
fuselage length, cross-section, and proportions; - nose and cockpit
geometry; - cockpit windows and passenger windows; - doors and emergency
exits; - wings, wing geometry, and wingtip devices; - engine placement,
nacelles, and pylons; - nose and main landing gear; - tires, wheels, and
brakes; - horizontal and vertical stabilizers; - control surfaces; -
external sensors and antennas; - access panels and service points; -
external markings and configuration-specific details.

Materials should look physically plausible. Avoid featureless plastic
surfaces. Use appropriate variation in roughness, reflectivity, paint,
metal, rubber, glass, fasteners, seams, and surface finish.

Wear, dirt, corrosion, leaks, and damage must be intentional and
scenario-appropriate. Do not scatter random scratches or grime merely to
make the model appear realistic.

The aircraft should remain convincing at multiple distances: -
hangar-wide view; - walkaround distance; - close component inspection; -
zoomed technical examination.

Use level-of-detail techniques where needed, but do not allow close
inspection to reveal crude geometry or obvious visual shortcuts in
important areas.

------------------------------------------------------------------------

# 5. Component-level aircraft modeling

Do not treat the aircraft as one decorative mesh.

Represent maintenance-relevant assemblies and components as separate,
logically related objects where practical. Examples include: - engine
assemblies and accessible subassemblies; - landing gear assemblies; -
tires, wheels, and brakes; - hydraulic components and visible lines; -
flight-control components; - access panels and doors; - external
sensors; - relevant electrical and mechanical components; - service
connections and inspection points.

Each relevant component should have, where applicable: - a unique
internal identifier; - a human-readable name; - a parent assembly; - a
verified or explicitly provisional location; - a 3D representation; -
relevant technical metadata; - inspection points; - a condition or
scenario state; - associated documentation references; - supported
interactions.

Do not model hundreds of unnecessary objects simply to inflate detail.
Prioritize the parts required for the learning objectives and planned
inspection scenarios.

Component selection must map to the actual object or assembly selected.
Avoid generic hotspots that show unrelated information.

------------------------------------------------------------------------

# 6. Interactive aircraft environment

The aircraft should be the primary interactive environment. The
interface should support the aircraft, not compete with it.

The player should be able to: - navigate around the aircraft; - approach
and select relevant assemblies; - zoom into inspection areas; - select
individual components; - open appropriate access panels; - inspect
visible conditions; - identify defects or discrepancies; - view
component identification; - access related technical information; -
record findings; - return to the aircraft and see consistent state.

Interactions must be contextual. Selecting the engine should lead to
engine-relevant information and activities; selecting landing gear
should lead to landing-gear information and activities.

Mechanical interactions must have appropriate state transitions. An
access panel should not simply disappear when clicked. If the simulator
supports opening it, represent a plausible opening action, the resulting
open state, and any inspection access that becomes available.

Do not promise an interaction until it is implemented and tested.

------------------------------------------------------------------------

# 7. Maintenance training workflows

The primary purpose is aviation maintenance education. Activities should
resemble structured maintenance training rather than generic game
missions.

Potential training activities include: - aircraft walkaround; - general
visual inspection exercises; - engine-area familiarization and
inspection; - landing-gear inspection exercises; - component
identification; - defect recognition; - troubleshooting scenarios; -
technical-reference lookup; - inspection documentation; - discrepancy
reporting; - task completion and review.

The exact procedures, criteria, and scenario scope must be verified
against appropriate sources or clearly labeled as simplified educational
exercises.

## 7.1 Task cards

Use professional, structured task cards. Include only fields that are
meaningful and supported:

-   aircraft identification and selected configuration;
-   task identifier;
-   ATA chapter or system classification where verified;
-   task objective;
-   applicable training reference;
-   required tools or equipment where supported;
-   safety precautions;
-   inspection area;
-   inspection criteria;
-   expected learning outcome;
-   task status;
-   findings and sign-off state.

Do not fabricate official Airbus task-card numbers, AMM references,
regulatory approvals, or maintenance limits.

## 7.2 Player evaluation

Evaluate what the player actually does, not merely whether they click
every item.

Where relevant, assess: - whether the correct area was inspected; -
whether the correct components were identified; - whether a relevant
discrepancy was recognized; - whether an inspection requirement was
missed; - whether the player selected a reasonable next step; - whether
findings were documented clearly; - whether the player consulted the
relevant reference.

Give specific, educational feedback. Explain omissions and incorrect
decisions. Do not award full completion for clicking through a sequence
without meaningful inspection.

------------------------------------------------------------------------

# 8. Technical documentation and learning support

Documentation should be central to the experience.

Where authorized and available, support: - aircraft system
descriptions; - component identification; - technical illustrations; -
inspection criteria; - task instructions; - applicable FAA
publications; - applicable manufacturer references; - training notes and
explanations.

Use diagrams and illustrations where they improve understanding. When a
component is selected, provide relevant information without forcing the
player through unrelated menus.

Track source title, revision, date, applicability, and access
limitations where known. Do not expose proprietary or restricted
technical data without authorization. Do not scrape, redistribute, or
embed copyrighted manuals or commercial training assets without
permission.

Clearly separate: 1. verified source-derived data; 2. scenario-specific
training data; 3. simplified explanatory content; 4. placeholder
content; 5. unverified assumptions.

Never present a simplified training procedure as an approved maintenance
instruction.

------------------------------------------------------------------------

# 9. Hangar and maintenance environment

The hangar should resemble a real commercial aircraft maintenance
facility---not an empty graybox or generic game warehouse.

Include relevant environmental elements as appropriate: - aircraft
maintenance stands and access platforms; - tool carts and tool
storage; - workbenches; - ground-support equipment; - hangar doors and
structural framing; - industrial overhead lighting; - concrete
flooring; - electrical and service equipment; - maintenance storage
areas; - safety markings and floor zones; - ladders, lifts, and
equipment positioned at believable scale.

Use believable proportions, placement, lighting, shadows, material
response, and reflections. The environment should suggest an organized
working facility.

Do not fill the scene with random props. Every major object should
support the setting, task, or visual authenticity.

------------------------------------------------------------------------

# 10. Interaction and animation quality

Interactions should feel deliberate, physically plausible, and connected
to the task.

Examples: - opening and closing access panels; - approaching inspection
points; - positioning a tool or inspection aid; - selecting and
examining components; - operating supported equipment; - recording
findings; - transitioning between task stages.

Avoid instant unexplained state changes. Animations should be
appropriately timed and should not imply a mechanical action that the
model does not actually represent.

Do not overanimate ordinary interface controls. Professional restraint
is preferable to constant movement.

------------------------------------------------------------------------

# 11. Data model, system architecture, and consistency

Maintain consistent relationships among: - aircraft variant and
configuration; - aircraft assemblies; - individual components; -
component condition; - inspection points; - task requirements; -
inspection findings; - documentation references; - player progress; -
scenario state.

The same component must not have contradictory names, locations,
conditions, or identifiers in different parts of the simulator.

If a component is damaged in a scenario, that condition must remain
consistent wherever the component is shown. Findings and task progress
must persist according to the intended save model.

Do not use arbitrary random values to simulate technical information. Do
not fabricate sensor readings, tolerances, limits, or system behavior.

Use explicit data provenance and validation. Keep verified technical
facts separate from game logic and scenario authoring.

------------------------------------------------------------------------

# 12. Performance and asset quality

Visual fidelity must not make the simulator unusable.

Use: - appropriate level-of-detail systems; - optimized meshes; -
sensible texture resolutions; - efficient lighting and shadows; - asset
reuse where appropriate; - progressive loading where useful; - component
visibility management; - camera and selection optimization.

Prioritize detail according to inspection relevance and viewing
distance. The aircraft must remain responsive during normal navigation
and interaction.

------------------------------------------------------------------------

# 13. Quality gates

A feature is not complete merely because it compiles or renders.

## Visual gate

-   Does it look like professional aviation software?
-   Is the aircraft recognizable and proportionally convincing?
-   Are the components and their placement credible?
-   Are materials, lighting, and environment believable?
-   Are there obvious generic AI-generated design patterns?
-   Is typography, spacing, and hierarchy consistent?

## Technical gate

-   Is the information grounded in an appropriate source?
-   Is the aircraft configuration consistent?
-   Are component relationships credible?
-   Are inspection criteria supported?
-   Are assumptions and limitations disclosed?

## Functional gate

-   Does every visible control work?
-   Does the system respond to actual player actions?
-   Are component and scenario states consistent?
-   Are findings recorded correctly?
-   Does task progression work?
-   Are there placeholder features presented as complete?

## Educational gate

-   Does the feature teach something meaningful?
-   Does the player understand what is being inspected?
-   Is feedback specific and useful?
-   Does the activity encourage sound maintenance reasoning?

If a feature fails a relevant gate, refine it before declaring it
complete.

------------------------------------------------------------------------

# 14. Development process requirements

For all future work:

1.  Inspect the relevant existing implementation before editing.
2.  Preserve working functionality.
3.  Avoid unnecessary rewrites.
4.  Stay within the approved milestone scope.
5.  Identify technical and data limitations before implementing complex
    features.
6.  Never claim an untested feature is complete.
7.  Identify placeholder assets and provisional data explicitly.
8.  Do not invent technical facts to fill gaps.
9.  Do not compromise visual consistency when adding features.
10. Provide a concise implementation summary and test evidence.

When a design decision affects aircraft accuracy, data architecture,
performance, or a major workflow, explain the options and trade-offs
before committing to it.

Use reference-driven development. Compare the implementation against
genuine visual references and appropriate technical documentation.
Identify inaccuracies and refine them.

------------------------------------------------------------------------

# 15. Visual Reference Library

The following images are visual references for the development team and
AI agent. They are not maintenance instructions. Use them to study
appearance, scale, materials, lighting, and real maintenance context.

**Important:** Remote images may require an internet connection. If an
image does not load, open its source page. For a durable local reference
library, download only images that may legally be used for project
reference, preserve their source attribution, and store them in a
`references/visual/` folder. Do not redistribute copyrighted images or
use them as game assets without permission.

## Reference A --- Full A320 in a maintenance hangar

![Airbus A320 undergoing maintenance in a
hangar](https://www.amacaerospace.com/wp-content/uploads/2021/02/amac_A320_1_R_LR-1080x675.jpg)

Source: [AMAC Aerospace --- A320 C-check and
modifications](https://www.amacaerospace.com/successful-re-delivery-of-airbus-a320-after-c-check-and-minor-modifications/)

**Study:** aircraft scale, nose access, hangar dimensions, platforms,
ladders, scaffolding, floor finish, and the density of real maintenance
equipment.

**Use for:** hangar composition, aircraft presentation, access equipment
placement, and environmental scale.

## Reference B --- Open A320 engine and maintenance work

![A320 engine with cowling opened during
maintenance](https://www.amacaerospace.com/wp-content/uploads/2022/08/IMG_8994_LR.jpg)

Source: [AMAC Aerospace --- A320 maintenance tasks and AOG
support](https://www.amacaerospace.com/within-a-reduced-ground-time-two-completed-maintenance-tasks-and-aog-support-on-airbus-aircraft/)

**Study:** open nacelle appearance, engine access, fan visibility,
internal structure, work platforms, tools, and realistic workshop
context.

**Use for:** engine visual modeling and the hangar environment around
engine maintenance.

## Reference C --- Technician inspecting an A320 engine

![Technician inspecting an open aircraft
engine](https://media.licdn.com/dms/image/v2/D5622AQFj8qe5FRLk-w/feedshare-shrink_800/B56ZnNpizjIAAg-/0/1760091845365?e=2147483647&t=stpt_xOUSHgkNFnCtCrjlrl_dqplSUjQW-rRAQC3tP4&v=beta)

Source: [Lufthansa Technik LinkedIn
post](https://www.linkedin.com/posts/lufthansa-technik_having-an-airbus-a320-in-our-hamburg-hangar-activity-7331219131565797376-cM8N)

**Study:** human scale, technician posture, protective clothing, engine
access, inspection lighting, and the amount of visible detail around an
opened engine.

**Use for:** human/environment scale and engine inspection staging.
Verify the exact aircraft configuration independently.

## Reference D --- Landing gear and hydraulic-area maintenance

![Aircraft landing gear and hydraulic components during
maintenance](https://static.wixstatic.com/media/4f8d02_4db75bccd52846cc9d917c458cd00762~mv2.png/v1/fill/w_800%2Ch_533%2Cal_c%2Cq_90%2Cenc_avif%2Cquality_auto/4f8d02_4db75bccd52846cc9d917c458cd00762~mv2.png)

Source: [AVAET --- A320 hydraulic system technical
guide](https://www.avaet.com/post/airbus-a320-hydraulic-system-a-technical-guide-for-amts-in-aircraft-and-ground-operations)

**Study:** landing gear scale, hydraulic lines, actuators,
jacking/support equipment, underbody access, and the visual complexity
of real assemblies.

**Use for:** landing gear area, visible hydraulic routing, and
maintenance equipment. Do not infer exact routing or procedures from
this photograph.

## Reference E --- Landing gear component inspection

![Technician inspecting a landing gear
component](https://www.safran-group.com/sites/default/files/crops/rt_i_3_2/public/paragraph/106125/img/original/SAF2018_0256658.jpg?itok=s9-Ar8EZ)

Source: [Safran --- Main and nose landing gears for Airbus single-aisle
aircraft](https://www.safran-group.com/products-services/main-and-nose-landing-gears-airbus-single-aisle-aircraft-family)

**Study:** machined metal surfaces, component proportions, inspection
posture, protective equipment, and close-up presentation of landing gear
assemblies.

**Use for:** material quality and component-level visual detail. Confirm
the pictured assembly's applicability before modeling exact geometry.

## Reference F --- A320 external access hatch detail

![Aircraft fuselage maintenance hatch
detail](https://upload.wikimedia.org/wikipedia/commons/6/65/MFRL_OE-LZO.jpg)

Source: [Wikimedia Commons --- aircraft maintenance hatch
photograph](https://upload.wikimedia.org/wikipedia/commons/6/65/MFRL_OE-LZO.jpg)

**Study:** fuselage skin, fasteners, panel edges, surface finish,
rain/water behavior, and the visual transition between exterior skin and
an access opening.

**Use for:** exterior surface detail and access-panel presentation.
Verify panel identity and location against approved references.

## Reference G --- Digital maintenance task card interface

![Digital aircraft maintenance task card
interface](https://www.ramco.com/hs-fs/hubfs/Paperless-Maintenance-Operations.jpg?height=1300&name=Paperless-Maintenance-Operations.jpg&width=1574)

Source: [Ramco Systems --- Aviation MRO
software](https://www.ramco.com/products/aviation-software/mro-industry/)

**Study:** structured task instructions, dense but readable technical
information, checkboxes, task status, sign-off placement, and document
hierarchy.

**Use for:** task-card and maintenance-workflow interface inspiration.
Do not copy the vendor's branding or proprietary interface.

## Reference H --- Interactive A320 engine familiarization

![Interactive 3D A320 engine familiarization
example](https://store-images.s-microsoft.com/image/apps.5182.14518737887928851.ffd2107f-0c3f-4e25-b0d9-1847dff6e429.850170a5-4e06-41ea-9d81-277d26612dd3)

Source: [Microsoft Store --- Airbus A320 General Familiarization
Course](https://apps.microsoft.com/detail/9p0wqpwbx524?gl=IT&hl=it-IT)

**Study:** how a 3D engine can be presented as a learning object, how
hotspots can identify components, and how an aircraft context can
support component familiarization.

**Use for:** interactive 3D learning presentation. Treat this as an
interface/interaction reference, not as a technical authority.

## Reference I --- A320 maintenance hangar and facility scale

Source: [Airbus --- Sepang Aircraft Engineering hangar
opening](https://www.airbus.com/en/newsroom/press-releases/2017-09-sepang-aircraft-engineering-opens-second-hangar)

**Study:** professional MRO facility organization, hangar capacity,
workshop context, and the relationship between aircraft maintenance and
component workshops.

**Use for:** hangar layout and environmental planning.

------------------------------------------------------------------------

# 16. Reference-use rules

The references above are not all the same type of evidence.

-   **Photographs** are for visual appearance, scale, materials, and
    maintenance context.
-   **Software screenshots** are for information hierarchy and
    interaction ideas.
-   **Technical documentation** is for verified aircraft information,
    subject to applicability and access rights.
-   **Marketing material** can demonstrate product presentation but must
    not be treated as proof of technical accuracy.

Do not: - assume every photographed aircraft is the exact A320 variant
selected for the simulator; - infer hidden component geometry from an
exterior photograph; - infer maintenance limits or procedures from an
image; - copy commercial training assets or proprietary interface
designs; - use a reference image as a replacement for technical
verification.

When a reference conflicts with verified technical information,
technical information takes priority for aircraft accuracy. For general
visual styling, use the photograph as a guide without copying protected
assets.

------------------------------------------------------------------------

# 17. Additional reference research targets

When more references are needed, search for genuine examples of:

-   A320 base maintenance and C-check hangars;
-   A320 engine cowlings open during maintenance;
-   A320 CFM56 and/or V2500 engine details, matching the selected
    aircraft configuration;
-   A320neo LEAP-1A or PW1100G details only if the selected
    configuration requires them;
-   A320 nose and main landing gear close-ups;
-   A320 brake and wheel assemblies;
-   A320 access panels and fuselage panel seams;
-   A320 wing inspection and control-surface details;
-   aircraft maintenance stands, lifts, and ground-support equipment;
-   real MRO task cards and digital maintenance records;
-   professional aircraft technical training interfaces;
-   interactive 3D aircraft familiarization products.

Prefer Airbus, established MRO organizations, aircraft component
manufacturers, regulators, and reputable aviation training providers.
Record the source and the reason each reference is useful.

------------------------------------------------------------------------

# 18. Final acceptance standard

The final simulator should feel like a professional aviation maintenance
training environment.

A learner should be able to: 1. Enter a believable hangar. 2. Encounter
a convincingly represented A320 in a defined configuration. 3. Receive a
structured training assignment. 4. Navigate to the correct aircraft
area. 5. Select and inspect relevant components. 6. Consult contextual
technical information. 7. Identify a scenario discrepancy. 8. Record
findings accurately within the training exercise. 9. Receive useful
feedback. 10. Complete the task with a consistent record of what
occurred.

The aircraft must look convincing at close range. The environment must
feel believable. The interface must be professionally designed. The
maintenance activities must have educational value. The underlying
systems must behave consistently.

**Do not optimize for a screenshot that looks impressive while the
actual simulator is shallow. Optimize for a complete, coherent,
technically grounded experience.**
