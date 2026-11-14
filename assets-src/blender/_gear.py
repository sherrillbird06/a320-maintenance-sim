"""Nose and main landing gear of the A320-214, their doors and bays, and the hydraulic service panels.

Sourced (airbus_ac_a320): gear stations, wheelbase, track, wheel spacing, tire
sizes, hydraulic service panel stations. The Airbus document also states the
layout used here: twin-wheel nose gear retracting forward; each main gear a
twin-wheel leg with an integral shock absorber, braced laterally by a folding
side stay, retracting sideways toward the centreline.
PROVISIONAL: every shape and size of strut, link, stay, actuator, brake, door
and bay, and the tire and wheel cross-sections.
"""

import math

import bmesh
import common

INCH = 0.0254


def tube(bm, p0, p1, r0, r1=None, sides=14, material_index=0):
    """A capped cylinder or cone between two points."""
    r1 = r0 if r1 is None else r1
    ax = [b - a for a, b in zip(p0, p1)]
    length = math.sqrt(sum(c * c for c in ax)) or 1.0
    ax = [c / length for c in ax]
    ref = (0.0, 0.0, 1.0) if abs(ax[2]) < 0.9 else (1.0, 0.0, 0.0)
    u = [ax[1] * ref[2] - ax[2] * ref[1], ax[2] * ref[0] - ax[0] * ref[2], ax[0] * ref[1] - ax[1] * ref[0]]
    ul = math.sqrt(sum(c * c for c in u))
    u = [c / ul for c in u]
    v = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]]
    ring = lambda p, r: [  # noqa: E731
        tuple(p[k] + r * (math.cos(a) * u[k] + math.sin(a) * v[k]) for k in range(3))
        for a in (2 * math.pi * i / sides for i in range(sides))
    ]
    common.loft(bm, [ring(p0, r0), ring(p1, r1)], material_index=material_index)


def box(bm, lo, hi, material_index=0):
    (x0, y0, z0), (x1, y1, z1) = lo, hi
    rect = lambda z: [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]  # noqa: E731
    common.loft(bm, [rect(z0), rect(z1)], material_index=material_index)


def _named(name, bm, materials):
    obj = common.object_from_bmesh(name, bm, materials)
    common.mark_inspectable(obj)
    return obj


def tire_profile(diameter, width, rim_diameter):
    """Cross-section of a ribbed aircraft tire: (axial, radius) from one bead to the other."""
    radius, half, rim = diameter / 2, width / 2, rim_diameter / 2
    tread_half = 0.72 * half
    drop = 0.024 * diameter
    crown = lambda a: radius - drop * (a / tread_half) ** 2  # noqa: E731
    groove_w, groove_d = 0.028 * width, 0.016 * diameter
    points = [(0.0, crown(0.0))]
    a, step = 0.0, tread_half / 16
    for centre in (0.26 * tread_half, 0.70 * tread_half):
        lo, hi = centre - groove_w / 2, centre + groove_w / 2
        while a + step < lo:
            a += step
            points.append((a, crown(a)))
        points += [(lo, crown(lo)), (lo + groove_w * 0.12, crown(lo) - groove_d),
                   (hi - groove_w * 0.12, crown(hi) - groove_d), (hi, crown(hi))]  # fmt: skip
        a = hi
    while a + step < tread_half:
        a += step
        points.append((a, crown(a)))
    shoulder = crown(tread_half)
    points.append((tread_half, shoulder))
    widest = rim + 0.55 * (radius - rim)
    bead_a, bead_r = 0.76 * half, rim + 0.08 * (radius - rim)
    for i in range(1, 11):
        t = (math.pi / 2) * i / 10
        points.append((tread_half + (half - tread_half) * math.sin(t), widest + (shoulder - widest) * math.cos(t)))
    for i in range(1, 11):
        t = (math.pi / 2) * i / 10
        points.append((bead_a + (half - bead_a) * math.cos(t), widest - (widest - bead_r) * math.sin(t)))
    points.append((bead_a - 0.03 * width, rim + 0.01))
    return [(-x, r) for x, r in reversed(points[1:])] + points


def wheel_profile(width, rim_diameter, outboard):
    """Rim and outer face of a wheel; `outboard` is +1 or -1 for which way the face points."""
    half, rim = width / 2, rim_diameter / 2
    s = outboard
    return [
        (-s * 0.70 * half, rim - 0.035), (-s * 0.80 * half, rim + 0.02), (-s * 0.74 * half, rim + 0.005),
        (s * 0.74 * half, rim + 0.005), (s * 0.80 * half, rim + 0.02), (s * 0.70 * half, rim - 0.04),
        (s * 0.55 * half, rim * 0.62), (s * 0.52 * half, rim * 0.40), (s * 0.66 * half, rim * 0.32),
        (s * 0.74 * half, rim * 0.22), (s * 0.76 * half, 0.0),
    ]  # fmt: skip


def wheel_set(prefix, suffix, x, y, tire, toward_strut, mats, brake=False):
    """Tire, wheel and (for main wheels) brake for one wheel position. Axle runs along Y."""
    diameter, width, rim_diameter = tire
    radius = diameter / 2
    place = lambda lx, ly, lz: (x - ly, y + lx, radius + lz)  # noqa: E731 - local X becomes world Y
    rubber, wheel_paint, bolt_steel, brake_dark = mats

    bm = bmesh.new()
    common.revolve(bm, tire_profile(diameter, width, rim_diameter), 96, place=place, u_repeat=8.0)
    _named(f"{prefix}_tire_{suffix}", bm, [rubber])

    outboard = -toward_strut
    bm = bmesh.new()
    common.revolve(bm, wheel_profile(width, rim_diameter, outboard), 56, place=place)
    bolts, ring_r = 10, rim_diameter / 2 * 0.80
    for i in range(bolts):
        a = 2 * math.pi * i / bolts
        centre = (outboard * 0.60 * width / 2, ring_r * math.cos(a), ring_r * math.sin(a))
        p0 = place(centre[0] - 0.008, centre[1], centre[2])
        p1 = place(centre[0] + 0.008, centre[1], centre[2])
        tube(bm, p0, p1, 0.010, sides=6, material_index=1)
    _named(f"{prefix}_wheel_{suffix}", bm, [wheel_paint, bolt_steel])

    if brake:
        # Brake pack on the axle, between the wheel and the leg.
        bm = bmesh.new()
        r = rim_diameter / 2 * 0.86
        a0, a1 = toward_strut * 0.10 * width, toward_strut * 0.62 * width
        common.revolve(bm, [(a0, 0.07), (a0, r), (a1, r), (a1, r * 0.78), (a1 + toward_strut * 0.03, r * 0.5), (a1 + toward_strut * 0.03, 0.07)], 40, place=place)
        _named(f"mlg_brake_{suffix}", bm, [brake_dark])


def build_main_gear(side, suffix, numbers, x, track_half, spacing, top_z, mats, structure):
    paint, chrome, dark, line = structure
    y0 = side * track_half
    tire = (46 * INCH, 17 * INCH, 20 * INCH)
    axle_z = tire[0] / 2
    in_ = -side  # direction toward the fuselage

    for number, offset in zip(numbers, (-spacing / 2, spacing / 2)):
        wheel_set("mlg", str(number), x, y0 + offset, tire, toward_strut=-1 if offset > 0 else 1, mats=mats, brake=True)

    bm = bmesh.new()
    tube(bm, (x, y0 - spacing / 2 - 0.05, axle_z), (x, y0 + spacing / 2 + 0.05, axle_z), 0.075, material_index=0)
    tube(bm, (x, y0, axle_z - 0.02), (x, y0, 1.50), 0.072, material_index=1)  # sliding tube
    tube(bm, (x, y0, 1.38), (x, y0, 1.46), 0.135, material_index=0)  # gland
    tube(bm, (x, y0, 1.42), (x, y0 + in_ * 0.10, top_z), 0.125, 0.14, material_index=0)  # main fitting
    tube(bm, (x - 0.45, y0 + in_ * 0.10, top_z - 0.05), (x + 0.45, y0 + in_ * 0.10, top_z - 0.05), 0.09, material_index=0)  # pintle
    _named(f"mlg_shock_strut_{suffix}", bm, [paint, chrome])

    bm = bmesh.new()
    apex = (x + 0.42, y0, 1.02)
    for dy in (-0.07, 0.07):
        tube(bm, (x + 0.10, y0 + dy, 1.40), (apex[0], apex[1] + dy * 0.4, apex[2]), 0.032, 0.026)
        tube(bm, (apex[0], apex[1] + dy * 0.4, apex[2]), (x + 0.07, y0 + dy, axle_z + 0.08), 0.026, 0.032)
    tube(bm, (apex[0], y0 - 0.06, apex[2]), (apex[0], y0 + 0.06, apex[2]), 0.03)
    _named(f"mlg_torque_links_{suffix}", bm, [paint])

    bm = bmesh.new()
    knee = (x, y0 + in_ * 0.85, 2.10)
    tube(bm, (x, y0 + in_ * 0.10, 1.85), knee, 0.05)
    tube(bm, knee, (x, y0 + in_ * 1.55, top_z - 0.05), 0.055)
    tube(bm, (x - 0.07, knee[1], knee[2]), (x + 0.07, knee[1], knee[2]), 0.06)
    _named(f"mlg_side_stay_{suffix}", bm, [paint])

    bm = bmesh.new()
    a, b = (x - 0.22, y0 + in_ * 0.12, 2.45), (x - 0.22, y0 + in_ * 1.15, top_z - 0.02)
    mid = tuple((p + q) / 2 for p, q in zip(a, b))
    tube(bm, a, mid, 0.032, material_index=1)
    tube(bm, mid, b, 0.062, material_index=0)
    _named(f"mlg_retraction_actuator_{suffix}", bm, [paint, chrome])

    bm = bmesh.new()
    for dx in (0.11, 0.14):
        tube(bm, (x + dx, y0 + in_ * 0.08, top_z - 0.25), (x + dx, y0, 1.50), 0.011, sides=8)
        tube(bm, (x + dx, y0, 1.50), (x + dx + 0.06, y0, axle_z + 0.12), 0.011, sides=8)
        for offset in (-spacing / 2 + 0.16, spacing / 2 - 0.16):
            tube(bm, (x + dx + 0.06, y0, axle_z + 0.12), (x + dx + 0.04, y0 + offset, axle_z + 0.16), 0.011, sides=8)
    _named(f"mlg_brake_lines_{suffix}", bm, [line])

    # Leg fairing door fixed to the outside of the leg.
    bm = bmesh.new()
    box(bm, (x - 0.30, y0 - in_ * 0.19, 1.62), (x + 0.30, y0 - in_ * 0.17, top_z - 0.06))
    _named(f"mlg_door_hinged_{suffix}", bm, [paint])
    # Main door under the belly, closed with the gear down.
    bm = bmesh.new()
    box(bm, (16.45, min(side * 0.22, side * 1.85), 1.352), (18.95, max(side * 0.22, side * 1.85), 1.364))
    _named(f"mlg_door_main_{suffix}", bm, [paint])
    # Bay in the wing root that the leg folds into.
    bm = bmesh.new()
    box(bm, (x - 0.62, min(y0 + in_ * 0.25, y0 + in_ * 1.70), top_z - 0.03), (x + 0.62, max(y0 + in_ * 0.25, y0 + in_ * 1.70), top_z + 0.01))
    _named(f"mlg_bay_{suffix}", bm, [dark])


def build_nose_gear(x, spacing, keel_z, mats, structure):
    paint, chrome, dark, _ = structure
    tire = (30 * INCH, 8.8 * INCH, 15 * INCH)
    axle_z = tire[0] / 2
    for suffix, y in (("lh", -spacing / 2), ("rh", spacing / 2)):
        wheel_set("nlg", suffix, x, y, tire, toward_strut=1 if y < 0 else -1, mats=mats)

    bm = bmesh.new()
    tube(bm, (x, -spacing / 2 - 0.03, axle_z), (x, spacing / 2 + 0.03, axle_z), 0.045)
    tube(bm, (x, 0, axle_z - 0.02), (x, 0, 1.05), 0.048, material_index=1)
    tube(bm, (x, 0, 0.98), (x, 0, 1.04), 0.095)
    tube(bm, (x, 0, 1.02), (x - 0.12, 0, keel_z + 0.10), 0.085, 0.095)
    _named("nlg_shock_strut", bm, [paint, chrome])

    bm = bmesh.new()
    apex = (x - 0.30, 0.0, 0.74)
    for dy in (-0.05, 0.05):
        tube(bm, (x - 0.07, dy, 1.00), (apex[0], dy * 0.4, apex[2]), 0.022)
        tube(bm, (apex[0], dy * 0.4, apex[2]), (x - 0.05, dy, axle_z + 0.07), 0.022)
    _named("nlg_torque_links", bm, [paint])

    bm = bmesh.new()
    tube(bm, (x - 0.06, 0, 1.45), (x - 1.05, 0, keel_z + 0.08), 0.04)
    _named("nlg_drag_strut", bm, [paint])

    bm = bmesh.new()
    tube(bm, (x - 0.03, 0, 1.22), (x - 0.05, 0, 1.36), 0.125)
    tube(bm, (x - 0.04, -0.20, 1.29), (x - 0.04, 0.20, 1.29), 0.045)
    _named("nlg_steering_actuator", bm, [paint])

    bm = bmesh.new()
    box(bm, (x - 0.22, -0.09, 1.50), (x - 0.16, 0.09, 1.66))
    _named("apu_external_panel", bm, [dark])

    for suffix, side in (("lh", -1), ("rh", 1)):
        # Forward doors close again once the gear is down; aft doors stay open beside the leg.
        bm = bmesh.new()
        box(bm, (3.35, min(0.0, side * 0.30), keel_z - 0.012), (4.72, max(0.0, side * 0.30), keel_z - 0.002))
        _named(f"nlg_door_fwd_{suffix}", bm, [paint])
        bm = bmesh.new()
        box(bm, (4.80, side * 0.31 - 0.008, keel_z - 0.52), (5.72, side * 0.31 + 0.008, keel_z + 0.02))
        _named(f"nlg_door_aft_{suffix}", bm, [paint])

    bm = bmesh.new()
    box(bm, (4.80, -0.30, keel_z - 0.004), (5.72, 0.30, keel_z + 0.004))
    _named("nlg_bay", bm, [dark])


def build_hydraulic_panels(panels, surface_z, paint_dark):
    """Service panels on the belly fairing. panels maps a name to (x, y)."""
    for name, (x, y) in panels.items():
        z = surface_z(x, y) - 0.012
        bm = bmesh.new()
        box(bm, (x - 0.22, y - 0.16, z), (x + 0.22, y + 0.16, z + 0.008))
        _named(f"hyd_service_panel_{name}", bm, [paint_dark])
