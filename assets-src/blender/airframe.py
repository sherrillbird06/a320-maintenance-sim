"""A320-214 airframe: fuselage, wings, tail, nacelles, pylons and landing gear.

Milestone 1, slice 1: the aircraft's overall shape at real size. Components are
still merged into large parts here; later slices split them into the registry's
inspectable components and add surface detail.

Coordinates (metres): X runs aft from the nose, Y to the aircraft's right,
Z up from the hangar floor.

Where the numbers come from
- Overall dimensions, gear and engine positions: printed values in the Airbus
  Aircraft Characteristics document (source id airbus_ac_a320), Figure
  2-2-0-991-004-A01. These are also in src/data/aircraft.ts and are checked by
  tests/unit/airframe.test.ts.
- Fuselage, wing, tail and nacelle outlines: MEASURED from the silhouettes in
  that same figure (about 1.5 cm per pixel). Accurate to a few centimetres.
- PROVISIONAL, not sourced: aerofoil sections and thickness, nacelle and pylon
  cross-sections, landing gear strut shapes, wing tip fence shape. These are
  plausible stand-ins and are replaced or verified in later slices.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import _engine  # noqa: E402
import _fuselage  # noqa: E402
import _gear  # noqa: E402
import _surfaces  # noqa: E402
import bmesh  # noqa: E402
import common  # noqa: E402

INCH = 0.0254

# --- Printed dimensions (airbus_ac_a320) -----------------------------------
LENGTH = 37.57
HALF_SPAN = 34.10 / 2
FUSELAGE_HALF_WIDTH = 3.95 / 2
FIN_HEIGHT_ABOVE_CROWN = 5.87
HALF_TAIL_SPAN = 12.45 / 2
NOSE_GEAR_X = 5.07
WHEELBASE = 12.64
HALF_TRACK = 7.59 / 2
MAIN_WHEEL_SPACING = 0.93
NOSE_WHEEL_SPACING = 0.50
ENGINE_Y = 5.75
ENGINE_INLET_X = 11.19
NACELLE_CLEARANCE = 0.67
MAIN_TIRE = (46 * INCH, 17 * INCH)  # 46x17R20: outside diameter, width
NOSE_TIRE = (30 * INCH, 8.8 * INCH)  # 30x8.8R15

# --- Measured from the figure silhouettes ----------------------------------
CROWN_Z = _fuselage.CROWN_Z

# Door and exit stations and opening sizes (x, width, height), from src/data/aircraft.ts.
DOORS = {
    "pax_door_fwd": (5.04, 0.81, 1.85),
    "pax_door_aft": (29.64, 0.81, 1.85),
    "overwing_exit_fwd": (14.43, 0.50, 0.90),
    "overwing_exit_aft": (15.28, 0.50, 0.90),
    "fwd_cargo_door": (8.16, 1.82, 1.24),
    "aft_cargo_door": (22.69, 1.82, 1.23),
    "bulk_cargo_door": (26.29, 0.95, 0.77),
}

# --- Provisional shape parameters ------------------------------------------
NACELLE_RADIUS = 1.16


def pylon(bm, y):
    nacelle_top = NACELLE_CLEARANCE + 2 * NACELLE_RADIUS - 0.08
    wing_z = _surfaces.wing_section(ENGINE_Y)[2]
    box = lambda x0, x1, z, half: [(x0, y - half, z), (x1, y - half, z), (x1, y + half, z), (x0, y + half, z)]  # noqa: E731
    x0 = ENGINE_INLET_X
    common.loft(bm, [box(x0 + 0.9, x0 + 4.2, nacelle_top, 0.20), box(x0 + 2.4, x0 + 6.3, wing_z - 0.05, 0.16)])


def build():
    common.reset_scene()
    paint = common.material("fuselage_paint", (0.70, 0.72, 0.74), metallic=0.2, roughness=0.4, coat=1.0)
    hot_metal = common.material("engine_metal", (0.30, 0.30, 0.31), metallic=1.0, roughness=0.45)
    dark = common.material("fan_dark", (0.03, 0.03, 0.035), metallic=0.6, roughness=0.5)
    blade_metal = common.material("fan_blade_metal", (0.36, 0.37, 0.39), metallic=1.0, roughness=0.32)
    gear_paint = common.material("gear_paint", (0.55, 0.56, 0.57), metallic=0.3, roughness=0.5)
    rubber = common.material("tire_rubber", (0.012, 0.012, 0.013), roughness=0.95)

    glass = common.material("glass", (0.015, 0.02, 0.028), metallic=0.0, roughness=0.06)
    gap = common.material("panel_gap", (0.02, 0.02, 0.02), roughness=0.8)
    _fuselage.build(paint, glass, gap, hot_metal, DOORS)

    for side, suffix in ((-1, "lh"), (1, "rh")):
        _surfaces.build_wing(side, suffix, paint)
        _surfaces.build_tailplane(side, suffix, paint)
    _surfaces.build_fin(CROWN_Z + FIN_HEIGHT_ABOVE_CROWN, paint)

    for number, y in ((1, -ENGINE_Y), (2, ENGINE_Y)):
        _engine.build(number, y, ENGINE_INLET_X, NACELLE_CLEARANCE, paint, hot_metal, dark, blade_metal)
        bm = bmesh.new()
        pylon(bm, y)
        common.mark_inspectable(common.object_from_bmesh(f"eng{number}_pylon", bm, [paint]))

    wheel_paint = common.material("wheel_paint", (0.42, 0.43, 0.44), metallic=0.35, roughness=0.5)
    bolt_steel = common.material("bolt_steel", (0.42, 0.42, 0.43), metallic=1.0, roughness=0.35)
    brake_dark = common.material("brake_carbon", (0.05, 0.05, 0.055), metallic=0.3, roughness=0.7)
    chrome = common.material("strut_chrome", (0.80, 0.80, 0.82), metallic=1.0, roughness=0.12)
    line = common.material("hydraulic_line", (0.20, 0.20, 0.21), metallic=0.9, roughness=0.4)
    wheel_mats = (rubber, wheel_paint, bolt_steel, brake_dark)
    structure = (gear_paint, chrome, dark, line)

    _gear.build_nose_gear(NOSE_GEAR_X, NOSE_WHEEL_SPACING, _fuselage.KEEL_Z, wheel_mats, structure)
    main_x = NOSE_GEAR_X + WHEELBASE
    for side, suffix, numbers in ((-1, "lh", (1, 2)), (1, "rh", (3, 4))):
        top_z = _surfaces.wing_section(HALF_TRACK)[2] - 0.22
        _gear.build_main_gear(side, suffix, numbers, main_x, HALF_TRACK, MAIN_WHEEL_SPACING, top_z, wheel_mats, structure)

    # Hydraulic service panels (stations from src/data/aircraft.ts); left is -Y.
    _gear.build_hydraulic_panels(
        {"green": (19.17, -1.27), "yellow": (19.17, 1.27), "blue": (20.22, -1.27)}, _fuselage.fairing_bottom_z, gap
    )


if __name__ == "__main__":
    args = common.parse_args()
    build()
    common.export_glb(args.out)
