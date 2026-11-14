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

import _fuselage  # noqa: E402
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

WING_LE_X_AT_2_5 = 13.18
WING_LE_SLOPE = 0.518  # metres aft per metre outboard
WING_TE_INBOARD_X = 18.86
WING_KINK_ETA = 6.4
WING_TE_OUTBOARD_SLOPE = 0.306
WING_Z_AT_2 = 2.96
WING_DIHEDRAL_SLOPE = 0.093

TAIL_LE_X_AT_2 = 32.88
TAIL_LE_SLOPE = 0.648
TAIL_TE_TIP_X = 36.72
TAIL_TE_SLOPE = 0.22
TAIL_Z_ROOT = 4.55
TAIL_DIHEDRAL_SLOPE = 0.1275

FIN_LE_X_AT_6_3 = 30.0
FIN_LE_SLOPE = 0.936  # metres aft per metre up
FIN_TE_X_AT_5_9 = 35.4
FIN_TE_SLOPE = 0.215

# --- Provisional shape parameters ------------------------------------------
WING_THICKNESS = [(0.0, 0.150), (4.0, 0.130), (WING_KINK_ETA, 0.118), (HALF_SPAN, 0.108)]
NACELLE_RADIUS = 1.16


def lerp_table(table, x):
    for (x0, y0), (x1, y1) in zip(table, table[1:]):
        if x <= x1:
            t = (x - x0) / (x1 - x0)
            return y0 + (y1 - y0) * max(0.0, t)
    return table[-1][1]


def aerofoil(thickness, camber=0.0, points=18):
    """NACA four-digit style section as a closed loop of (x/c, z/c): upper TE to LE, lower LE to TE."""
    def half(xc):
        yt = 5 * thickness * (
            0.2969 * math.sqrt(xc) - 0.1260 * xc - 0.3516 * xc**2 + 0.2843 * xc**3 - 0.1036 * xc**4
        )
        p = 0.4
        yc = camber / p**2 * (2 * p * xc - xc**2) if xc < p else camber / (1 - p) ** 2 * (
            (1 - 2 * p) + 2 * p * xc - xc**2
        )
        return yt, yc

    xs = [0.5 * (1 - math.cos(math.pi * i / points)) for i in range(points + 1)]
    upper = [(x, half(x)[1] + half(x)[0]) for x in reversed(xs)]
    lower = [(x, half(x)[1] - half(x)[0]) for x in xs[1:-1]]
    return upper + lower


def wing_section(eta):
    le = WING_LE_X_AT_2_5 + WING_LE_SLOPE * (eta - 2.5)
    te = WING_TE_INBOARD_X + WING_TE_OUTBOARD_SLOPE * max(0.0, eta - WING_KINK_ETA)
    z = WING_Z_AT_2 + WING_DIHEDRAL_SLOPE * max(0.0, eta - 2.0)
    return le, te - le, z, lerp_table(WING_THICKNESS, eta)


def tail_section(eta):
    le = TAIL_LE_X_AT_2 + TAIL_LE_SLOPE * (eta - 2.0)
    te = TAIL_TE_TIP_X - TAIL_TE_SLOPE * (HALF_TAIL_SPAN - eta)
    return le, te - le, TAIL_Z_ROOT + TAIL_DIHEDRAL_SLOPE * eta, 0.10


def surface_rings(section, etas, side, camber):
    """Rings for a wing-like surface; side is -1 for left, +1 for right."""
    rings = []
    for eta in etas:
        le, chord, z, thickness = section(eta)
        ring = [(le + xc * chord, side * eta, z + zc * chord) for xc, zc in aerofoil(thickness, camber)]
        rings.append(ring if side > 0 else list(reversed(ring)))
    return rings


def fin_rings():
    top = CROWN_Z + FIN_HEIGHT_ABOVE_CROWN
    rings = []
    for z in (5.60, 6.30, 8.00, 10.00, top):
        le = FIN_LE_X_AT_6_3 + FIN_LE_SLOPE * (z - 6.3)
        te = FIN_TE_X_AT_5_9 + FIN_TE_SLOPE * (z - 5.9)
        rings.append([(le + xc * (te - le), zc * (te - le), z) for xc, zc in aerofoil(0.10)])
    return rings


def add_wheel(bm, x, y, tire, materials):
    """A wheel and tire with its axle along Y, resting on the floor. materials = (rubber, hub) indices."""
    diameter, width = tire
    radius, w = diameter / 2, width / 2
    rim = radius * 0.46
    place = lambda lx, ly, lz: (x - ly, y + lx, radius + lz)  # noqa: E731 - local X becomes world Y
    tire_profile = [
        (-w * 0.5, rim), (-w, rim + 0.05), (-w, (radius + rim) / 2 + 0.03), (-w * 0.86, radius - 0.045),
        (-w * 0.62, radius), (w * 0.62, radius), (w * 0.86, radius - 0.045),
        (w, (radius + rim) / 2 + 0.03), (w, rim + 0.05), (w * 0.5, rim),
    ]  # fmt: skip
    common.revolve(bm, tire_profile, 48, material_index=materials[0], place=place)
    hub_profile = [(-w * 0.45, 0.0), (-w * 0.45, rim), (w * 0.45, rim), (w * 0.45, 0.0)]
    common.revolve(bm, hub_profile, 32, material_index=materials[1], place=place)


def add_strut(bm, x, y, z0, z1, radius, material_index):
    sides = 16
    ring = lambda z: [  # noqa: E731
        (x + radius * math.cos(a), y + radius * math.sin(a), z)
        for a in (2 * math.pi * i / sides for i in range(sides))
    ]
    common.loft(bm, [ring(z0), ring(z1)], material_index=material_index)


def nacelle(bm, y):
    z = NACELLE_CLEARANCE + NACELLE_RADIUS
    place = lambda lx, ly, lz: (lx, y + ly, z + lz)  # noqa: E731
    x0 = ENGINE_INLET_X
    cowl = [
        (x0, 0.98), (x0 + 0.06, 1.04), (x0 + 0.31, 1.11), (x0 + 1.11, NACELLE_RADIUS),
        (x0 + 2.21, 1.14), (x0 + 3.11, 1.02), (x0 + 3.56, 0.93), (x0 + 3.56, 0.90),
        (x0 + 2.81, 0.92), (x0 + 1.01, 0.90), (x0 + 0.31, 0.88), (x0 + 0.06, 0.91), (x0, 0.98),
    ]  # fmt: skip
    common.revolve(bm, cowl, 64, material_index=0, place=place)
    core = [(x0 + 2.4, 0.0), (x0 + 2.4, 0.70), (x0 + 3.4, 0.66), (x0 + 4.3, 0.42), (x0 + 4.3, 0.30), (x0 + 4.1, 0.30)]
    common.revolve(bm, core, 48, material_index=1, place=place)
    plug = [(x0 + 4.0, 0.28), (x0 + 4.4, 0.24), (x0 + 4.8, 0.0)]
    common.revolve(bm, plug, 32, material_index=1, place=place)
    fan = [(x0 + 0.55, 0.0), (x0 + 0.72, 0.18), (x0 + 0.92, 0.30), (x0 + 0.92, 0.88)]
    common.revolve(bm, fan, 48, material_index=2, place=place)


def pylon(bm, y):
    nacelle_top = NACELLE_CLEARANCE + 2 * NACELLE_RADIUS - 0.08
    _, _, wing_z, _ = wing_section(ENGINE_Y)
    box = lambda x0, x1, z, half: [(x0, y - half, z), (x1, y - half, z), (x1, y + half, z), (x0, y + half, z)]  # noqa: E731
    x0 = ENGINE_INLET_X
    common.loft(bm, [box(x0 + 0.9, x0 + 4.2, nacelle_top, 0.20), box(x0 + 2.4, x0 + 6.3, wing_z - 0.05, 0.16)])


def build():
    common.reset_scene()
    paint = common.material("fuselage_paint", (0.60, 0.62, 0.64), metallic=0.5, roughness=0.4, coat=1.0)
    hot_metal = common.material("engine_metal", (0.30, 0.30, 0.31), metallic=1.0, roughness=0.45)
    dark = common.material("fan_dark", (0.03, 0.03, 0.035), metallic=0.6, roughness=0.5)
    gear_paint = common.material("gear_paint", (0.55, 0.56, 0.57), metallic=0.3, roughness=0.5)
    rubber = common.material("tire_rubber", (0.012, 0.012, 0.013), roughness=0.95)

    glass = common.material("glass", (0.015, 0.02, 0.028), metallic=0.0, roughness=0.06)
    gap = common.material("panel_gap", (0.02, 0.02, 0.02), roughness=0.8)
    _fuselage.build(paint, glass, gap, hot_metal, DOORS)

    wing_etas = [0.0, 1.975, 4.0, WING_KINK_ETA, 9.0, 12.0, 15.0, HALF_SPAN - 0.02]
    tail_etas = [0.0, 1.0, 3.0, HALF_TAIL_SPAN]
    for side, suffix in ((-1, "lh"), (1, "rh")):
        bm = bmesh.new()
        common.loft(bm, surface_rings(wing_section, wing_etas, side, camber=0.02))
        # Wing tip fence: a thin swept plate above and below the tip (shape provisional).
        le, chord, z, _ = wing_section(HALF_SPAN)
        y = side * (HALF_SPAN - 0.02)
        fence = lambda dy: [  # noqa: E731
            (le + 0.15, y + dy, z), (le + chord + 0.25, y + dy, z + 0.95),
            (le + chord + 0.30, y + dy, z), (le + chord + 0.25, y + dy, z - 0.85),
        ]  # fmt: skip
        common.loft(bm, [fence(-0.02), fence(0.02)])
        common.object_from_bmesh(f"wing_{suffix}", bm, [paint])

        bm = bmesh.new()
        common.loft(bm, surface_rings(tail_section, tail_etas, side, camber=0.0))
        common.object_from_bmesh(f"horizontal_stabilizer_{suffix}", bm, [paint])

    bm = bmesh.new()
    common.loft(bm, fin_rings())
    common.object_from_bmesh("vertical_stabilizer", bm, [paint])

    for number, y in ((1, -ENGINE_Y), (2, ENGINE_Y)):
        bm = bmesh.new()
        nacelle(bm, y)
        common.object_from_bmesh(f"eng{number}_nacelle", bm, [paint, hot_metal, dark])
        bm = bmesh.new()
        pylon(bm, y)
        common.object_from_bmesh(f"eng{number}_pylon", bm, [paint])

    bm = bmesh.new()
    for y in (-NOSE_WHEEL_SPACING / 2, NOSE_WHEEL_SPACING / 2):
        add_wheel(bm, NOSE_GEAR_X, y, NOSE_TIRE, (0, 1))
    add_strut(bm, NOSE_GEAR_X, 0.0, NOSE_TIRE[0] / 2, 2.0, 0.07, 1)
    common.object_from_bmesh("nlg", bm, [rubber, gear_paint])

    main_x = NOSE_GEAR_X + WHEELBASE
    for side, suffix in ((-1, "lh"), (1, "rh")):
        bm = bmesh.new()
        for offset in (-MAIN_WHEEL_SPACING / 2, MAIN_WHEEL_SPACING / 2):
            add_wheel(bm, main_x, side * HALF_TRACK + offset, MAIN_TIRE, (0, 1))
        add_strut(bm, main_x, side * HALF_TRACK, MAIN_TIRE[0] / 2, wing_section(HALF_TRACK)[2], 0.11, 1)
        common.object_from_bmesh(f"mlg_{suffix}", bm, [rubber, gear_paint])


if __name__ == "__main__":
    args = common.parse_args()
    build()
    common.export_glb(args.out)
