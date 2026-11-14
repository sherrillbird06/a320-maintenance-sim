"""CFM56-5B power plant as fitted to the A320-214: nacelle cowls, fan, spinner, nozzle, plug.

Sourced (airbus_ac_a320): inlet station, distance from the centreline, nacelle
ground clearance. The 36-blade fan count is the CFM56-5B's published figure.
PROVISIONAL: every cross-section and split line here. The nacelle outline is a
plausible CFM56-5B shape, not manufacturer data, and will be checked against
reference photographs in the materials slice.

The fan object's origin is on the engine axis so it can be turned by hand in the
simulator; each blade is a child of the fan.
"""

import math

import bmesh
import bpy
import common

FAN_BLADES = 36
RADIUS = 1.16
FAN_STATION = 0.92  # metres aft of the inlet lip
HUB_RADIUS = 0.30
TIP_RADIUS = 0.875


def _shell(bm, profile, a0, a1, segments, place, material_index=0):
    """Sweep a closed (x, r) section through angles a0..a1 (degrees) and cap both ends."""
    rings = []
    for s in range(segments + 1):
        a = math.radians(a0 + (a1 - a0) * s / segments)
        rings.append([bm.verts.new(place(x, r * math.cos(a), r * math.sin(a))) for x, r in profile])
    n = len(profile)
    for ring_a, ring_b in zip(rings, rings[1:]):
        for j in range(n):
            k = (j + 1) % n
            bm.faces.new((ring_a[j], ring_b[j], ring_b[k], ring_a[k])).material_index = material_index
    bm.faces.new(rings[0]).material_index = material_index
    bm.faces.new(list(reversed(rings[-1]))).material_index = material_index


def _named(name, bm, materials):
    obj = common.object_from_bmesh(name, bm, materials)
    common.mark_inspectable(obj)
    return obj


def _blade_mesh(materials):
    """One fan blade in the fan's own frame, standing along +Z from hub to tip."""
    rings = []
    centre_x = 0.07
    for i in range(6):
        t = i / 5
        r = HUB_RADIUS - 0.01 + (TIP_RADIUS - HUB_RADIUS + 0.01) * t
        chord = 0.20 + 0.12 * t
        stagger = math.radians(26 + 36 * t)
        thickness = 0.010 - 0.006 * t
        dx, dy = math.cos(stagger) * chord / 2, math.sin(stagger) * chord / 2
        nx, ny = -math.sin(stagger) * thickness, math.cos(stagger) * thickness
        rings.append([
            (centre_x - dx, -dy, r), (centre_x + nx, ny, r), (centre_x + dx, dy, r), (centre_x - nx, -ny, r),
        ])  # fmt: skip
    bm = bmesh.new()
    common.loft(bm, rings)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("fan_blade")
    bm.to_mesh(mesh)
    bm.free()
    for mat in materials:
        mesh.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    mesh.set_sharp_from_angle(angle=math.radians(40))
    return mesh


def build(number, y, inlet_x, clearance, paint, hot_metal, dark, blade_metal, lip_metal):
    prefix = f"eng{number}"
    axis_z = clearance + RADIUS
    x0 = inlet_x
    place = lambda lx, ly, lz: (x0 + lx, y + ly, axis_z + lz)  # noqa: E731
    # Outboard is away from the fuselage: +Y on the right engine, -Y on the left.
    outboard, inboard = ((-90, 90), (90, 270)) if y > 0 else ((90, 270), (-90, 90))

    bm = bmesh.new()
    # Bare-metal lip ring at the front of the inlet, painted cowl behind it.
    lip = [(0.0, 0.98), (0.05, 1.035), (0.15, 1.078), (0.15, 0.892), (0.05, 0.915)]
    inlet = [(0.15, 1.078), (0.31, 1.11), (1.0, 1.155), (1.0, 0.89), (0.31, 0.88), (0.15, 0.892)]
    _shell(bm, lip, 0, 360, 72, place, material_index=2)
    _shell(bm, inlet, 0, 360, 72, place)
    # Dark backing behind the fan so the inlet does not show daylight through the engine.
    common.revolve(bm, [(1.14, 0.0), (1.14, 0.89)], 48, material_index=1, place=place)
    _named(f"{prefix}_inlet_cowl", bm, [paint, dark, lip_metal])

    fan_cowl = [(1.0, 1.155), (1.11, RADIUS), (2.2, 1.14), (2.2, 0.92), (1.0, 0.89)]
    reverser = [(2.2, 1.14), (3.11, 1.02), (3.56, 0.93), (3.56, 0.90), (2.81, 0.92), (2.2, 0.92)]
    for label, (a0, a1) in (("inboard", inboard), ("outboard", outboard)):
        bm = bmesh.new()
        _shell(bm, fan_cowl, a0 + 0.4, a1 - 0.4, 36, place)
        _named(f"{prefix}_fan_cowl_{label}", bm, [paint])
        bm = bmesh.new()
        _shell(bm, reverser, a0 + 0.4, a1 - 0.4, 36, place)
        _named(f"{prefix}_reverser_cowl_{label}", bm, [paint])

    bm = bmesh.new()
    common.revolve(bm, [(2.4, 0.0), (2.4, 0.70), (3.4, 0.66), (4.3, 0.42), (4.3, 0.30), (4.1, 0.30)], 48, place=place)
    _named(f"{prefix}_exhaust_nozzle", bm, [hot_metal])
    bm = bmesh.new()
    common.revolve(bm, [(4.0, 0.28), (4.4, 0.24), (4.8, 0.0)], 32, place=place)
    _named(f"{prefix}_exhaust_plug", bm, [hot_metal])

    bm = bmesh.new()
    common.revolve(bm, [(0.50, 0.0), (0.56, 0.08), (0.70, 0.20), (FAN_STATION, HUB_RADIUS)], 40, place=place)
    _named(f"{prefix}_spinner", bm, [dark])

    # Fan: hub in the fan's own frame, origin on the engine axis.
    bm = bmesh.new()
    common.revolve(bm, [(0.0, 0.0), (0.0, HUB_RADIUS), (0.2, HUB_RADIUS + 0.02), (0.2, 0.0)], 40)
    fan = _named(f"{prefix}_fan", bm, [blade_metal])
    fan.location = place(FAN_STATION, 0.0, 0.0)
    blade_mesh = _blade_mesh([blade_metal])
    for i in range(FAN_BLADES):
        blade = bpy.data.objects.new(f"{prefix}_fan_blade_{i + 1:02d}", blade_mesh)
        bpy.context.scene.collection.objects.link(blade)
        blade.parent = fan
        blade.rotation_euler = (2 * math.pi * i / FAN_BLADES, 0.0, 0.0)

    # Drain mast under the fan cowl.
    bm = bmesh.new()
    box = lambda z: [(x0 + 1.95, y - 0.015, z), (x0 + 2.12, y - 0.015, z), (x0 + 2.12, y + 0.015, z), (x0 + 1.95, y + 0.015, z)]  # noqa: E731
    common.loft(bm, [box(clearance + 0.03), box(clearance - 0.11)])
    _named(f"{prefix}_drain_mast", bm, [hot_metal])
