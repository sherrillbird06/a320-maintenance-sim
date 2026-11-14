"""Wings, tailplane and fin of the A320-214, split into fixed structure and moving surfaces.

Each lifting surface is described by sections along its span. A part is the
slice of that surface between two span stations and two chord fractions, so
neighbouring parts share edges exactly.

Measured from the Airbus dimension figure: planform outlines, dihedral, fin outline.
PROVISIONAL: aerofoil shapes and thickness, the chord fraction and span station
of every slat, flap, spoiler, aileron, elevator and rudder split, flap track
fairing positions and shape, wing tip fence shape.
"""

import math

import bmesh
import common

HALF_SPAN = 34.10 / 2
HALF_TAIL_SPAN = 12.45 / 2
FUSELAGE_SIDE = 3.95 / 2

WING_LE_X_AT_2_5 = 13.18
WING_LE_SLOPE = 0.518
WING_TE_INBOARD_X = 18.86
WING_KINK_ETA = 6.4
WING_TE_OUTBOARD_SLOPE = 0.306
WING_Z_AT_2 = 2.96
WING_DIHEDRAL_SLOPE = 0.093
WING_THICKNESS = [(0.0, 0.150), (4.0, 0.130), (WING_KINK_ETA, 0.118), (HALF_SPAN, 0.108)]

TAIL_LE_X_AT_2 = 32.88
TAIL_LE_SLOPE = 0.648
TAIL_TE_TIP_X = 36.72
TAIL_TE_SLOPE = 0.22
TAIL_Z_ROOT = 4.55
TAIL_DIHEDRAL_SLOPE = 0.1275

FIN_LE_X_AT_6_3 = 30.0
FIN_LE_SLOPE = 0.936
FIN_TE_X_AT_5_9 = 35.4
FIN_TE_SLOPE = 0.215

# Chord fractions of the splits (PROVISIONAL).
SLAT_CHORD = 0.15
SPOILER_CHORD = 0.62
FLAP_CHORD = 0.75
ELEVATOR_CHORD = 0.68
RUDDER_CHORD = 0.70

WING_TIP = HALF_SPAN - 0.02
# Span stations of the moving surfaces, metres from the centreline (PROVISIONAL).
SLATS = [(2.7, 5.2), (6.3, 8.8), (8.8, 11.3), (11.3, 13.8), (13.8, 16.3)]
SPOILERS = [(3.3, 6.2), (6.6, 8.05), (8.05, 9.5), (9.5, 10.95), (10.95, 12.4)]
FLAP_INBOARD = (FUSELAGE_SIDE, WING_KINK_ETA)
FLAP_OUTBOARD = (WING_KINK_ETA, 12.45)
AILERON = (12.5, 16.2)
FLAP_TRACK_FAIRINGS = {2: 2.9, 3: 8.0, 4: 11.3}
ELEVATOR = (0.9, HALF_TAIL_SPAN - 0.05)


def _lerp_table(table, x):
    for (x0, y0), (x1, y1) in zip(table, table[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * max(0.0, (x - x0) / (x1 - x0))
    return table[-1][1]


def wing_section(eta):
    le = WING_LE_X_AT_2_5 + WING_LE_SLOPE * (eta - 2.5)
    te = WING_TE_INBOARD_X + WING_TE_OUTBOARD_SLOPE * max(0.0, eta - WING_KINK_ETA)
    z = WING_Z_AT_2 + WING_DIHEDRAL_SLOPE * max(0.0, eta - 2.0)
    return le, te - le, z, _lerp_table(WING_THICKNESS, eta), 0.02


def tail_section(eta):
    le = TAIL_LE_X_AT_2 + TAIL_LE_SLOPE * (eta - 2.0)
    te = TAIL_TE_TIP_X - TAIL_TE_SLOPE * (HALF_TAIL_SPAN - eta)
    return le, te - le, TAIL_Z_ROOT + TAIL_DIHEDRAL_SLOPE * eta, 0.10, 0.0


def fin_section(z):
    le = FIN_LE_X_AT_6_3 + FIN_LE_SLOPE * (z - 6.3)
    te = FIN_TE_X_AT_5_9 + FIN_TE_SLOPE * (z - 5.9)
    return le, te - le, 0.0, 0.10, 0.0


def _profile(xc, thickness, camber):
    """Half thickness and camber-line height of a NACA four-digit style section at x/c."""
    yt = 5 * thickness * (
        0.2969 * math.sqrt(xc) - 0.1260 * xc - 0.3516 * xc**2 + 0.2843 * xc**3 - 0.1036 * xc**4
    )
    p = 0.4
    if xc < p:
        yc = camber / p**2 * (2 * p * xc - xc**2)
    else:
        yc = camber / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * xc - xc**2)
    return yt, yc


def _chord_points(c0, c1, points):
    """Chord fractions from c0 to c1, bunched toward the leading edge."""
    t0, t1 = math.acos(1 - 2 * c0), math.acos(1 - 2 * c1)
    return [0.5 * (1 - math.cos(t0 + (t1 - t0) * i / points)) for i in range(points + 1)]


def band_loop(thickness, camber, c0, c1, points=10):
    """Closed section of an aerofoil between chord fractions c0 and c1: (x/c, z/c) pairs."""
    xs = _chord_points(c0, c1, points)
    upper = [(x, _profile(x, thickness, camber)[1] + _profile(x, thickness, camber)[0]) for x in reversed(xs)]
    lower = [(x, _profile(x, thickness, camber)[1] - _profile(x, thickness, camber)[0]) for x in xs]
    if c0 == 0.0:
        lower = lower[1:]  # the leading-edge point is shared
    return upper + lower


def _place(section, station, side, vertical):
    le, chord, height, thickness, camber = section(station)
    if vertical:
        return lambda xc, zc: (le + xc * chord, zc * chord, station), thickness, camber
    return lambda xc, zc: (le + xc * chord, side * station, height + zc * chord), thickness, camber


def solid(section, stations, c0, c1, side=1, vertical=False):
    """A closed body: the slice of a surface between chord fractions c0..c1 over the stations."""
    rings = []
    for station in stations:
        place, thickness, camber = _place(section, station, side, vertical)
        rings.append([place(xc, zc) for xc, zc in band_loop(thickness, camber, c0, c1)])
    bm = bmesh.new()
    common.loft(bm, rings)
    return bm


def skin(bm, section, stations, c0, c1, side, upper, lift=0.0, points=10):
    """An open strip of the upper or lower surface, optionally lifted off it by `lift` metres."""
    rows = []
    for station in stations:
        place, thickness, camber = _place(section, station, side, False)
        row = []
        for xc in _chord_points(c0, c1, points):
            yt, yc = _profile(xc, thickness, camber)
            x, y, z = place(xc, yc + (yt if upper else -yt))
            row.append(bm.verts.new((x, y, z + (lift if upper else -lift))))
        rows.append(row)
    # Winding that faces up for the upper surface and down for the lower, on either wing.
    forward = (side > 0) == upper
    for a, b in zip(rows, rows[1:]):
        for j in range(len(a) - 1):
            quad = [a[j], a[j + 1], b[j + 1], b[j]]
            bm.faces.new(quad if forward else list(reversed(quad)))
    return bm


def _span(lo, hi, breaks=()):
    """Stations from lo to hi, including any planform breaks that fall between them."""
    return [lo] + [b for b in breaks if lo < b < hi] + [hi]


GAP = 0.012  # clearance left around every moving surface, so its outline shows


def _skin_uv(x, y, z):
    """Plan-view UVs in 2 m tiles, matching the fuselage skin, for seams and rivets."""
    return (x / 2.0, y / 2.0)


def _named(name, bm, materials, recalc=True, uv=_skin_uv):
    obj = common.object_from_bmesh(name, bm, materials, recalc_normals=recalc)
    if uv is not None:
        common.planar_uv(obj, uv)
    common.mark_inspectable(obj)
    return obj


def web(bm, section, stations, chord_fraction, side, material_index=0):
    """A dark closing wall inside the wing at one chord fraction, seen through the surface gaps."""
    rows = []
    for station in stations:
        place, thickness, camber = _place(section, station, side, False)
        yt, yc = _profile(chord_fraction, thickness, camber)
        rows.append((bm.verts.new(place(chord_fraction, yc + yt)), bm.verts.new(place(chord_fraction, yc - yt))))
    for (a_top, a_bottom), (b_top, b_bottom) in zip(rows, rows[1:]):
        bm.faces.new((a_top, b_top, b_bottom, a_bottom)).material_index = material_index


def build_wing(side, suffix, paint, gap):
    mats = [paint]
    kink = (WING_KINK_ETA,)

    # Fixed structure: the box between the slats and the flaps, plus fixed leading and trailing edges.
    box_stations = _span(0.0, WING_TIP, (FUSELAGE_SIDE, 4.0, WING_KINK_ETA, 9.0, 12.0, 15.0))
    for upper, name in ((True, "wing_upper_skin"), (False, "wing_lower_skin")):
        bm = bmesh.new()
        skin(bm, wing_section, box_stations, SLAT_CHORD, FLAP_CHORD, side, upper, points=14)
        if upper:
            # Front and rear spar walls close the box behind the slats and ahead of the flaps.
            web(bm, wing_section, box_stations, SLAT_CHORD, side, 1)
            web(bm, wing_section, box_stations, FLAP_CHORD, side, 1)
        _named(f"{name}_{suffix}", bm, [paint, gap], recalc=False)
    fixed = [(0.0, SLATS[0][0], 0.0, SLAT_CHORD), (SLATS[0][1], SLATS[1][0], 0.0, SLAT_CHORD),
             (SLATS[-1][1], WING_TIP, 0.0, SLAT_CHORD), (0.0, FLAP_INBOARD[0], FLAP_CHORD, 1.0),
             (FLAP_OUTBOARD[1], AILERON[0], FLAP_CHORD, 1.0), (AILERON[1], WING_TIP, FLAP_CHORD, 1.0)]  # fmt: skip
    # Fixed edge pieces ride with the upper skin object so the wing has no open gaps.
    upper_obj_name = f"wing_upper_skin_{suffix}"
    import bpy

    for index, (lo, hi, c0, c1) in enumerate(fixed):
        bm = solid(wing_section, _span(lo, hi, kink), c0, c1, side)
        piece = common.object_from_bmesh(f"_fixed_edge_{suffix}_{index}", bm, mats)
        common.planar_uv(piece, _skin_uv)
        piece.select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects[upper_obj_name]
    bpy.data.objects[upper_obj_name].select_set(True)
    bpy.ops.object.join()
    bpy.ops.object.select_all(action="DESELECT")

    for number, (lo, hi) in enumerate(SLATS, start=1):
        _named(f"slat_{number}_{suffix}", solid(wing_section, _span(lo + GAP, hi - GAP, kink), 0.0, SLAT_CHORD - 0.004, side), mats)
    aft = FLAP_CHORD + 0.004
    _named(f"flap_inboard_{suffix}", solid(wing_section, _span(FLAP_INBOARD[0], FLAP_INBOARD[1] - GAP), aft, 1.0, side), mats)
    _named(f"flap_outboard_{suffix}", solid(wing_section, _span(FLAP_OUTBOARD[0] + GAP, FLAP_OUTBOARD[1] - GAP), aft, 1.0, side), mats)
    _named(f"aileron_{suffix}", solid(wing_section, _span(AILERON[0] + GAP, AILERON[1] - GAP), aft, 1.0, side), mats)

    for number, (lo, hi) in enumerate(SPOILERS, start=1):
        bm = bmesh.new()
        skin(bm, wing_section, _span(lo + 0.02, hi - 0.02, kink), SPOILER_CHORD, FLAP_CHORD - 0.005, side, True, lift=0.006, points=4)
        _named(f"spoiler_{number}_{suffix}", bm, mats, recalc=False)

    # Flap track fairings: slender bodies under the trailing edge.
    for number, eta in FLAP_TRACK_FAIRINGS.items():
        le, chord, z, thickness, _ = wing_section(eta)
        centre_x, centre_z = le + chord * 0.80, z - thickness * chord * 0.5 - 0.12
        length, radius = 2.3, 0.25
        profile = [(-length / 2, 0.0)] + [
            (length * (t - 0.5), radius * math.sin(math.pi * t) ** 0.7) for t in (i / 12 for i in range(1, 12))
        ] + [(length / 2, 0.0)]
        bm = bmesh.new()
        common.revolve(bm, profile, 16, place=lambda x, y, zz: (centre_x + x, side * eta + y * 0.7, centre_z + zz))
        _named(f"flap_track_fairing_{number}_{suffix}", bm, mats, uv=None)

    # Wing tip fence: a thin swept plate above and below the tip.
    le, chord, z, _, _ = wing_section(HALF_SPAN)
    y = side * WING_TIP
    plate = lambda dy: [  # noqa: E731
        (le + 0.10, y + dy, z + 0.02), (le + chord + 0.20, y + dy, z + 0.72),
        (le + chord + 0.28, y + dy, z + 0.02), (le + chord + 0.18, y + dy, z - 0.62),
    ]  # fmt: skip
    bm = bmesh.new()
    common.loft(bm, [plate(-0.02), plate(0.02)])
    _named(f"wingtip_fence_{suffix}", bm, mats, uv=None)


def build_tailplane(side, suffix, paint):
    stations = [0.0, 1.0, 3.0, HALF_TAIL_SPAN]
    bm = solid(tail_section, stations, 0.0, ELEVATOR_CHORD, side)
    _named(f"horizontal_stabilizer_{suffix}", bm, [paint])
    bm = solid(tail_section, _span(ELEVATOR[0] + GAP, ELEVATOR[1], breaks=(3.0,)), ELEVATOR_CHORD + 0.006, 1.0, side)
    _named(f"elevator_{suffix}", bm, [paint])


def build_fin(top_z, livery):
    """Fin and rudder carry the tail livery; v runs from the fuselage crown (0) to the fin top (1)."""
    heights = [5.60, 6.30, 8.00, 10.00, top_z]
    base = 5.87
    mapping = lambda x, y, z: (0.5, min(max((z - base) / (top_z - base), 0.0), 1.0))  # noqa: E731
    fin = _named("vertical_stabilizer", solid(fin_section, heights, 0.0, RUDDER_CHORD, vertical=True), [livery], uv=None)
    rudder = _named(
        "rudder", solid(fin_section, [6.05, 8.0, 10.0, top_z - 0.03], RUDDER_CHORD + 0.006, 1.0, vertical=True), [livery], uv=None
    )
    common.planar_uv(fin, mapping)
    common.planar_uv(rudder, mapping)
