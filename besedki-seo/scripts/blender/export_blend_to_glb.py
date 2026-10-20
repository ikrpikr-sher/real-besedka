#!/usr/bin/env python3
"""Экспорт открытого .blend в GLB (для загрузки через админку)."""
from __future__ import annotations

import importlib.util
import os
import sys

import bpy

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("gltf_materials", os.path.join(SCRIPT_DIR, "gltf_materials.py"))
_gltf = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_gltf)


def main() -> None:
    if "--" not in sys.argv:
        raise SystemExit("Usage: blender --background file.blend --python export_blend_to_glb.py -- out.glb")
    out_path = sys.argv[sys.argv.index("--") + 1]
    mesh_objects = _gltf.prepare_scene_for_export()
    if not mesh_objects:
        raise RuntimeError("В файле нет mesh-объектов для экспорта")
    _gltf.export_glb(out_path, mesh_objects)
    print(f"OK -> {out_path}")


if __name__ == "__main__":
    main()
