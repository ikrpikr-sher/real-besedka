#!/usr/bin/env python3
"""Рендер фото каталога после build-скрипта.

  blender --background --python render_product_photos.py -- b-11 build_besedka_4x4.py
"""
from __future__ import annotations

import importlib.util
import math
import os
import runpy
import sys

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BLENDER_SCRIPTS = os.environ.get(
    "BLENDER_SCRIPTS",
    os.path.expanduser("~/real-besedka/blender"),
)
IMG_DIR = os.path.join(ROOT, "public", "images", "proekty")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def load_gltf_module():
    spec = importlib.util.spec_from_file_location(
        "gltf_materials", os.path.join(SCRIPT_DIR, "gltf_materials.py")
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def scene_center() -> Vector:
    mins = Vector((float("inf"), float("inf"), float("inf")))
    maxs = Vector((float("-inf"), float("-inf"), float("-inf")))
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.hide_render:
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, world.x)
            mins.y = min(mins.y, world.y)
            mins.z = min(mins.z, world.z)
            maxs.x = max(maxs.x, world.x)
            maxs.y = max(maxs.y, world.y)
            maxs.z = max(maxs.z, world.z)
    if mins.x == float("inf"):
        return Vector((0, 0, 1.2))
    return Vector(((mins.x + maxs.x) / 2, (mins.y + maxs.y) / 2, mins.z + (maxs.z - mins.z) * 0.45))


def ensure_camera(name: str, location: tuple[float, float, float], target: Vector, lens: float = 32):
    cam = bpy.data.objects.get(name)
    if cam is None:
        cam = bpy.data.objects.new(name, bpy.data.cameras.new(name))
        bpy.context.scene.collection.objects.link(cam)
    cam.location = location
    direction = target - Vector(location)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = lens
    return cam


def setup_world_and_lights() -> None:
    sun = bpy.data.objects.get("Light")
    if sun is None:
        sun = bpy.data.objects.new("Light", bpy.data.lights.new("Light", "SUN"))
        bpy.context.scene.collection.objects.link(sun)
    sun.data.type = "SUN"
    sun.data.energy = 3.5
    sun.location = (6, -5, 10)
    sun.rotation_euler = (math.radians(40), math.radians(10), math.radians(35))

    fill = bpy.data.objects.get("Fill")
    if fill is None:
        fill = bpy.data.objects.new("Fill", bpy.data.lights.new("Fill", "AREA"))
        bpy.context.scene.collection.objects.link(fill)
    fill.data.energy = 180
    fill.data.size = 8
    fill.location = (-6, -4, 4)
    fill.rotation_euler = (math.radians(65), 0, math.radians(-30))

    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.78, 0.80, 0.83, 1.0)
        bg.inputs[1].default_value = 1.0


def prepare_for_render() -> None:
    gltf = load_gltf_module()
    for obj in list(bpy.data.objects):
        if obj.name == "Ground" or obj.name.startswith("Ground"):
            obj.hide_render = True
            obj.hide_viewport = True
    gltf.prepare_materials_for_gltf()

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    setup_world_and_lights()


def render_views(slug: str) -> list[str]:
    os.makedirs(IMG_DIR, exist_ok=True)
    center = scene_center()
    dist = max(7.5, center.length + 6.0)

    views = [
        ("Cam_Hero", (dist * 0.85, -dist * 0.85, center.z + 1.6), f"{slug}-1.png"),
        ("Cam_Front", (0.0, -dist, center.z + 0.8), f"{slug}-2.png"),
        ("Cam_Left", (-dist, 0.0, center.z + 0.9), f"{slug}-3.png"),
        ("Cam_Right", (dist, 0.0, center.z + 0.9), f"{slug}-4.png"),
        ("Cam_Hero_L", (-dist * 0.85, -dist * 0.85, center.z + 1.8), f"{slug}-5.png"),
        ("Cam_Panel", (0.0, -dist * 0.65, center.z + 0.5), f"{slug}-6.png"),
    ]

    paths: list[str] = []
    for cam_name, loc, filename in views:
        cam = ensure_camera(cam_name, loc, center)
        bpy.context.scene.camera = cam
        out = os.path.join(IMG_DIR, filename)
        scene = bpy.context.scene
        scene.render.filepath = out
        bpy.ops.render.render(write_still=True)
        paths.append(f"/images/proekty/{filename}")
        print(f"OK render {filename}")
    return paths


def main() -> None:
    if "--" not in sys.argv:
        raise SystemExit("Usage: blender --background --python render_product_photos.py -- slug script.py")
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) < 2:
        raise SystemExit("Need slug and build script name")
    slug, script_name = args[0], args[1]
    script_path = os.path.join(BLENDER_SCRIPTS, script_name)
    if not os.path.isfile(script_path):
        raise FileNotFoundError(script_path)

    runpy.run_path(script_path, run_name="__main__")
    prepare_for_render()
    paths = render_views(slug)
    print("RENDERED", len(paths))
    for p in paths:
        print(p)


if __name__ == "__main__":
    main()
