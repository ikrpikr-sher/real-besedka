"""Общие функции подготовки материалов и сцены для экспорта GLB."""
from __future__ import annotations

import bpy
from mathutils import Vector

EXCLUDE_OBJECT_NAMES = {"Ground", "Camera", "Light", "Fill"}
EXCLUDE_COLLECTION_NAMES = {"Besedka_Env"}

# RAL 7016 Anthracite grey — #383E42 (sRGB)
RAL_7016 = (56 / 255, 62 / 255, 66 / 255, 1.0)
STEEL_COLOR = RAL_7016
ROOF_COLOR = RAL_7016
BOLT_COLOR = (0.18, 0.20, 0.22, 1.0)
DPK_COLOR = (0.58, 0.56, 0.52, 1.0)


def find_image_node(material: bpy.types.Material) -> bpy.types.ShaderNodeTexImage | None:
    if not material.use_nodes:
        return None
    for node in material.node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image:
            return node
    return None


def normalize_panel_image_for_gltf(img: bpy.types.Image) -> None:
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
    nt.links.new(tex.outputs["Alpha"], invert.inputs[1])
    nt.links.new(invert.outputs["Value"], bsdf.inputs["Alpha"])
    nt.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

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


def object_in_excluded_collection(obj: bpy.types.Object) -> bool:
    for col in obj.users_collection:
        if col.name in EXCLUDE_COLLECTION_NAMES:
            return True
    return False


def prepare_scene_for_export() -> list[bpy.types.Object]:
    for obj in list(bpy.data.objects):
        if (
            obj.name in EXCLUDE_OBJECT_NAMES
            or obj.name.startswith("Ground")
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
        mins = Vector((float("inf"), float("inf"), float("inf")))
        maxs = Vector((float("-inf"), float("-inf"), float("-inf")))
        for obj in mesh_objects:
            for corner in obj.bound_box:
                world = obj.matrix_world @ Vector(corner)
                mins.x = min(mins.x, world.x)
                mins.y = min(mins.y, world.y)
                mins.z = min(mins.z, world.z)
                maxs.x = max(maxs.x, world.x)
                maxs.y = max(maxs.y, world.y)
                maxs.z = max(maxs.z, world.z)
        offset = Vector((-(mins.x + maxs.x) / 2, -(mins.y + maxs.y) / 2, -mins.z))
        for obj in mesh_objects:
            obj.matrix_world.translation += offset

    prepare_materials_for_gltf()
    return mesh_objects


def export_glb(filepath: str, mesh_objects: list[bpy.types.Object] | None = None) -> None:
    if mesh_objects is None:
        mesh_objects = [obj for obj in bpy.data.objects if obj.type == "MESH"]

    bpy.ops.object.select_all(action="DESELECT")
    for obj in mesh_objects:
        obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_yup=True,
    )
