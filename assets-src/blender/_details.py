"""Probes, antennas, lights, service panels, drains and static dischargers.

Sourced (airbus_ac_a320, ground service connection sections): stations of the
external power door, HP air connector, potable and waste water panels, refuel
panel, refuel coupling and overwing gravity refuel caps.
PROVISIONAL: everything else here. Probe, antenna and light positions were read
by eye from the small Airbus location figures (2-10-0 and 2-11-0), which carry no
dimensions; they are in the right area of the aircraft but not surveyed. Shapes
are simple stand-ins.
"""

import math

import bmesh
import _fuselage as fus
import _gear
import _surfaces as srf
import common

RIGHT, LEFT, CROWN, KEEL = 0.0, 180.0, 90.0, 270.0


def _named(name, bm, materials, recalc=True):
    obj = common.object_from_bmesh(name, bm, materials, recalc_normals=recalc)
    common.mark_inspectable(obj)
    return obj


def _mirror(a, left):
    return 180.0 - a if left else a


def panel(name, x, a, length, arc, material, offset=0.004, outline=None):
    """A flush panel on the fuselage: `length` along the aircraft, `arc` metres around it.

    With `outline`, a slightly larger patch in that material sits just under it, so the
    panel shows a dark edge like a door.
    """
    _, half_height, half_width = fus.section(x)
    per_metre = math.degrees(1.0 / ((half_height + half_width) / 2))
    half_angle = arc / 2 * per_metre
    bm = bmesh.new()
    stations = lambda half: [x - half + 2 * half * i / 6 for i in range(7)]  # noqa: E731
    if outline is not None:
        edge = 0.012
        grow = edge * per_metre
        fus.patch(bm, stations(length / 2 + edge), lambda _: a - half_angle - grow, lambda _: a + half_angle + grow, offset - 0.002, 1, a_step=3)
    fus.patch(bm, stations(length / 2), lambda _: a - half_angle, lambda _: a + half_angle, offset, 0, a_step=3)
    return _named(name, bm, [material] if outline is None else [material, outline], recalc=False)


def _normal(x, a):
    p, q = fus.surf(x, a), fus.surf(x, a, 1.0)
    return tuple(b - c for b, c in zip(q, p))


def probe(name, x, a, length, radius, material):
    """A small tube standing off the fuselage skin, raked forward like a pitot probe."""
    base, n = fus.surf(x, a), _normal(x, a)
    elbow = tuple(base[k] + n[k] * length * 0.6 for k in range(3))
    tip = (elbow[0] - length, elbow[1], elbow[2])
    bm = bmesh.new()
    _gear.tube(bm, base, elbow, radius * 1.4, radius, sides=8)
    _gear.tube(bm, elbow, tip, radius, radius * 0.7, sides=8)
    return _named(name, bm, [material])


def vane(name, x, a, material):
    """Angle-of-attack sensor: a round base plate with a small vane."""
    base, n = fus.surf(x, a), _normal(x, a)
    out = tuple(base[k] + n[k] * 0.012 for k in range(3))
    tip = tuple(base[k] + n[k] * 0.09 for k in range(3))
    bm = bmesh.new()
    _gear.tube(bm, base, out, 0.05, sides=16)
    _gear.tube(bm, out, tip, 0.012, 0.006, sides=6)
    return _named(name, bm, [material])


def blade(name, x, a, height, chord, material):
    """A blade antenna or drain mast: a thin swept fin standing off the skin."""
    n = _normal(x, a)
    side = (0.0, -n[2], n[1])  # across the fin, tangent to the section
    def ring(station, lift, half):
        p = fus.surf(station, a)
        c = tuple(p[k] + n[k] * lift for k in range(3))
        return [tuple(c[k] + side[k] * s * half for k in range(3)) for s in (-1, 1)]
    rings = []
    for lift, x0, x1, half in ((-0.01, x, x + chord, 0.012), (height, x + chord * 0.45, x + chord * 0.95, 0.004)):
        a0, a1 = ring(x0, lift, half), ring(x1, lift, half)
        rings.append([a0[0], a1[0], a1[1], a0[1]])
    bm = bmesh.new()
    common.loft(bm, rings)
    return _named(name, bm, [material])


def dome(name, centre, direction, radius, material):
    """A light lens: a shallow dome facing `direction`."""
    length = math.sqrt(sum(c * c for c in direction)) or 1.0
    d = tuple(c / length for c in direction)
    bm = bmesh.new()
    _gear.tube(bm, tuple(centre[k] - d[k] * 0.01 for k in range(3)), tuple(centre[k] + d[k] * radius * 0.5 for k in range(3)), radius, radius * 0.55, sides=14)
    return _named(name, bm, [material])


def wing_point(eta, chord_fraction, upper, side, section=srf.wing_section):
    le, chord, z, thickness, camber = section(eta)
    yt, yc = srf._profile(chord_fraction, thickness, camber)
    return (le + chord_fraction * chord, side * eta, z + (yc + (yt if upper else -yt)) * chord)


def wing_plates(name, spots, size, upper, side, material, section=srf.wing_section):
    """Small flush plates on a wing surface. spots is a list of (eta, chord fraction)."""
    bm = bmesh.new()
    lift = 0.004 if upper else -0.012
    for eta, chord_fraction in spots:
        x, y, z = wing_point(eta, chord_fraction, upper, side, section)
        _gear.box(bm, (x - size[0] / 2, y - size[1] / 2, z + lift), (x + size[0] / 2, y + size[1] / 2, z + lift + 0.008))
    return _named(name, bm, [material])


def wicks(name, points, material):
    """Static dischargers: thin rods trailing aft from a trailing edge."""
    bm = bmesh.new()
    for x, y, z in points:
        _gear.tube(bm, (x - 0.02, y, z), (x + 0.16, y, z), 0.005, 0.003, sides=6)
    return _named(name, bm, [material])


def fairing_plate(name, x, y, size, material):
    z = fus.fairing_bottom_z(x, y) - 0.012
    bm = bmesh.new()
    _gear.box(bm, (x - size[0] / 2, y - size[1] / 2, z), (x + size[0] / 2, y + size[1] / 2, z + 0.008))
    return _named(name, bm, [material])


def build(paint, dark, metal, glass, red, green, white, fin_top_z, nose_gear_x):
    # Nose gear forward doors: closed with the gear down, flush in the lower nose skin.
    panel("nlg_door_fwd_lh", 4.13, 265.2, 1.46, 0.30, paint, outline=dark)
    panel("nlg_door_fwd_rh", 4.13, 274.8, 1.46, 0.30, paint, outline=dark)

    # --- Air data probes and sensors (positions PROVISIONAL) -----------------
    probe("pitot_probe_1", 2.10, _mirror(-28, True), 0.14, 0.011, metal)
    probe("pitot_probe_3", 2.45, _mirror(-32, True), 0.14, 0.011, metal)
    probe("pitot_probe_2", 2.10, -28, 0.14, 0.011, metal)
    probe("tat_probe_1", 1.85, _mirror(-48, True), 0.07, 0.012, metal)
    probe("tat_probe_2", 1.85, -48, 0.07, 0.012, metal)
    vane("aoa_sensor_1", 7.20, _mirror(-4, True), metal)
    vane("aoa_sensor_3", 5.75, _mirror(-14, True), metal)
    vane("aoa_sensor_2", 7.20, -4, metal)
    for left, suffix in ((True, "lh"), (False, "rh")):
        panel(f"static_probe_1_{suffix}", 6.05, _mirror(-34, left), 0.16, 0.16, metal)
        panel(f"static_probe_2_{suffix}", 6.35, _mirror(-38, left), 0.16, 0.16, metal)
        panel(f"static_probe_stby_{suffix}", 1.60, _mirror(-8, left), 0.12, 0.12, metal)

    # --- Antennas (positions PROVISIONAL) ------------------------------------
    blade("vhf_antenna_1", 5.0, CROWN, 0.32, 0.36, paint)
    blade("vhf_antenna_3", 21.8, CROWN, 0.32, 0.36, paint)
    blade("vhf_antenna_2", 21.5, KEEL, 0.32, 0.36, paint)
    panel("tcas_antenna_top", 8.3, CROWN, 0.34, 0.26, dark, offset=0.02)
    panel("tcas_antenna_bottom", 8.3, KEEL, 0.34, 0.26, dark, offset=0.02)

    # --- Fuselage lights (positions PROVISIONAL) -----------------------------
    dome("upper_beacon", fus.surf(16.0, CROWN), (0, 0, 1), 0.07, red)
    dome("lower_beacon", (14.0, 0.0, fus.fairing_bottom_z(14.0, 0.0)), (0, 0, -1), 0.07, red)
    dome("taxi_light", (nose_gear_x + 0.02, 0.0, 1.22), (-1, 0, 0), 0.06, white)
    dome("takeoff_light", (nose_gear_x - 0.01, 0.0, 1.06), (-1, 0, 0), 0.07, white)
    for suffix, side in (("lh", -1), ("rh", 1)):
        dome(f"runway_turnoff_light_{suffix}", (nose_gear_x + 0.04, side * 0.14, 1.38), (-1, side * 0.5, 0), 0.05, white)
        dome(f"wing_scan_light_{suffix}", fus.surf(10.6, _mirror(-2, side < 0)), (0, side, 0), 0.05, white)
        dome(f"logo_light_{suffix}", wing_point(2.6, 0.35, True, side, srf.tail_section), (0, 0, 1), 0.06, white)
        dome(f"landing_light_{suffix}", wing_point(2.75, 0.30, False, side), (0, 0, -1), 0.10, white)
        tip = wing_point(srf.WING_TIP - 0.05, 0.25, True, side)
        dome(f"nav_light_{suffix}", tip, (-1, side, 0), 0.05, red if side < 0 else green)
        dome(f"wing_strobe_light_{suffix}", wing_point(srf.WING_TIP - 0.05, 0.45, True, side), (0, side, 0.3), 0.04, white)
    dome("tail_nav_light", fus.surf(fus.LENGTH - 0.25, CROWN), (0.4, 0, 1), 0.04, white)
    dome("tail_strobe_light", fus.surf(fus.LENGTH - 0.55, CROWN), (0.4, 0, 1), 0.04, white)

    # --- Service points and access (stations sourced where noted in the module docstring) ---
    panel("external_power_door", 2.55, KEEL, 0.42, 0.34, dark)
    panel("avionics_bay_access_door", 6.60, KEEL, 0.62, 0.55, dark)
    panel("potable_water_service_panel", 31.3, _mirror(-82, True), 0.42, 0.34, dark)
    panel("waste_service_panel", 31.3, -68, 0.48, 0.40, dark)
    panel("outflow_valve", 28.6, -62, 0.40, 0.36, dark)
    panel("apu_air_inlet", 34.25, KEEL, 0.55, 0.38, dark)
    for suffix, a in (("lh", 250.0), ("rh", 290.0)):
        panel(f"apu_access_door_{suffix}", 35.6, a, 1.5, 0.42, dark, offset=0.003)
    blade("drain_mast_fwd", 9.5, KEEL, 0.22, 0.26, metal)
    blade("drain_mast_aft", 25.2, KEEL, 0.22, 0.26, metal)
    fairing_plate("hp_ground_air_connection", 12.98, -0.84, (0.34, 0.30), dark)
    fairing_plate("lp_ground_air_connection", 12.45, -0.84, (0.34, 0.30), dark)
    fairing_plate("refuel_panel", 16.4, 1.8, (0.50, 0.34), dark)
    fairing_plate("rat_door", 20.2, -1.05, (1.00, 0.55), dark)
    for suffix, side in (("lh", -1), ("rh", 1)):
        fairing_plate(f"pack_ram_air_inlet_{suffix}", 12.25, side * 0.55, (0.55, 0.36), dark)

    # Cargo compartments: the lined volume behind each cargo door.
    for name, x in (("fwd_cargo_compartment", 8.16), ("aft_cargo_compartment", 22.69)):
        bm = bmesh.new()
        _gear.box(bm, (x - 1.4, -0.90, fus.KEEL_Z + 0.45), (x + 1.4, 0.95, fus.KEEL_Z + 1.46))
        _named(name, bm, [dark])

    # --- Wing: fuel and access ------------------------------------------------
    bm = bmesh.new()
    cx, cy, cz = wing_point(9.83, 0.10, False, 1)
    _gear.box(bm, (17.59 - 0.11, cy - 0.11, cz - 0.014), (17.59 + 0.11, cy + 0.11, cz - 0.006))
    _named("refuel_coupling", bm, [dark])
    for suffix, side in (("lh", -1), ("rh", 1)):
        bm = bmesh.new()
        gx, gy, gz = wing_point(12.4, 0.5, True, side)
        _gear.tube(bm, (19.1, gy, gz - 0.005), (19.1, gy, gz + 0.008), 0.07, sides=16)
        _named(f"gravity_refuel_cap_{suffix}", bm, [dark])
        wing_plates(f"fuel_vent_inlet_{suffix}", [(14.6, 0.45)], (0.34, 0.16), False, side, dark)
        wing_plates(f"fuel_level_indicators_{suffix}", [(e, 0.5) for e in (3.6, 5.4, 8.2, 10.6, 12.8)], (0.07, 0.07), False, side, metal)
        wing_plates(f"wing_access_panels_{suffix}", [(e, 0.36) for e in (3.2, 4.4, 7.2, 8.6, 10.0, 11.4, 12.8, 14.0)], (0.42, 0.26), False, side, paint)
        te = [wing_point(e, 1.0, True, side) for e in (9.5, 11.5, 13.5, 15.2, 16.4)]
        wicks(f"static_dischargers_wing_{suffix}", te, dark)

    tail = [wing_point(e, 1.0, True, s, srf.tail_section) for s in (-1, 1) for e in (4.2, 5.2, 6.0)]
    le, chord, _, _, _ = srf.fin_section(fin_top_z - 0.5)
    tail += [(le + chord, 0.0, fin_top_z - 0.5), (srf.fin_section(fin_top_z - 1.8)[0] + srf.fin_section(fin_top_z - 1.8)[1], 0.0, fin_top_z - 1.8)]
    wicks("static_dischargers_tail", tail, dark)
