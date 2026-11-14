"""Shared helpers for the headless model scripts.

Each model is a Python script that builds its meshes from dimensions and exports
one .glb. Scripts are run by `npm run models`:

    blender --background --factory-startup --python <script>.py -- --out <file>.glb

Conventions
- Units are metres. Blender is Z-up; the exporter converts to glTF's Y-up.
- An object's name becomes its glTF node name. For inspectable components the
  name must equal the component id in src/data/components.
- Call mark_inspectable() on every object the player can select.
"""

import argparse
import math
import sys

import bmesh
import bpy


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True, help="path of the .glb to write")
    return parser.parse_args(argv)


def reset_scene():
    """Start from an empty file so nothing from the user's startup scene leaks in."""
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, base_color, metallic=0.0, roughness=0.5, coat=0.0, coat_roughness=0.05):
    """A Principled BSDF material. base_color is linear RGB."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = coat_roughness
    return mat


def object_from_bmesh(name, bm, materials, sharp_angle_deg=35.0, recalc_normals=True):
    """Turn a bmesh into a linked, smooth-shaded object with sharp creases kept."""
    # Closed shapes get consistent outward normals; open patches keep the winding they were built with.
    if recalc_normals:
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for mat in materials:
        mesh.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    mesh.set_sharp_from_angle(angle=math.radians(sharp_angle_deg))
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def revolve(bm, profile, segments, material_index=0, u_repeat=1.0, place=None):
    """Sweep a profile around the X axis and add the surface to bm.

    profile is a list of (x, radius) points, in order. UVs run u around the
    circumference (0..u_repeat) and v along the profile by arc length (0..1).
    place, if given, maps each local (x, y, z) point to where it belongs in the model.
    """
    place = place or (lambda x, y, z: (x, y, z))
    start = len(bm.verts)
    uv_layer = bm.loops.layers.uv.verify()

    lengths = [0.0]
    for (x0, r0), (x1, r1) in zip(profile, profile[1:]):
        lengths.append(lengths[-1] + math.hypot(x1 - x0, r1 - r0))
    total = lengths[-1] or 1.0
    v_coords = [length / total for length in lengths]

    rings = []
    for s in range(segments):
        angle = 2.0 * math.pi * s / segments
        ca, sa = math.cos(angle), math.sin(angle)
        rings.append([bm.verts.new(place(x, r * ca, r * sa)) for x, r in profile])

    for s in range(segments):
        ring_a = rings[s]
        ring_b = rings[(s + 1) % segments]
        u_a = u_repeat * s / segments
        u_b = u_repeat * (s + 1) / segments
        for j in range(len(profile) - 1):
            # Skip degenerate quads on the axis (radius 0 at both ends).
            if profile[j][1] == 0.0 and profile[j + 1][1] == 0.0:
                continue
            corners = [
                (ring_a[j], u_a, v_coords[j]),
                (ring_b[j], u_b, v_coords[j]),
                (ring_b[j + 1], u_b, v_coords[j + 1]),
                (ring_a[j + 1], u_a, v_coords[j + 1]),
            ]
            verts = []
            uvs = []
            for vert, u, v in corners:
                if vert not in verts:
                    verts.append(vert)
                    uvs.append((u, v))
            if len(verts) < 3:
                continue
            face = bm.faces.new(verts)
            face.material_index = material_index
            for loop, uv in zip(face.loops, uvs):
                loop[uv_layer].uv = uv

    bm.verts.ensure_lookup_table()
    bmesh.ops.remove_doubles(bm, verts=bm.verts[start:], dist=1e-6)
    return bm


def loft(bm, rings, cap_start=True, cap_end=True, material_index=0):
    """Skin a surface through closed rings of points (each ring the same length, same winding)."""
    vert_rings = [[bm.verts.new(p) for p in ring] for ring in rings]
    count = len(rings[0])
    for ring_a, ring_b in zip(vert_rings, vert_rings[1:]):
        for i in range(count):
            j = (i + 1) % count
            face = bm.faces.new((ring_a[i], ring_a[j], ring_b[j], ring_b[i]))
            face.material_index = material_index
    if cap_start:
        bm.faces.new(list(reversed(vert_rings[0]))).material_index = material_index
    if cap_end:
        bm.faces.new(vert_rings[-1]).material_index = material_index
    return bm


def add_cylinder_x(bm, centre, radius, length, sides=12, material_index=0):
    """A capped cylinder whose axis lies along X, centred on `centre`."""
    cx, cy, cz = centre
    half = length / 2.0
    left, right = [], []
    for i in range(sides):
        angle = 2.0 * math.pi * i / sides
        y, z = cy + radius * math.cos(angle), cz + radius * math.sin(angle)
        left.append(bm.verts.new((cx - half, y, z)))
        right.append(bm.verts.new((cx + half, y, z)))
    faces = []
    for i in range(sides):
        j = (i + 1) % sides
        faces.append(bm.faces.new((left[i], left[j], right[j], right[i])))
    faces.append(bm.faces.new(list(reversed(left))))
    faces.append(bm.faces.new(right))
    for face in faces:
        face.material_index = material_index
    return bm


def mark_inspectable(obj):
    """Flag an object as selectable in the simulator (exported as glTF extras)."""
    obj["inspectable"] = True


def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_extras=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )
