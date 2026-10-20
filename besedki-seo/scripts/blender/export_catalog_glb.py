#!/usr/bin/env python3
"""Сборка сцены из build-скрипта и экспорт GLB для каталога.

Запуск:
  blender --background --python scripts/blender/export_catalog_glb.py -- b-12

Или все модели:
  bash scripts/export-catalog-models.sh
"""
from __future__ import annotations

import json
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONFIG_PATH = os.path.join(ROOT, "data", "catalog-models.json")
BLENDER_SCRIPTS = os.environ.get(
    "BLENDER_SCRIPTS",
    os.path.expanduser("~/real-besedka/blender"),
)
OUT_DIR = os.path.join(ROOT, "public", "models")

EXCLUDE_OBJECT_NAMES = {"Ground", "Camera", "Light", "Fill", "Fire_Pad", "Sun"}
EXCLUDE_COLLECTION_NAMES = {"Besedka_Env", "Env", "Zone_Table"}

CONFIGURATOR_ACCESSORY_NAMES = {
    "Wall_S", "Wall_N", "Wall_W", "Wall_E",
    "Curtain_S", "Curtain_N", "Curtain_W", "Curtain_E",
    "Net_S", "Net_N", "Net_W", "Net_E",
    "LED_Strip",
}

# RAL 7016 Anthracite grey — #383E42 (sRGB)
RAL_7016 = (56 / 255, 62 / 255, 66 / 255, 1.0)
STEEL_COLOR = RAL_7016
ROOF_COLOR = RAL_7016
BOLT_COLOR = (0.18, 0.20, 0.22, 1.0)
DPK_COLOR = (0.58, 0.56, 0.52, 1.0)


def load_build_map() -> dict[str, dict]:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        cfg = json.load(f)
    return cfg["models"]


BUILD_MAP = load_build_map()


def parse_slugs(argv: list[str]) -> list[str]:
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    slugs = [s for s in argv if s in BUILD_MAP]
    return slugs or list(BUILD_MAP.keys())


def object_in_excluded_collection(obj: bpy.types.Object) -> bool:
    for col in obj.users_collection:
        if col.name in EXCLUDE_COLLECTION_NAMES:
            return True
    return False


def find_image_node(material: bpy.types.Material) -> bpy.types.ShaderNodeTexImage | None:
    if not material.use_nodes:
        return None
    for node in material.node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image:
            return node
    return None


def normalize_panel_image_for_gltf(img: bpy.types.Image) -> None:
    """glTF умножает baseColor на RGB текстуры — делаем серый фон, альфа = вырез."""
    if not img or img.size[0] == 0:
        return
    px = list(img.pixels[:])
    for i in range(0, len(px), 4):
        px[i] = STEEL_COLOR[0]
        px[i + 1] = STEEL_COLOR[1]
        px[i + 2] = STEEL_COLOR[2]
    img.pixels.foreach_set(px)
    img.update()


def rebuild_panel_material_for_gltf(material: bpy.types.Material, img_node: bpy.types.ShaderNodeTexImage) -> None:
    """glTF не понимает Mix+Transparent — только Principled с альфой."""
    img = img_node.image
    if img:
        normalize_panel_image_for_gltf(img)
        if not img.packed_file:
            img.pack()

    nt = material.node_tree
    for node in list(nt.nodes):
        nt.nodes.remove(node)

    output = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex = nt.nodes.new("ShaderNodeTexImage")
    invert = nt.nodes.new("ShaderNodeMath")
    invert.operation = "SUBTRACT"
    invert.inputs[0].default_value = 1.0

    tex.image = img
    tex.interpolation = "Closest"
    bsdf.inputs["Base Color"].default_value = STEEL_COLOR
    bsdf.inputs["Metallic"].default_value = 0.78
    bsdf.inputs["Roughness"].default_value = 0.42

    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    # В PNG: высокая alpha = вырез; glTF MASK отбрасывает низкую alpha — инвертируем.
    nt.links.new(tex.outputs["Alpha"], invert.inputs[1])
    nt.links.new(invert.outputs["Value"], bsdf.inputs["Alpha"])
    nt.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    tex.location = (-500, 0)
    invert.location = (-250, -120)
    bsdf.location = (-100, 0)
    output.location = (150, 0)

    material.blend_method = "CLIP"
    material.alpha_threshold = 0.5
    material.use_backface_culling = False


def retarget_solid_material(material: bpy.types.Material) -> None:
    if not material.use_nodes:
        return
    bsdf = next((n for n in material.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        return

    name = material.name.lower()
    if "panel" in name:
        return
    if "roof" in name:
        bsdf.inputs["Base Color"].default_value = ROOF_COLOR
        bsdf.inputs["Metallic"].default_value = 0.72
        bsdf.inputs["Roughness"].default_value = 0.48
    elif "bolt" in name:
        bsdf.inputs["Base Color"].default_value = BOLT_COLOR
        bsdf.inputs["Metallic"].default_value = 0.85
        bsdf.inputs["Roughness"].default_value = 0.35
    elif "dpk" in name or "deck" in name:
        bsdf.inputs["Base Color"].default_value = DPK_COLOR
        bsdf.inputs["Metallic"].default_value = 0.05
        bsdf.inputs["Roughness"].default_value = 0.78
    elif "steel" in name or "anthracite" in name:
        bsdf.inputs["Base Color"].default_value = STEEL_COLOR
        bsdf.inputs["Metallic"].default_value = 0.78
        bsdf.inputs["Roughness"].default_value = 0.42


def prepare_materials_for_gltf() -> None:
    for material in bpy.data.materials:
        img_node = find_image_node(material)
        if img_node:
            rebuild_panel_material_for_gltf(material, img_node)
        else:
            retarget_solid_material(material)

    bpy.ops.file.pack_all()


def world_bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    mins = Vector((float("inf"), float("inf"), float("inf")))
    maxs = Vector((float("-inf"), float("-inf"), float("-inf")))
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, world.x)
            mins.y = min(mins.y, world.y)
            mins.z = min(mins.z, world.z)
            maxs.x = max(maxs.x, world.x)
            maxs.y = max(maxs.y, world.y)
            maxs.z = max(maxs.z, world.z)
    return mins, maxs


def prepare_scene_for_export() -> list[bpy.types.Object]:
    """Удаляет сцену/пол, распаковывает иерархию, центрирует модель."""
    for obj in list(bpy.data.objects):
        if (
            obj.name in EXCLUDE_OBJECT_NAMES
            or obj.name.startswith("Ground")
            or obj.name.startswith("Zone_Table")
            or obj.name.startswith("Fire_Pad")
            or object_in_excluded_collection(obj)
            or obj.type in {"CAMERA", "LIGHT"}
        ):
            bpy.data.objects.remove(obj, do_unlink=True)

    for obj in list(bpy.data.objects):
        if obj.type == "MESH" and obj.parent:
            matrix = obj.matrix_world.copy()
            obj.parent = None
            obj.matrix_world = matrix

    for obj in list(bpy.data.objects):
        if obj.type == "EMPTY":
            bpy.data.objects.remove(obj, do_unlink=True)

    mesh_objects = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    for obj in mesh_objects:
        obj.hide_set(False)
        obj.hide_render = False
        obj.hide_viewport = False

    if mesh_objects:
        mins, maxs = world_bounds(mesh_objects)
        offset = Vector(
            (-(mins.x + maxs.x) / 2, -(mins.y + maxs.y) / 2, -mins.z)
        )
        for obj in mesh_objects:
            obj.matrix_world.translation += offset

    prepare_materials_for_gltf()
    return mesh_objects


def export_glb(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mesh_objects = prepare_scene_for_export()

    bpy.ops.object.select_all(action="DESELECT")
    for obj in mesh_objects:
        obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_yup=True,
    )


HEX_LOFT_DIAMETER = {"b-51": 2.5, "b-52": 3.0, "b-56": 6.0}
OCTAGON_DIAMETER = {"b-57": 8.0, "b-59": 10.0}
SQUARE_OPEN = {
    "b-58": (6.0, 4.0),
    "b-60": (8.0, 4.0),
    "b-61": (10.0, 5.0),
}
KACHELI_ROOF = {"k-33-poly": "poly", "k-34-poly": "poly"}


def invoke_build(
    namespace: dict,
    script_path: str,
    slug: str,
    build_only: list | None,
) -> None:
    """Call the build entry point without running the script's CLI main()."""
    base = os.path.basename(script_path)

    if base == "build_besedka_loft_small.py":
        namespace["build_from_slug"](slug)
        return

    if base == "build_besedka_hex_loft.py":
        namespace["build"](HEX_LOFT_DIAMETER.get(slug, 3.0))
        return

    if base == "build_besedka_octagon_6.py":
        namespace["build"](OCTAGON_DIAMETER.get(slug, 6.0))
        return

    if base == "build_besedka_square_open.py":
        size, ridge = SQUARE_OPEN.get(slug, (6.0, 4.0))
        namespace["build"](size, ridge)
        return

    if base == "build_pavilion_glazed_8x6.py":
        namespace["build"]()
        return

    if base in {"build_kacheli_k33_lattice.py", "build_kacheli_k34.py"}:
        namespace["build"](KACHELI_ROOF.get(slug, "lattice"))
        return

    if base == "build_configurator_accessories.py":
        namespace["build_accessories_for_scene"]()
        return

    if base == "build_kacheli_ref.py" and build_only:
        os.environ["BUILD_SLUG"] = str(build_only[0])
        namespace["main"]()
        return

    build_from_slug = namespace.get("build_from_slug")
    if callable(build_from_slug):
        build_from_slug(slug)
        return

    main_fn = namespace.get("main")
    if callable(main_fn):
        main_fn()
        return

    build_fn = namespace.get("build")
    if callable(build_fn):
        build_fn()
        return

    raise ValueError(f"No build entry point in {script_path}")


def run_build_script(
    script_path: str,
    build_only: list | None = None,
    slug: str | None = None,
) -> None:
    with open(script_path, encoding="utf-8") as f:
        source = f.read()
    if build_only:
        if len(build_only) == 2 and all(isinstance(v, str) for v in build_only):
            only_line = f"ONLY = ({build_only[0]!r}, {build_only[1]!r})"
        else:
            only_line = f"ONLY = ({build_only[0]}, {build_only[1]}, {build_only[2]})"
        lines = source.splitlines()
        for index, line in enumerate(lines):
            if line.startswith("ONLY = "):
                lines[index] = only_line
                break
        else:
            raise ValueError(f"ONLY assignment not found in {script_path}")
        source = "\n".join(lines) + "\n"

    namespace: dict = {"__name__": "catalog_export", "__file__": script_path}
    exec(compile(source, script_path, "exec"), namespace)
    if slug is None:
        raise ValueError(f"slug required for {script_path}")
    invoke_build(namespace, script_path, slug, build_only)


def add_configurator_accessories(script_name: str, slug: str) -> None:
    """Open-беседки: коллекция Wall/Curtain/Net/LED для конфигуратора."""
    if not script_name.startswith("build_besedka"):
        return
    accessories_path = os.path.join(BLENDER_SCRIPTS, "build_configurator_accessories.py")
    if not os.path.isfile(accessories_path):
        print("WARN: build_configurator_accessories.py not found, skip accessories")
        return
    run_build_script(accessories_path, slug=slug)


def build_and_export(slug: str) -> str:
    meta = BUILD_MAP[slug]
    script_name = meta["buildScript"]
    script_path = os.path.join(BLENDER_SCRIPTS, script_name)
    if not os.path.isfile(script_path):
        raise FileNotFoundError(script_path)

    build_only = meta.get("buildOnly")
    os.environ["SKIP_CATALOG_RENDER"] = "1"
    os.environ["FORCE_RENDER"] = "1"
    os.environ["BUILD_SLUG"] = slug
    run_build_script(script_path, build_only, slug=slug)
    add_configurator_accessories(script_name, slug=slug)
    out_path = os.path.join(OUT_DIR, f"{slug}.glb")
    export_glb(out_path)
    return out_path


def main() -> None:
    slugs = parse_slugs(sys.argv)

    results: list[str] = []
    errors: list[str] = []
    for slug in slugs:
        try:
            path = build_and_export(slug)
            results.append(f"{slug}: {path}")
            print(f"OK {slug} -> {path}")
        except Exception as exc:  # noqa: BLE001 — batch export continues
            errors.append(f"{slug}: {exc}")
            print(f"FAIL {slug}: {exc}")

    print(f"\nExported {len(results)}/{len(slugs)}")
    if errors:
        print("Errors:")
        for line in errors:
            print(" ", line)
        sys.exit(1)


if __name__ == "__main__":
    main()
