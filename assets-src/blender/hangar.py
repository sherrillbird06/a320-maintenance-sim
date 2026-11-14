"""Maintenance hangar: shell, roof trusses, doors, high-bay lights, floor markings and equipment.

Coordinates (metres): the floor is Z = 0 and the hangar is centred on the origin.
X runs along the aircraft (the aircraft's nose is at X = -18), Y to the aircraft's
right, Z up.

Nothing here is copied from a real facility. Sizes are chosen to fit an A320 with
working room, and equipment is laid out the way base-maintenance photographs show
it: stairs at the forward door, a stand at an engine, a lift at the tail, tool
storage and a documentation desk clear of the aircraft. All shapes are simple
stand-ins to be refined later.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bmesh  # noqa: E402
import common  # noqa: E402
from _gear import box, tube  # noqa: E402

HALF_LENGTH = 36.0  # along X
HALF_WIDTH = 30.0  # along Y
EAVES = 16.0
RIDGE = 19.5
BAY = 9.0  # spacing of frames along X

AIRCRAFT_NOSE_X = -18.0
DOOR_X = AIRCRAFT_NOSE_X + 5.04  # forward passenger door station
MAIN_GEAR_X = AIRCRAFT_NOSE_X + 5.07 + 12.64
NOSE_GEAR_X = AIRCRAFT_NOSE_X + 5.07


def obj(name, bm, materials):
    return common.object_from_bmesh(name, bm, materials)


def quad(bm, corners, material_index=0):
    bm.faces.new([bm.verts.new(c) for c in corners]).material_index = material_index


def beam(bm, p0, p1, size=0.22, material_index=0):
    tube(bm, p0, p1, size * 0.7, sides=4, material_index=material_index)


def shell(wall, lower, deck, slab):
    bm = bmesh.new()
    t = 0.3
    for y in (-HALF_WIDTH - t, HALF_WIDTH):
        box(bm, (-HALF_LENGTH, y, 0), (HALF_LENGTH, y + t, 3.0), 1)
        box(bm, (-HALF_LENGTH, y, 3.0), (HALF_LENGTH, y + t, EAVES), 0)
    # Back wall, with a gable.
    box(bm, (HALF_LENGTH, -HALF_WIDTH - t, 0), (HALF_LENGTH + t, HALF_WIDTH + t, 3.0), 1)
    box(bm, (HALF_LENGTH, -HALF_WIDTH - t, 3.0), (HALF_LENGTH + t, HALF_WIDTH + t, EAVES), 0)
    for x in (HALF_LENGTH, -HALF_LENGTH - 0.05):
        quad(bm, [(x, -HALF_WIDTH, EAVES), (x, HALF_WIDTH, EAVES), (x, 0, RIDGE)], 0)
        quad(bm, [(x + 0.05, 0, RIDGE), (x + 0.05, HALF_WIDTH, EAVES), (x + 0.05, -HALF_WIDTH, EAVES)], 0)
    # Roof deck, two slopes, seen from below.
    for side in (-1, 1):
        quad(bm, [(-HALF_LENGTH, 0, RIDGE + 0.35), (HALF_LENGTH, 0, RIDGE + 0.35),
                  (HALF_LENGTH, side * (HALF_WIDTH + t), EAVES + 0.35), (-HALF_LENGTH, side * (HALF_WIDTH + t), EAVES + 0.35)], 2)  # fmt: skip
    # Horizontal wall rails on the inside face, which break up the cladding.
    for z in (6.0, 9.5, 13.0):
        for y in (-HALF_WIDTH, HALF_WIDTH - 0.12):
            box(bm, (-HALF_LENGTH, y, z), (HALF_LENGTH, y + 0.12, z + 0.2), 3)
        box(bm, (HALF_LENGTH - 0.12, -HALF_WIDTH, z), (HALF_LENGTH, HALF_WIDTH, z + 0.2), 3)
    common.object_from_bmesh("hangar_shell", bm, [wall, lower, deck, slab], recalc_normals=False)


def roof_structure(steel):
    bm = bmesh.new()
    columns = bmesh.new()
    frames = [-HALF_LENGTH + 0.4 + BAY * i for i in range(int(2 * HALF_LENGTH / BAY) + 1)]
    frames[-1] = HALF_LENGTH - 0.4
    panel = 5.0
    for x in frames:
        for y in (-HALF_WIDTH + 0.3, HALF_WIDTH - 0.3):
            box(columns, (x - 0.22, y - 0.28, 0), (x + 0.22, y + 0.28, EAVES))
        beam(bm, (x, -HALF_WIDTH, EAVES), (x, HALF_WIDTH, EAVES), 0.3)
        nodes = [-HALF_WIDTH + panel * i for i in range(int(2 * HALF_WIDTH / panel) + 1)]
        top = lambda y: EAVES + 0.3 + (RIDGE - EAVES) * (1 - abs(y) / HALF_WIDTH)  # noqa: E731
        for a, b in zip(nodes, nodes[1:]):
            beam(bm, (x, a, top(a)), (x, b, top(b)), 0.26)
            beam(bm, (x, b, EAVES), (x, b, top(b)), 0.16)
            lo, hi = (a, b) if (a + b) < 0 else (b, a)
            beam(bm, (x, lo, EAVES), (x, hi, top(hi)), 0.16)
    # Purlins along the building, under the deck.
    for y in [-HALF_WIDTH + 3.0 * i for i in range(int(2 * HALF_WIDTH / 3.0) + 1)]:
        z = EAVES + 0.3 + (RIDGE - EAVES) * (1 - abs(y) / HALF_WIDTH)
        beam(bm, (-HALF_LENGTH, y, z), (HALF_LENGTH, y, z), 0.14)
    obj("hangar_roof_structure", bm, [steel])
    obj("hangar_columns", columns, [steel])
    return frames


def doors(panel, frame, glazing):
    """Sliding doors across the front of the hangar, closed."""
    bm = bmesh.new()
    leaves = 6
    width = 2 * HALF_WIDTH / leaves
    for i in range(leaves):
        y0 = -HALF_WIDTH + width * i
        depth = 0.18 * (i % 2)
        x = -HALF_LENGTH - 0.25 - depth
        box(bm, (x, y0, 0), (x + 0.16, y0 + width, EAVES), 0)
        # Frame members on the inside face, and a strip of windows.
        for y in (y0 + 0.1, y0 + width / 2, y0 + width - 0.3):
            box(bm, (x + 0.16, y, 0), (x + 0.26, y + 0.2, EAVES), 1)
        for z in (0.1, 4.5, 9.0, 13.5):
            box(bm, (x + 0.16, y0, z), (x + 0.26, y0 + width, z + 0.2), 1)
        box(bm, (x + 0.165, y0 + 0.5, 5.2), (x + 0.2, y0 + width - 0.5, 8.4), 2)
    box(bm, (-HALF_LENGTH - 0.6, -HALF_WIDTH, EAVES - 0.4), (-HALF_LENGTH, HALF_WIDTH, EAVES + 0.2), 1)
    obj("hangar_doors", bm, [panel, frame, glazing])


def lights(frames, housing, lamp):
    bm = bmesh.new()
    for x in frames:
        for y in (-24.0, -12.0, 0.0, 12.0, 24.0):
            z = EAVES - 0.75
            tube(bm, (x, y, EAVES - 0.1), (x, y, z + 0.16), 0.02, sides=6)
            box(bm, (x - 0.6, y - 0.3, z), (x + 0.6, y + 0.3, z + 0.16), 0)
            quad(bm, [(x - 0.55, y - 0.25, z - 0.002), (x - 0.55, y + 0.25, z - 0.002),
                      (x + 0.55, y + 0.25, z - 0.002), (x + 0.55, y - 0.25, z - 0.002)], 1)  # fmt: skip
    common.object_from_bmesh("hangar_lights", bm, [housing, lamp], recalc_normals=False)


def floor_markings(yellow, red, green, white):
    bm = bmesh.new()
    z = 0.004

    def line(x0, y0, x1, y1, width, material_index):
        dx, dy = x1 - x0, y1 - y0
        length = math.hypot(dx, dy)
        nx, ny = -dy / length * width / 2, dx / length * width / 2
        quad(bm, [(x0 - nx, y0 - ny, z), (x1 - nx, y1 - ny, z), (x1 + nx, y1 + ny, z), (x0 + nx, y0 + ny, z)], material_index)

    # Aircraft centreline and nose-wheel stop bar.
    line(-HALF_LENGTH + 1, 0, HALF_LENGTH - 6, 0, 0.15, 0)
    line(NOSE_GEAR_X, -1.2, NOSE_GEAR_X, 1.2, 0.2, 0)
    # Aircraft safety zone.
    x0, x1, y0 = AIRCRAFT_NOSE_X - 4.0, AIRCRAFT_NOSE_X + 37.57 + 4.0, 21.0
    for a, b in (((x0, -y0), (x1, -y0)), ((x1, -y0), (x1, y0)), ((x1, y0), (x0, y0)), ((x0, y0), (x0, -y0))):
        line(*a, *b, 0.12, 1)
    # Pedestrian walkway along the left wall and across the back.
    for y in (-27.6, -25.6):
        line(-HALF_LENGTH + 2, y, HALF_LENGTH - 2, y, 0.1, 2)
    for x in (HALF_LENGTH - 4.4, HALF_LENGTH - 2.4):
        line(x, -25.6, x, HALF_WIDTH - 2, 0.1, 2)
    # Equipment parking bays by the left wall.
    for x in (-30.0, -26.0, -22.0, -18.0):
        line(x, -24.8, x, -21.0, 0.1, 3)
    line(-30.0, -21.0, -18.0, -21.0, 0.1, 3)
    common.object_from_bmesh("hangar_floor_markings", bm, [yellow, red, green, white], recalc_normals=False)


def railing(bm, points, height=1.05, material_index=0):
    """Posts and two rails along a run of floor-level points."""
    for (x0, y0, z0), (x1, y1, z1) in zip(points, points[1:]):
        for h in (height, height * 0.5):
            tube(bm, (x0, y0, z0 + h), (x1, y1, z1 + h), 0.02, sides=6, material_index=material_index)
    for x, y, z in points:
        tube(bm, (x, y, z), (x, y, z + height), 0.022, sides=6, material_index=material_index)


def stair_flight(bm, top, direction, steps, width, rise=0.2, run=0.27, material_index=0):
    """Treads descending from `top` (the top nosing centre) along a horizontal unit direction."""
    dx, dy = direction
    px, py = -dy * width / 2, dx * width / 2
    rails = {1: [], -1: []}
    for i in range(steps + 1):
        cx, cy, cz = top[0] + dx * run * i, top[1] + dy * run * i, top[2] - rise * i
        lo = (min(cx - px, cx + px) - abs(dx) * run / 2, min(cy - py, cy + py) - abs(dy) * run / 2, cz - 0.03)
        hi = (max(cx - px, cx + px) + abs(dx) * run / 2, max(cy - py, cy + py) + abs(dy) * run / 2, cz)
        if i > 0:
            box(bm, lo, hi, material_index)
        if i % 3 == 0 or i == steps:
            for s in (1, -1):
                rails[s].append((cx + s * px, cy + s * py, cz))
    for s in (1, -1):
        railing(bm, rails[s], material_index=1)
        tube(bm, rails[s][0], rails[s][-1], 0.04, sides=4, material_index=1)
    return top[2] - rise * steps


def door_stairs(deck, frame, yellow):
    """Platform at the forward left door sill with a flight down, parallel to the fuselage."""
    bm = bmesh.new()
    sill = 3.40
    y_in, y_out = -2.02, -3.45
    box(bm, (DOOR_X - 0.9, y_out, sill - 0.06), (DOOR_X + 0.9, y_in, sill), 0)
    railing(bm, [(DOOR_X - 0.9, y_in - 0.05, sill), (DOOR_X - 0.9, y_out, sill), (DOOR_X + 0.9, y_out, sill)], material_index=1)
    for x in (DOOR_X - 0.85, DOOR_X + 0.85):
        for y in (y_in - 0.08, y_out + 0.08):
            tube(bm, (x, y, 0.0), (x, y, sill - 0.06), 0.035, sides=6, material_index=1)
    # Flight runs aft, alongside the fuselage, from the aft edge of the platform.
    steps = int(round(sill / 0.2)) - 1
    stair_flight(bm, (DOOR_X + 0.9 + 0.135, (y_in + y_out) / 2, sill), (1.0, 0.0), steps, 1.1)
    box(bm, (DOOR_X - 0.9, y_in - 0.02, sill - 0.3), (DOOR_X + 0.9, y_in, sill - 0.06), 2)  # padded bumper at the fuselage
    obj("door_stairs", bm, [deck, frame, yellow])


def engine_stand(deck, frame, yellow):
    """Low work platform outboard of the left engine."""
    bm = bmesh.new()
    x0, x1 = AIRCRAFT_NOSE_X + 11.3, AIRCRAFT_NOSE_X + 14.3
    y_in, y_out, top = -7.15, -8.45, 1.0
    box(bm, (x0, y_out, top - 0.06), (x1, y_in, top), 0)
    for x in (x0 + 0.08, x1 - 0.08):
        for y in (y_in - 0.08, y_out + 0.08):
            tube(bm, (x, y, 0.12), (x, y, top - 0.06), 0.03, sides=6, material_index=1)
            tube(bm, (x, y, 0.0), (x, y, 0.12), 0.06, sides=8, material_index=2)
    railing(bm, [(x0, y_out, top), (x1, y_out, top)], material_index=1)
    stair_flight(bm, (x1 + 0.135, (y_in + y_out) / 2, top), (1.0, 0.0), 4, 0.9)
    obj("engine_stand", bm, [deck, frame, yellow])


def tail_lift(deck, frame, yellow):
    """Scissor lift raised beside the fin."""
    bm = bmesh.new()
    cx, cy, top = AIRCRAFT_NOSE_X + 34.2, -3.2, 6.8
    box(bm, (cx - 1.3, cy - 0.65, 0.18), (cx + 1.3, cy + 0.65, 0.62), 2)
    for x in (cx - 0.95, cx + 0.95):
        for y in (cy - 0.7, cy + 0.7):
            tube(bm, (x, y - 0.06, 0.2), (x, y + 0.06, 0.2), 0.2, sides=14, material_index=1)
    stages = 5
    span = (top - 0.12 - 0.62) / stages
    for i in range(stages):
        z0, z1 = 0.62 + span * i, 0.62 + span * (i + 1)
        for y in (cy - 0.5, cy + 0.5):
            beam(bm, (cx - 1.1, y, z0), (cx + 1.1, y, z1), 0.09, 1)
            beam(bm, (cx + 1.1, y, z0), (cx - 1.1, y, z1), 0.09, 1)
        tube(bm, (cx, cy - 0.5, (z0 + z1) / 2), (cx, cy + 0.5, (z0 + z1) / 2), 0.03, sides=6, material_index=1)
    box(bm, (cx - 1.4, cy - 0.75, top - 0.12), (cx + 1.4, cy + 0.75, top), 0)
    corners = [(cx - 1.4, cy - 0.75, top), (cx + 1.4, cy - 0.75, top), (cx + 1.4, cy + 0.75, top), (cx - 1.4, cy + 0.75, top)]
    railing(bm, corners + [corners[0]], material_index=2)
    obj("tail_lift", bm, [deck, frame, yellow])


def roll_cab(name, x, y, red, steel, dark):
    bm = bmesh.new()
    w, d, h = 1.05, 0.5, 1.0
    box(bm, (x, y, 0.12), (x + w, y + d, h), 0)
    box(bm, (x - 0.02, y - 0.02, h), (x + w + 0.02, y + d + 0.02, h + 0.03), 2)
    for i in range(6):
        z = 0.2 + i * 0.13
        box(bm, (x + 0.03, y - 0.012, z), (x + w - 0.03, y, z + 0.11), 0)
        box(bm, (x + 0.2, y - 0.03, z + 0.07), (x + w - 0.2, y - 0.012, z + 0.085), 1)
    for cx in (x + 0.1, x + w - 0.1):
        for cy in (y + 0.08, y + d - 0.08):
            tube(bm, (cx - 0.02, cy, 0.06), (cx + 0.02, cy, 0.06), 0.06, sides=10, material_index=2)
    obj(name, bm, [red, steel, dark])


def workbench(steel, top_mat, dark):
    bm = bmesh.new()
    x, y, w, d, h = -14.5, -29.0, 2.4, 0.8, 0.92
    box(bm, (x, y, h - 0.05), (x + w, y + d, h), 1)
    for cx in (x + 0.05, x + w - 0.05):
        for cy in (y + 0.05, y + d - 0.05):
            box(bm, (cx - 0.03, cy - 0.03, 0), (cx + 0.03, cy + 0.03, h - 0.05), 0)
    box(bm, (x + 0.05, y + 0.05, 0.2), (x + w - 0.05, y + d - 0.05, 0.23), 0)
    box(bm, (x, y + d - 0.03, h), (x + w, y + d, h + 0.9), 0)  # tool board
    box(bm, (x + 0.2, y + 0.15, h), (x + 0.5, y + 0.4, h + 0.18), 2)  # vice block
    obj("workbench", bm, [steel, top_mat, dark])


def documentation_station(steel, top_mat, dark, screen):
    """Standing desk with a terminal, where work orders are accepted and signed off."""
    bm = bmesh.new()
    x, y, w, d, h = -28.5, -24.0, 1.6, 0.75, 1.05
    box(bm, (x, y, h - 0.04), (x + w, y + d, h), 1)
    box(bm, (x + 0.05, y + 0.05, 0), (x + 0.11, y + d - 0.05, h - 0.04), 0)
    box(bm, (x + w - 0.11, y + 0.05, 0), (x + w - 0.05, y + d - 0.05, h - 0.04), 0)
    box(bm, (x + 0.05, y + d - 0.1, 0.3), (x + w - 0.05, y + d - 0.05, h - 0.04), 0)
    tube(bm, (x + 0.8, y + 0.5, h), (x + 0.8, y + 0.5, h + 0.22), 0.025, sides=8, material_index=2)
    box(bm, (x + 0.5, y + 0.47, h + 0.2), (x + 1.1, y + 0.5, h + 0.58), 2)
    quad(bm, [(x + 0.52, y + 0.469, h + 0.22), (x + 1.08, y + 0.469, h + 0.22),
              (x + 1.08, y + 0.469, h + 0.56), (x + 0.52, y + 0.469, h + 0.56)], 3)  # fmt: skip
    box(bm, (x + 0.55, y + 0.15, h), (x + 1.05, y + 0.32, h + 0.02), 2)  # keyboard
    box(bm, (x + 1.2, y + 0.1, h), (x + 1.5, y + 0.52, h + 0.04), 1)  # binder
    obj("documentation_station", bm, [steel, top_mat, dark, screen])


def ground_power_unit(yellow, dark, steel):
    bm = bmesh.new()
    x, y = AIRCRAFT_NOSE_X - 3.2, 5.2
    box(bm, (x, y, 0.35), (x + 2.2, y + 1.2, 1.35), 0)
    box(bm, (x + 0.1, y - 0.01, 0.9), (x + 0.9, y, 1.25), 1)  # control panel
    for cx in (x + 0.4, x + 1.8):
        for cy in (y + 0.02, y + 1.18):
            tube(bm, (cx, cy - 0.07, 0.25), (cx, cy + 0.07, 0.25), 0.25, sides=14, material_index=1)
    tube(bm, (x + 2.2, y + 0.6, 0.45), (x + 3.3, y + 0.6, 0.3), 0.03, sides=6, material_index=2)  # tow bar
    obj("ground_power_unit", bm, [yellow, dark, steel])


def fire_extinguisher(red, dark, steel):
    bm = bmesh.new()
    x, y = AIRCRAFT_NOSE_X - 1.5, -11.0
    tube(bm, (x, y, 0.25), (x, y, 1.15), 0.17, sides=16)
    tube(bm, (x, y, 1.15), (x, y, 1.3), 0.17, 0.05, sides=16)
    tube(bm, (x, y, 1.3), (x, y, 1.42), 0.04, sides=8, material_index=2)
    for cy in (y - 0.22, y + 0.22):
        tube(bm, (x - 0.1, cy - 0.03, 0.18), (x - 0.1, cy + 0.03, 0.18), 0.18, sides=12, material_index=1)
    tube(bm, (x - 0.2, y, 0.3), (x - 0.35, y, 1.2), 0.018, sides=6, material_index=2)
    obj("fire_extinguisher", bm, [red, dark, steel])


def cones_and_chocks(orange, white, rubber, yellow):
    half_span = 17.05
    spots = [
        (AIRCRAFT_NOSE_X - 2.0, 0.0), (AIRCRAFT_NOSE_X + 20.5, -half_span - 1.5), (AIRCRAFT_NOSE_X + 20.5, half_span + 1.5),
        (AIRCRAFT_NOSE_X + 39.5, 0.0), (AIRCRAFT_NOSE_X + 10.0, -8.6), (AIRCRAFT_NOSE_X + 10.0, 8.6),
        (AIRCRAFT_NOSE_X + 36.0, -7.5), (AIRCRAFT_NOSE_X + 36.0, 7.5),
    ]  # fmt: skip
    for i, (x, y) in enumerate(spots, start=1):
        bm = bmesh.new()
        box(bm, (x - 0.19, y - 0.19, 0), (x + 0.19, y + 0.19, 0.03), 0)
        tube(bm, (x, y, 0.03), (x, y, 0.36), 0.14, 0.085, sides=16, material_index=0)
        tube(bm, (x, y, 0.36), (x, y, 0.5), 0.085, 0.058, sides=16, material_index=1)
        tube(bm, (x, y, 0.5), (x, y, 0.72), 0.058, 0.025, sides=16, material_index=0)
        obj(f"safety_cone_{i}", bm, [orange, white])

    # Chocks fore and aft of the nose wheels and of each main gear's outer wheel.
    wheels = [(NOSE_GEAR_X, 0.0, 0.381, 0.62), (MAIN_GEAR_X, -3.795, 0.584, 1.5), (MAIN_GEAR_X, 3.795, 0.584, 1.5)]
    index = 1
    for x, y, radius, width in wheels:
        for direction in (-1, 1):
            # A wedge whose sloped face meets the tire.
            foot = x + direction * (radius * 0.55 + 0.02)
            bm = bmesh.new()
            common.loft(bm, [
                [(foot, y - width / 2, 0), (foot + direction * 0.26, y - width / 2, 0), (foot + direction * 0.2, y - width / 2, 0.2)],
                [(foot, y + width / 2, 0), (foot + direction * 0.26, y + width / 2, 0), (foot + direction * 0.2, y + width / 2, 0.2)],
            ])  # fmt: skip
            obj(f"wheel_chock_{index}", bm, [yellow if index % 2 else rubber])
            index += 1


def drip_trays(steel):
    for i, y in enumerate((-5.75, 5.75), start=1):
        bm = bmesh.new()
        x = AIRCRAFT_NOSE_X + 12.6
        box(bm, (x, y - 0.5, 0), (x + 1.4, y + 0.5, 0.012))
        for a, b in (((x, y - 0.5), (x + 1.4, y - 0.48)), ((x, y + 0.48), (x + 1.4, y + 0.5)),
                     ((x, y - 0.5), (x + 0.02, y + 0.5)), ((x + 1.38, y - 0.5), (x + 1.4, y + 0.5))):  # fmt: skip
            box(bm, (a[0], a[1], 0), (b[0], b[1], 0.06))
        obj(f"drip_tray_{i}", bm, [steel])


def build():
    common.reset_scene()
    m = common.material
    wall = m("hangar_wall", (0.62, 0.64, 0.66), metallic=0.1, roughness=0.6)
    lower = m("hangar_wall_lower", (0.42, 0.43, 0.44), roughness=0.9)
    deck = m("hangar_roof_deck", (0.55, 0.56, 0.57), metallic=0.2, roughness=0.6)
    rail = m("hangar_wall_rail", (0.36, 0.40, 0.45), metallic=0.4, roughness=0.5)
    steel = m("hangar_steel", (0.20, 0.25, 0.31), metallic=0.5, roughness=0.5)
    door_panel = m("hangar_door", (0.55, 0.58, 0.61), metallic=0.3, roughness=0.5)
    glazing = m("hangar_glazing", (0.55, 0.66, 0.75), roughness=0.2)
    housing = m("lamp_housing", (0.15, 0.15, 0.16), metallic=0.6, roughness=0.5)
    lamp = m("lamp_emissive", (1.0, 0.97, 0.90), roughness=0.4)
    yellow_line = m("line_yellow", (0.75, 0.55, 0.05), roughness=0.6)
    red_line = m("line_red", (0.55, 0.08, 0.06), roughness=0.6)
    green_line = m("line_green", (0.10, 0.40, 0.20), roughness=0.6)
    white_line = m("line_white", (0.80, 0.80, 0.78), roughness=0.6)
    alu = m("equipment_aluminium", (0.62, 0.63, 0.64), metallic=0.9, roughness=0.45)
    frame = m("equipment_frame", (0.16, 0.30, 0.50), metallic=0.3, roughness=0.5)
    yellow = m("equipment_yellow", (0.80, 0.56, 0.05), metallic=0.1, roughness=0.5)
    red = m("equipment_red", (0.55, 0.06, 0.05), metallic=0.2, roughness=0.4)
    dark = m("equipment_dark", (0.03, 0.03, 0.035), roughness=0.7)
    bench_top = m("bench_top", (0.30, 0.22, 0.14), roughness=0.7)
    screen = m("screen_emissive", (0.55, 0.70, 0.85), roughness=0.3)
    orange = m("cone_orange", (0.85, 0.25, 0.03), roughness=0.6)
    white = m("cone_white", (0.85, 0.85, 0.85), roughness=0.5)

    shell(wall, lower, deck, rail)
    frames = roof_structure(steel)
    doors(door_panel, steel, glazing)
    lights(frames, housing, lamp)
    floor_markings(yellow_line, red_line, green_line, white_line)
    door_stairs(alu, frame, yellow)
    engine_stand(alu, frame, yellow)
    tail_lift(alu, frame, yellow)
    roll_cab("toolbox_roll_cab_1", AIRCRAFT_NOSE_X + 8.0, -13.0, red, alu, dark)
    roll_cab("toolbox_roll_cab_2", AIRCRAFT_NOSE_X + 9.4, -13.0, red, alu, dark)
    workbench(steel, bench_top, dark)
    documentation_station(steel, bench_top, dark, screen)
    ground_power_unit(yellow, dark, alu)
    fire_extinguisher(red, dark, alu)
    cones_and_chocks(orange, white, dark, yellow)
    drip_trays(alu)


if __name__ == "__main__":
    args = common.parse_args()
    build()
    common.export_glb(args.out)
