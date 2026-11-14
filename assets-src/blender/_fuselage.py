"""Fuselage of the A320-214: skin panels, doors, exits, windows, glazing, belly fairing.

The fuselage is a surface S(x, a): x metres aft of the nose, a degrees around the
section (0 = aircraft right, 90 = crown, 180 = left, 270 = keel). Every part is a
patch of that surface, so skins, doors and windows fit each other exactly.

Sourced (airbus_ac_a320): door and exit stations and opening sizes (src/data/aircraft.ts).
Measured from the Airbus side view: section outline, cabin window stations.
PROVISIONAL: window size and height, cockpit glazing outlines, door sill heights,
skin panel split lines, belly fairing shape, radome length.
"""

import math

import bmesh
import common

LENGTH = 37.57
CROWN_Z = 5.87
KEEL_Z = 1.79
HALF_WIDTH = 3.95 / 2

# x, top z, bottom z, half width — measured from the dimension figure silhouettes.
STATIONS = [
    (0.00, 3.21, 2.98, 0.10), (0.20, 3.50, 2.70, 0.36), (0.50, 3.77, 2.45, 0.615),
    (1.00, 4.05, 2.24, 0.935), (1.50, 4.36, 2.09, 1.155), (2.00, 4.86, 1.98, 1.34),
    (2.50, 5.16, 1.90, 1.49), (3.00, 5.36, 1.84, 1.63), (3.50, 5.53, 1.81, 1.73),
    (4.00, 5.66, 1.79, 1.815), (4.50, 5.73, 1.79, 1.88), (5.00, 5.81, 1.79, 1.91),
    (5.50, 5.84, 1.79, 1.95), (6.00, CROWN_Z, KEEL_Z, HALF_WIDTH),
    (24.00, CROWN_Z, 1.82, HALF_WIDTH), (25.00, CROWN_Z, 1.87, HALF_WIDTH),
    (26.00, CROWN_Z, 1.95, HALF_WIDTH), (27.00, CROWN_Z, 2.06, 1.95),
    (28.00, CROWN_Z, 2.23, 1.90), (29.00, CROWN_Z, 2.45, 1.80), (30.00, CROWN_Z, 2.66, 1.66),
    (31.00, CROWN_Z, 2.88, 1.50), (32.00, CROWN_Z, 3.12, 1.29), (33.00, CROWN_Z, 3.38, 1.10),
    (34.00, 5.78, 3.65, 0.92), (35.00, 5.61, 3.93, 0.74), (36.00, 5.52, 4.21, 0.56),
    (37.00, 5.38, 4.50, 0.36), (37.50, 5.25, 4.74, 0.16), (LENGTH, 5.20, 4.85, 0.12),
]  # fmt: skip

# Left edge of each cabin window, metres aft of the nose (measured from the side view).
WINDOW_STATIONS = [
    6.03, 6.56, 7.09, 7.62, 8.20, 8.72, 9.23, 9.79, 10.34, 10.88, 11.42, 11.98, 12.54, 13.06,
    13.59, 15.82, 16.37, 16.90, 17.43, 17.96, 18.49, 19.01, 19.57, 20.10, 20.63, 21.17, 21.71,
    22.26, 22.80, 23.34, 23.88, 24.41, 24.92, 25.46, 25.99, 26.51, 27.02, 27.56,
]  # fmt: skip
WINDOW_WIDTH, WINDOW_Z0, WINDOW_Z1 = 0.23, 4.24, 4.57

# Door sill heights above the floor (PROVISIONAL, from the drawing's door outlines).
PAX_SILL_Z = 3.42
EXIT_SILL_Z = 4.02
CARGO_SILL_Z = 2.02


def _hermite(channel, x):
    """Smooth interpolation of one STATIONS column, with no overshoot in flat runs."""
    pts = [(s[0], s[channel]) for s in STATIONS]
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        if x <= x1 or i == len(pts) - 2:
            def slope(j):
                if j <= 0 or j >= len(pts) - 1:
                    return 0.0
                a = (pts[j][1] - pts[j - 1][1]) / (pts[j][0] - pts[j - 1][0])
                b = (pts[j + 1][1] - pts[j][1]) / (pts[j + 1][0] - pts[j][0])
                return 0.0 if a * b <= 0 else 2 * a * b / (a + b)

            h = x1 - x0
            t = min(max((x - x0) / h, 0.0), 1.0)
            m0, m1 = slope(i) * h, slope(i + 1) * h
            return (
                (2 * t**3 - 3 * t**2 + 1) * y0 + (t**3 - 2 * t**2 + t) * m0
                + (-2 * t**3 + 3 * t**2) * y1 + (t**3 - t**2) * m1
            )  # fmt: skip
    return pts[-1][1]


def section(x):
    """Centre height, half height and half width of the fuselage at station x."""
    top, bottom, half_width = _hermite(1, x), _hermite(2, x), _hermite(3, x)
    return (top + bottom) / 2, (top - bottom) / 2, half_width


def surf(x, a_deg, offset=0.0):
    centre, half_height, half_width = section(x)
    a = math.radians(a_deg)
    ny, nz = math.cos(a) / half_width, math.sin(a) / half_height
    n = math.hypot(ny, nz) or 1.0
    return (
        x,
        half_width * math.cos(a) + offset * ny / n,
        centre + half_height * math.sin(a) + offset * nz / n,
    )


def angle_at(x, z, left=False):
    """Angle around the section at which the right (or left) side reaches height z."""
    centre, half_height, _ = section(x)
    a = math.degrees(math.asin(min(max((z - centre) / half_height, -1.0), 1.0)))
    return 180.0 - a if left else a


def _steps(x0, x1):
    """Sample stations: fine where the section changes, coarse along the constant barrel."""
    xs = {x0, x1}
    x = math.ceil(x0 * 10) / 10
    while x < x1:
        if x < 6.3 or x > 23.7:
            xs.add(round(x, 2))
        elif abs(x * 2 - round(x * 2)) < 1e-6:
            xs.add(round(x, 2))
        x += 0.1
    return sorted(xs)


def patch(bm, xs, a_lo, a_hi, offset=0.0, material_index=0, a_step=5.0):
    """Add the surface between stations xs and angles a_lo(x)..a_hi(x), facing outward."""
    uv_layer = bm.loops.layers.uv.verify()
    lo0, hi0 = a_lo(xs[0]), a_hi(xs[0])
    count = max(1, round(abs(hi0 - lo0) / a_step))
    grid = []
    for x in xs:
        lo, hi = a_lo(x), a_hi(x)
        row = []
        for j in range(count + 1):
            a = lo + (hi - lo) * j / count
            row.append((bm.verts.new(surf(x, a, offset)), (x / 2.0, math.radians(a) * HALF_WIDTH / 2.0)))
        grid.append(row)
    for i in range(len(xs) - 1):
        for j in range(count):
            corners = [grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]]
            face = bm.faces.new([c[0] for c in corners])
            face.material_index = material_index
            for loop, corner in zip(face.loops, corners):
                loop[uv_layer].uv = corner[1]
    return bm


def _band(a0, a1):
    return (lambda x: a0), (lambda x: a1)


def _between_heights(z0, z1, left):
    if left:
        return (lambda x: angle_at(x, z1, True)), (lambda x: angle_at(x, z0, True))
    return (lambda x: angle_at(x, z0)), (lambda x: angle_at(x, z1))


def _linspace(x0, x1, n):
    return [x0 + (x1 - x0) * i / n for i in range(n + 1)]


def _door(name, x_centre, width, z0, z1, left, materials):
    """A door: a dark gap around the edge with the door skin standing just proud of it."""
    bm = bmesh.new()
    gap = 0.012
    lo, hi = _between_heights(z0 - gap, z1 + gap, left)
    patch(bm, _linspace(x_centre - width / 2, x_centre + width / 2, 6), lo, hi, 0.002, 1, a_step=4)
    lo, hi = _between_heights(z0, z1, left)
    patch(bm, _linspace(x_centre - width / 2 + gap, x_centre + width / 2 - gap, 6), lo, hi, 0.005, 0, 4)
    obj = common.object_from_bmesh(name, bm, materials, recalc_normals=False)
    common.mark_inspectable(obj)
    return obj


def _skin(name, x0, x1, a0, a1, materials, cap=None):
    bm = bmesh.new()
    lo, hi = _band(a0, a1)
    patch(bm, _steps(x0, x1), lo, hi)
    if cap is not None:
        ring = [bm.verts.new(surf(cap, a)) for a in range(0, 360, 5)]
        bm.faces.new(ring if cap > 1 else list(reversed(ring)))
    obj = common.object_from_bmesh(name, bm, materials, recalc_normals=False)
    common.mark_inspectable(obj)
    return obj


def _quad(bm, corners, offset, material_index, n=6):
    """A patch whose (x, angle) corners are given in order: fwd-low, aft-low, aft-high, fwd-high."""
    (x0, a0), (x1, a1), (x2, a2), (x3, a3) = corners
    grid = []
    for i in range(n + 1):
        s = i / n
        row = []
        for j in range(n + 1):
            t = j / n
            x = (1 - t) * ((1 - s) * x0 + s * x1) + t * ((1 - s) * x3 + s * x2)
            a = (1 - t) * ((1 - s) * a0 + s * a1) + t * ((1 - s) * a3 + s * a2)
            row.append(bm.verts.new(surf(x, a, offset)))
        grid.append(row)
    flip = a3 < a0  # left-side patches run the other way round the section
    for i in range(n):
        for j in range(n):
            verts = [grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]]
            bm.faces.new(list(reversed(verts)) if flip else verts).material_index = material_index


def _glazing(name, corners, left, materials):
    """A flight-deck window: dark frame with the glass set just proud of it."""
    if left:
        corners = [(x, 180.0 - a) for x, a in corners]
    bm = bmesh.new()
    cx = sum(c[0] for c in corners) / 4
    ca = sum(c[1] for c in corners) / 4
    frame = [(cx + (x - cx) * 1.08, ca + (a - ca) * 1.08) for x, a in corners]
    _quad(bm, frame, 0.002, 1)
    _quad(bm, corners, 0.005, 0)
    obj = common.object_from_bmesh(name, bm, materials, recalc_normals=False)
    common.mark_inspectable(obj)


def _cabin_windows(name, left, materials):
    bm = bmesh.new()
    frame = 0.02
    for x in WINDOW_STATIONS:
        lo, hi = _between_heights(WINDOW_Z0 - frame, WINDOW_Z1 + frame, left)
        patch(bm, _linspace(x - frame, x + WINDOW_WIDTH + frame, 2), lo, hi, 0.002, 1, a_step=3)
        lo, hi = _between_heights(WINDOW_Z0, WINDOW_Z1, left)
        patch(bm, _linspace(x, x + WINDOW_WIDTH, 2), lo, hi, 0.005, 0, a_step=3)
    obj = common.object_from_bmesh(name, bm, materials, recalc_normals=False)
    common.mark_inspectable(obj)


FAIRING_STATIONS = [
        (11.3, 0.02, 0.02), (11.9, 1.55, 0.25), (13.2, 2.12, 0.40), (16.0, 2.18, 0.42),
        (19.4, 2.12, 0.40), (20.9, 1.50, 0.22), (21.6, 0.02, 0.02),
]  # fmt: skip
FAIRING_TOP_Z = 2.95


def fairing_bottom_z(x, y):
    """Height of the belly fairing's underside at station x and lateral position y."""
    for (x0, w0, d0), (x1, w1, d1) in zip(FAIRING_STATIONS, FAIRING_STATIONS[1:]):
        if x0 <= x <= x1:
            t = (x - x0) / (x1 - x0)
            half_width, depth = w0 + (w1 - w0) * t, d0 + (d1 - d0) * t
            bottom = KEEL_Z - depth
            centre, half_height = (FAIRING_TOP_Z + bottom) / 2, (FAIRING_TOP_Z - bottom) / 2
            c = min(abs(y) / half_width, 1.0) ** (1 / 0.6)
            return centre - half_height * math.sqrt(max(0.0, 1 - c * c)) ** 0.6
    return KEEL_Z


def _belly_fairing(materials):
    """Wing-to-fuselage fairing under the centre section (shape PROVISIONAL)."""
    rings = []
    for x, half_width, depth in FAIRING_STATIONS:
        top = FAIRING_TOP_Z
        bottom = KEEL_Z - depth
        centre, half_height = (top + bottom) / 2, (top - bottom) / 2
        ring = []
        for i in range(40):
            a = 2 * math.pi * i / 40
            # A rounded-rectangle section, flatter underneath than a circle.
            c, s = math.cos(a), math.sin(a)
            ring.append((x, half_width * math.copysign(abs(c) ** 0.6, c), centre + half_height * math.copysign(abs(s) ** 0.6, s)))
        rings.append(ring)
    bm = bmesh.new()
    common.loft(bm, rings)
    obj = common.object_from_bmesh("belly_fairing", bm, materials)
    common.mark_inspectable(obj)


def build(paint, glass, gap, exhaust, doors):
    """Create every fuselage object. doors maps door ids to (x, width, height)."""
    skin = [paint]
    radome_end, nose_end, mid, tail_start = 1.0, 5.6, 15.9, 33.6

    _skin("radome", 0.0, radome_end, 0, 360, skin, cap=0.0)
    _skin("nose_skin_rh", radome_end, nose_end, -90, 90, skin)
    _skin("nose_skin_lh", radome_end, nose_end, 90, 270, skin)
    for prefix, x0, x1 in (("fwd_fuselage", nose_end, mid), ("aft_fuselage", mid, tail_start)):
        _skin(f"{prefix}_skin_rh", x0, x1, -45, 90, skin)
        _skin(f"{prefix}_skin_lh", x0, x1, 90, 225, skin)
        _skin(f"{prefix}_belly", x0, x1, 225, 315, skin)
    _skin("tail_cone", tail_start, LENGTH, 0, 360, skin)

    bm = bmesh.new()
    ring = [bm.verts.new(surf(LENGTH, a)) for a in range(0, 360, 10)]
    bm.faces.new(ring)
    common.mark_inspectable(common.object_from_bmesh("apu_exhaust", bm, [exhaust], recalc_normals=False))

    door_mats = [paint, gap]
    for left, suffix in ((True, "lh"), (False, "rh")):
        for key, sill in (("pax_door_fwd", PAX_SILL_Z), ("pax_door_aft", PAX_SILL_Z),
                          ("overwing_exit_fwd", EXIT_SILL_Z), ("overwing_exit_aft", EXIT_SILL_Z)):  # fmt: skip
            x, width, height = doors[key]
            _door(f"{key}_{suffix}", x, width, sill, sill + height, left, door_mats)
        _cabin_windows(f"cabin_windows_{suffix}", left, [glass, gap])
        # Flight-deck glazing outlines (PROVISIONAL): (station, angle) corners on the right side.
        _glazing(f"windshield_{suffix}", [(1.52, 52), (2.12, 50), (2.12, 86), (1.52, 84)], left, [glass, gap])
        _glazing(f"sliding_window_{suffix}", [(2.22, 24), (2.86, 23), (2.80, 48), (2.20, 49)], left, [glass, gap])
        _glazing(f"fixed_side_window_{suffix}", [(2.94, 23), (3.40, 25), (3.28, 44), (2.90, 47)], left, [glass, gap])

    for key in ("fwd_cargo_door", "aft_cargo_door", "bulk_cargo_door"):
        x, width, height = doors[key]
        keel = section(x)[0] - section(x)[1]
        sill = max(CARGO_SILL_Z, keel + 0.25)
        _door(key, x, width, sill, sill + height, False, door_mats)

    _belly_fairing(skin)
