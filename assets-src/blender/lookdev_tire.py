"""Look-test asset: one A320 main wheel and tire at real size.

Tire size 46x17R20 is the main gear tire listed in the Airbus Aircraft
Characteristics document (source id airbus_ac_a320): 46 in outside diameter,
17 in section width, 20 in rim. The cross-section shape itself is a visual
approximation of a ribbed aircraft tire, not manufacturer data.

The wheel axis is X. The aircraft's own wheels are built in Milestone 1; this
file exists to prove the Blender-to-browser pipeline and the rubber and painted
metal materials.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bmesh  # noqa: E402
import common  # noqa: E402

INCH = 0.0254
OUTER_RADIUS = 46 * INCH / 2
HALF_WIDTH = 17 * INCH / 2
RIM_RADIUS = 20 * INCH / 2

TREAD_HALF_WIDTH = 0.155
CROWN_DROP = 0.014
GROOVE_CENTRES = (0.040, 0.110)
GROOVE_HALF_WIDTH = 0.006
GROOVE_DEPTH = 0.009
MAX_WIDTH_RADIUS = 0.430
BEAD_X = 0.165
BEAD_RADIUS = RIM_RADIUS + 0.021


def tread_radius(x):
    return OUTER_RADIUS - CROWN_DROP * (x / TREAD_HALF_WIDTH) ** 2


def half_profile():
    """Tire cross-section from the centreline of the tread out and down to the bead."""
    points = [(0.0, tread_radius(0.0))]

    # Tread with circumferential grooves.
    cuts = []
    for centre in GROOVE_CENTRES:
        a, b = centre - GROOVE_HALF_WIDTH, centre + GROOVE_HALF_WIDTH
        cuts.append((a, b))
    x = 0.0
    step = 0.008
    for a, b in cuts:
        while x + step < a:
            x += step
            points.append((x, tread_radius(x)))
        points.append((a, tread_radius(a)))
        points.append((a + 0.0015, tread_radius(a) - GROOVE_DEPTH))
        points.append((b - 0.0015, tread_radius(b) - GROOVE_DEPTH))
        points.append((b, tread_radius(b)))
        x = b
    while x + step < TREAD_HALF_WIDTH:
        x += step
        points.append((x, tread_radius(x)))
    shoulder_radius = tread_radius(TREAD_HALF_WIDTH)
    points.append((TREAD_HALF_WIDTH, shoulder_radius))

    # Shoulder, rounding over to the widest point of the sidewall.
    steps = 10
    for i in range(1, steps + 1):
        t = (math.pi / 2) * i / steps
        points.append(
            (
                TREAD_HALF_WIDTH + (HALF_WIDTH - TREAD_HALF_WIDTH) * math.sin(t),
                MAX_WIDTH_RADIUS + (shoulder_radius - MAX_WIDTH_RADIUS) * math.cos(t),
            )
        )

    # Lower sidewall, curving back in to the bead.
    for i in range(1, steps + 1):
        t = (math.pi / 2) * i / steps
        points.append(
            (
                BEAD_X + (HALF_WIDTH - BEAD_X) * math.cos(t),
                MAX_WIDTH_RADIUS - (MAX_WIDTH_RADIUS - BEAD_RADIUS) * math.sin(t),
            )
        )

    # Bead, tucked under the rim flange.
    points.append((BEAD_X - 0.006, RIM_RADIUS + 0.006))
    points.append((BEAD_X - 0.022, RIM_RADIUS + 0.003))
    return points


def tire_profile():
    right = half_profile()
    left = [(-x, r) for x, r in reversed(right[1:])]
    return left + right


def wheel_profile():
    """Rim and outboard face, from the inboard barrel round to the hub cap on the axis."""
    r = RIM_RADIUS
    return [
        (-0.150, r - 0.022),
        (-0.172, r - 0.014),
        (-0.178, r + 0.026),
        (-0.167, r + 0.026),
        (-0.160, r + 0.004),
        (0.160, r + 0.004),
        (0.167, r + 0.026),
        (0.178, r + 0.026),
        (0.172, r - 0.014),
        (0.150, r - 0.030),
        (0.128, 0.165),
        (0.118, 0.105),
        (0.122, 0.092),
        (0.150, 0.080),
        (0.166, 0.060),
        (0.170, 0.030),
        (0.170, 0.0),
    ]


def build():
    common.reset_scene()

    rubber = common.material("tire_rubber", (0.012, 0.012, 0.013), metallic=0.0, roughness=0.95)
    wheel_paint = common.material("wheel_paint", (0.42, 0.43, 0.44), metallic=0.35, roughness=0.5)
    bolt_steel = common.material("bolt_steel", (0.42, 0.42, 0.43), metallic=1.0, roughness=0.35)

    tire_bm = bmesh.new()
    common.revolve(tire_bm, tire_profile(), segments=128, u_repeat=8.0)
    common.object_from_bmesh("lookdev_tire", tire_bm, [rubber], sharp_angle_deg=40.0)

    wheel_bm = bmesh.new()
    common.revolve(wheel_bm, wheel_profile(), segments=72)
    bolt_count = 12
    bolt_ring_radius = 0.200
    for i in range(bolt_count):
        angle = 2.0 * math.pi * i / bolt_count
        centre = (0.141, bolt_ring_radius * math.cos(angle), bolt_ring_radius * math.sin(angle))
        common.add_cylinder_x(wheel_bm, centre, radius=0.011, length=0.016, sides=6, material_index=1)
    common.object_from_bmesh("lookdev_wheel", wheel_bm, [wheel_paint, bolt_steel])


if __name__ == "__main__":
    args = common.parse_args()
    build()
    common.export_glb(args.out)
