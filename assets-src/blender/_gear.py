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
    holes, hole_r = 8, rim_diameter / 2 * 0.50
    for i in range(holes):
        a = 2 * math.pi * (i + 0.5) / holes
        face = outboard * 0.535 * width / 2
        centre = (face, hole_r * math.cos(a), hole_r * math.sin(a))
        tube(bm, place(centre[0] - 0.004, centre[1], centre[2]), place(centre[0] + outboard * 0.012, centre[1], centre[2]),
             rim_diameter * 0.045, sides=10, material_index=2)  # fmt: skip
    cap = outboard * 0.76 * width / 2
    tube(bm, place(cap, 0, 0), place(cap + outboard * 0.05, 0, 0), rim_diameter * 0.085, rim_diameter * 0.06, sides=12, material_index=1)
    _named(f"{prefix}_wheel_{suffix}", bm, [wheel_paint, bolt_steel, brake_dark])

    if brake:
        # Brake pack on the axle, between the wheel and the leg.
        bm = bmesh.new()
        r = rim_diameter / 2 * 0.86
        a0, a1 = toward_strut * 0.10 * width, toward_strut * 0.62 * width
        common.revolve(bm, [(a0, 0.07), (a0, r), (a1, r), (a1, r * 0.78), (a1 + toward_strut * 0.03, r * 0.5), (a1 + toward_strut * 0.03, 0.07)], 40, place=place)
        _named(f"mlg_brake_{suffix}", bm, [brake_dark])


def _along(p0, p1, t):
    return tuple(p0[k] + (p1[k] - p0[k]) * t for k in range(3))


def build_main_gear(side, suffix, numbers, x, track_half, spacing, top_z, mats, structure):
    """One main gear, laid out as in Airbus figures 2-9-0-991-010 and -011.

    The leg is a main fitting with a forked top carrying fore and aft pintle
    pins, a shock absorber sliding out of its lower end to the axle, torque
    links ahead of the leg, a folding side stay and lock stay running inboard,
    and the retraction actuating cylinder at the top. The leg leans aft toward
    the top. Proportions are read from those figures; cross-sections are PROVISIONAL.
    """
    paint, chrome, dark, line = structure
    y0 = side * track_half
    tire = (46 * INCH, 17 * INCH, 20 * INCH)
    axle_z = tire[0] / 2
    in_ = -side  # direction toward the fuselage

    for number, offset in zip(numbers, (-spacing / 2, spacing / 2)):
        wheel_set("mlg", str(number), x, y0 + offset, tire, toward_strut=-1 if offset > 0 else 1, mats=mats, brake=True)

    axle = (x, y0, axle_z)
    pintle = (x + 0.28, y0, top_z)
    gland = _along(axle, pintle, 0.36)

    bm = bmesh.new()
    tube(bm, (x, y0 - spacing / 2 - 0.06, axle_z), (x, y0 + spacing / 2 + 0.06, axle_z), 0.078)
    tube(bm, (x, y0 - 0.16, axle_z), (x, y0 + 0.16, axle_z), 0.11)  # axle boss under the leg
    tube(bm, _along(axle, pintle, -0.02), _along(axle, pintle, 0.40), 0.072, material_index=1)  # sliding tube
    for t, r in ((0.34, 0.118), (0.37, 0.132), (0.40, 0.118)):
        tube(bm, _along(axle, pintle, t - 0.012), _along(axle, pintle, t + 0.012), r)  # gland rings
    tube(bm, gland, _along(axle, pintle, 0.80), 0.118, 0.105)  # main fitting barrel
    fork = _along(axle, pintle, 0.80)
    for dx in (-0.34, 0.34):
        lug = (pintle[0] + dx, y0, top_z)
        tube(bm, fork, lug, 0.085, 0.07)
        tube(bm, (lug[0], y0 - 0.09, top_z), (lug[0], y0 + 0.09, top_z), 0.075)  # pintle pin housing
    tube(bm, (pintle[0] - 0.34, y0, top_z), (pintle[0] + 0.34, y0, top_z), 0.045)
    _named(f"mlg_shock_strut_{suffix}", bm, [paint, chrome])

    bm = bmesh.new()
    upper = _along(axle, pintle, 0.33)
    apex = (x - 0.46, y0, axle_z + 0.50)
    for dy in (-0.075, 0.075):
        tube(bm, (upper[0] - 0.10, y0 + dy, upper[2]), (apex[0], y0 + dy * 0.5, apex[2]), 0.034, 0.028)
        tube(bm, (apex[0], y0 + dy * 0.5, apex[2]), (x - 0.09, y0 + dy, axle_z + 0.07), 0.028, 0.034)
    tube(bm, (apex[0], y0 - 0.07, apex[2]), (apex[0], y0 + 0.07, apex[2]), 0.034)
    _named(f"mlg_torque_links_{suffix}", bm, [paint])

    # Side stay: lower arm from the leg, upper arm to the wing, with the lock stay bracing the joint.
    bm = bmesh.new()
    foot = _along(axle, pintle, 0.47)
    foot = (foot[0], y0 + in_ * 0.10, foot[2])
    wing_end = (x + 0.10, y0 + in_ * 1.90, top_z - 0.02)
    knee = _along(foot, wing_end, 0.52)
    tube(bm, foot, knee, 0.052)
    tube(bm, knee, wing_end, 0.056, 0.05)
    tube(bm, (knee[0] - 0.08, knee[1], knee[2]), (knee[0] + 0.08, knee[1], knee[2]), 0.06)
    lock_top = _along(axle, pintle, 0.86)
    lock_top = (lock_top[0], y0 + in_ * 0.10, lock_top[2])
    lock_mid = _along(knee, lock_top, 0.5)
    tube(bm, knee, lock_mid, 0.03)
    tube(bm, lock_mid, lock_top, 0.03)
    tube(bm, lock_mid, (lock_mid[0], lock_mid[1] + in_ * 0.34, lock_mid[2] + 0.22), 0.028, material_index=1)  # downlock actuator
    _named(f"mlg_side_stay_{suffix}", bm, [paint, chrome])

    bm = bmesh.new()
    a, b = (pintle[0] - 0.10, y0 + in_ * 0.16, top_z + 0.02), (pintle[0] - 0.10, y0 + in_ * 1.30, top_z + 0.06)
    tube(bm, a, _along(a, b, 0.42), 0.034, material_index=1)
    tube(bm, _along(a, b, 0.42), b, 0.072)
    tube(bm, (a[0] - 0.05, a[1], a[2]), (a[0] + 0.05, a[1], a[2]), 0.05)
    _named(f"mlg_retraction_actuator_{suffix}", bm, [paint, chrome])

    # Brake lines down the aft face of the leg, with a flexible run to each brake.
    bm = bmesh.new()
    for dy in (-0.035, 0.035):
        top = _along(axle, pintle, 0.78)
        mid = _along(axle, pintle, 0.40)
        low = _along(axle, pintle, 0.10)
        tube(bm, (top[0] + 0.125, y0 + dy, top[2]), (mid[0] + 0.135, y0 + dy, mid[2]), 0.010, sides=8)
        tube(bm, (mid[0] + 0.135, y0 + dy, mid[2]), (low[0] + 0.13, y0 + dy * 3, low[2] + 0.16), 0.012, sides=8, material_index=1)
        target = y0 + math.copysign(spacing / 2 - 0.20, dy)
        tube(bm, (low[0] + 0.13, y0 + dy * 3, low[2] + 0.16), (x + 0.10, target, axle_z + 0.17), 0.012, sides=8, material_index=1)
    _named(f"mlg_brake_lines_{suffix}", bm, [line, dark])

    # Leg fairing door on the outboard side of the leg.
    bm = bmesh.new()
    lo, hi = _along(axle, pintle, 0.46), _along(axle, pintle, 0.98)
    y_face = y0 - in_ * 0.17
    plate = lambda dy: [  # noqa: E731
        (lo[0] - 0.22, y_face + dy, lo[2]), (lo[0] + 0.22, y_face + dy, lo[2]),
        (hi[0] + 0.34, y_face + dy, hi[2]), (hi[0] - 0.34, y_face + dy, hi[2]),
    ]  # fmt: skip
    common.loft(bm, [plate(-0.008), plate(0.008)])
    _named(f"mlg_door_hinged_{suffix}", bm, [paint])
    # Main door under the belly, closed with the gear down.
    bm = bmesh.new()
    box(bm, (16.45, min(side * 0.22, side * 1.85), 1.352), (18.95, max(side * 0.22, side * 1.85), 1.364))
    _named(f"mlg_door_main_{suffix}", bm, [paint])
    # Bay in the wing root that the leg folds into.
    bm = bmesh.new()
    box(bm, (x - 0.45, min(y0 + in_ * 0.25, y0 + in_ * 1.95), top_z + 0.09), (x + 0.75, max(y0 + in_ * 0.25, y0 + in_ * 1.95), top_z + 0.12))
    _named(f"mlg_bay_{suffix}", bm, [dark])


def build_nose_gear(x, spacing, keel_z, mats, structure):
    """Nose gear, laid out as in Airbus figures 2-9-0-991-014 and -015.

    The leg leans aft toward the top and pivots on a wide forked head inside the
    bay. It carries the steering actuating cylinder across it, torque links
    behind, a drag strut running forward into the bay, and a towing fitting at
    the axle. Forward doors close once the gear is down; aft doors stay open.
    Proportions are read from those figures; cross-sections are PROVISIONAL.
    """
    paint, chrome, dark, _ = structure
    tire = (30 * INCH, 8.8 * INCH, 15 * INCH)
    axle_z = tire[0] / 2
    for suffix, y in (("lh", -spacing / 2), ("rh", spacing / 2)):
        wheel_set("nlg", suffix, x, y, tire, toward_strut=1 if y < 0 else -1, mats=mats)

    axle = (x, 0.0, axle_z)
    pivot = (x + 0.31, 0.0, keel_z + 0.52)  # about 9 degrees of rake
    bm = bmesh.new()
    tube(bm, (x, -spacing / 2 - 0.04, axle_z), (x, spacing / 2 + 0.04, axle_z), 0.045)
    tube(bm, (x, -0.10, axle_z), (x, 0.10, axle_z), 0.075)
    tube(bm, _along(axle, pivot, -0.02), _along(axle, pivot, 0.36), 0.048, material_index=1)
    for t, r in ((0.31, 0.082), (0.34, 0.094)):
        tube(bm, _along(axle, pivot, t - 0.012), _along(axle, pivot, t + 0.012), r)
    tube(bm, _along(axle, pivot, 0.33), _along(axle, pivot, 0.80), 0.085, 0.08)
    head = _along(axle, pivot, 0.78)
    for dy in (-0.44, 0.44):
        tube(bm, head, (pivot[0], dy, pivot[2]), 0.07, 0.055)  # forked head
        tube(bm, (pivot[0], dy - math.copysign(0.07, dy), pivot[2]), (pivot[0], dy + math.copysign(0.07, dy), pivot[2]), 0.06)
    tube(bm, (pivot[0], -0.44, pivot[2]), (pivot[0], 0.44, pivot[2]), 0.035)
    # Towing fitting ahead of the axle, and the leg door on the front of the leg.
    tube(bm, (x - 0.07, 0, axle_z), (x - 0.17, 0, axle_z - 0.02), 0.03, 0.022)
    lo, hi = _along(axle, pivot, 0.42), _along(axle, pivot, 0.74)
    door = lambda dx: [(lo[0] - 0.10 + dx, -0.16, lo[2]), (lo[0] - 0.10 + dx, 0.16, lo[2]), (hi[0] - 0.10 + dx, 0.19, hi[2]), (hi[0] - 0.10 + dx, -0.19, hi[2])]  # noqa: E731
    common.loft(bm, [door(-0.006), door(0.006)])
    _named("nlg_shock_strut", bm, [paint, chrome])

    bm = bmesh.new()
    upper = _along(axle, pivot, 0.30)
    apex = (x + 0.36, 0.0, axle_z + 0.34)
    for dy in (-0.05, 0.05):
        tube(bm, (upper[0] + 0.07, dy, upper[2]), (apex[0], dy * 0.5, apex[2]), 0.022)
        tube(bm, (apex[0], dy * 0.5, apex[2]), (x + 0.06, dy, axle_z + 0.05), 0.022)
    tube(bm, (apex[0], -0.05, apex[2]), (apex[0], 0.05, apex[2]), 0.024)
    _named("nlg_torque_links", bm, [paint])

    bm = bmesh.new()
    start = _along(axle, pivot, 0.66)
    end = (x - 0.95, 0.0, keel_z + 0.42)
    for dy in (-0.06, 0.06):
        tube(bm, (start[0], dy, start[2]), (end[0], dy * 3.2, end[2]), 0.034)
    tube(bm, (end[0], -0.22, end[2]), (end[0], 0.22, end[2]), 0.04)
    _named("nlg_drag_strut", bm, [paint])

    bm = bmesh.new()
    collar = _along(axle, pivot, 0.47)
    tube(bm, _along(axle, pivot, 0.43), _along(axle, pivot, 0.51), 0.125)
    tube(bm, (collar[0], -0.30, collar[2]), (collar[0], 0.30, collar[2]), 0.05)
    for dy in (-0.33, 0.33):
        tube(bm, (collar[0], dy - 0.03, collar[2]), (collar[0], dy + 0.03, collar[2]), 0.062)
    _named("nlg_steering_actuator", bm, [paint])

    bm = bmesh.new()
    panel_at = _along(axle, pivot, 0.60)
    box(bm, (panel_at[0] - 0.19, -0.09, panel_at[2] - 0.08), (panel_at[0] - 0.12, 0.09, panel_at[2] + 0.08))
    _named("apu_external_panel", bm, [dark])

    for suffix, side in (("lh", -1), ("rh", 1)):
        # Aft door: hinged at the bay edge, hanging open and leaning slightly outward.
        bm = bmesh.new()
        plate = lambda dy: [  # noqa: E731
            (4.92, side * 0.31 + dy, keel_z + 0.02), (5.74, side * 0.31 + dy, keel_z + 0.04),
            (5.70, side * 0.40 + dy, keel_z - 0.46), (4.96, side * 0.40 + dy, keel_z - 0.46),
        ]  # fmt: skip
        common.loft(bm, [plate(-0.007), plate(0.007)])
        _named(f"nlg_door_aft_{suffix}", bm, [paint])

    bm = bmesh.new()
    box(bm, (4.90, -0.30, keel_z + 0.004), (5.76, 0.30, keel_z + 0.012))
    _named("nlg_bay", bm, [dark])


def build_hydraulic_panels(panels, surface_z, paint_dark):
    """Service panels on the belly fairing. panels maps a name to (x, y)."""
    for name, (x, y) in panels.items():
        z = surface_z(x, y) - 0.012
        bm = bmesh.new()
        box(bm, (x - 0.22, y - 0.16, z), (x + 0.22, y + 0.16, z + 0.008))
        _named(f"hyd_service_panel_{name}", bm, [paint_dark])
