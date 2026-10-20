import type { ModelViewerElement } from '@google/model-viewer';
import { $scene } from '@google/model-viewer/lib/model-viewer-base.js';
import type { Object3D } from 'three';
import { hexToLinearRgb, FRAME_COLOR_HEX } from '@/lib/builder/frameColors';
import type { BuilderWallSide, BuilderVisualOptions } from '@/lib/builder/types';

const OVERLAY_GROUP = 'ConfiguratorOverlays';

/** Имена GLB-объектов из blender/docs/KONFIGURATOR_ACCESSORIES_TZ.md */
const ACCESSORY_NAMES = {
  walls: (side: BuilderWallSide) => `Wall_${side}`,
  curtains: (side: BuilderWallSide) => `Curtain_${side}`,
  nets: (side: BuilderWallSide) => `Net_${side}`,
  led: 'LED_Strip',
} as const;

const ALL_SIDES: BuilderWallSide[] = ['S', 'N', 'W', 'E'];

type ModelSceneInternal = {
  target: Object3D;
};

export async function waitForModelViewer(viewer: ModelViewerElement): Promise<void> {
  await customElements.whenDefined('model-viewer');
  await viewer.updateComplete;
  if (!viewer.loaded) {
    await new Promise<void>((resolve) => viewer.addEventListener('load', () => resolve(), { once: true }));
  }
}

export function getModelRoot(viewer: ModelViewerElement): Object3D {
  const modelScene = (viewer as unknown as Record<symbol, ModelSceneInternal>)[$scene];
  return modelScene.target;
}

function findByName(root: Object3D, name: string): Object3D | undefined {
  let found: Object3D | undefined;
  root.traverse((obj) => {
    if (obj.name === name) found = obj;
  });
  return found;
}

function modelHasGlbAccessories(root: Object3D): boolean {
  return Boolean(
    findByName(root, ACCESSORY_NAMES.walls('S')) ||
      findByName(root, ACCESSORY_NAMES.led),
  );
}

/** Удаляет старые procedural-оверлеи (если остались от прошлой версии). */
function removeLegacyOverlays(root: Object3D) {
  const group = root.getObjectByName(OVERLAY_GROUP);
  group?.parent?.remove(group);
}

function setNamedVisible(root: Object3D, name: string, visible: boolean) {
  const obj = findByName(root, name);
  if (obj) obj.visible = visible;
}

function hideAllGlbAccessories(root: Object3D) {
  for (const side of ALL_SIDES) {
    setNamedVisible(root, ACCESSORY_NAMES.walls(side), false);
    setNamedVisible(root, ACCESSORY_NAMES.curtains(side), false);
    setNamedVisible(root, ACCESSORY_NAMES.nets(side), false);
  }
  setNamedVisible(root, ACCESSORY_NAMES.led, false);
}

function applyGlbAccessories(root: Object3D, options: BuilderVisualOptions) {
  hideAllGlbAccessories(root);

  if (options.format === 'open') {
    for (const side of options.walls) {
      setNamedVisible(root, ACCESSORY_NAMES.walls(side), true);
    }
  }

  const openSides = ALL_SIDES.filter((side) => !options.walls.includes(side));

  if (options.curtains) {
    for (const side of openSides) {
      setNamedVisible(root, ACCESSORY_NAMES.curtains(side), true);
    }
  }

  if (options.mosquitoNets) {
    for (const side of openSides) {
      setNamedVisible(root, ACCESSORY_NAMES.nets(side), true);
    }
  }

  if (options.lighting) {
    setNamedVisible(root, ACCESSORY_NAMES.led, true);
  }
}

function applyFrameColor(viewer: ModelViewerElement, colorId: string) {
  const hex = FRAME_COLOR_HEX[colorId] ?? FRAME_COLOR_HEX.grafit;
  const factor = hexToLinearRgb(hex);
  for (const material of viewer.model?.materials ?? []) {
    const name = material.name.toLowerCase();
    if (
      name.includes('steel') ||
      name.includes('anthracite') ||
      name.includes('roof') ||
      name.includes('bolt')
    ) {
      material.pbrMetallicRoughness.setBaseColorFactor(factor);
    }
  }
}

function setDecorPanelsVisible(root: Object3D, visible: boolean) {
  root.traverse((obj) => {
    if (!obj.name || !/^Panel_/i.test(obj.name)) return;
    if (/Bolt|Post|Rail/i.test(obj.name)) return;
    obj.visible = visible;
  });
}

export function applyConfiguratorVisuals(
  viewer: ModelViewerElement,
  options: BuilderVisualOptions,
): void {
  const root = getModelRoot(viewer);
  removeLegacyOverlays(root);
  applyFrameColor(viewer, options.frameColorId);
  setDecorPanelsVisible(root, !options.hideDecorPanels);

  if (modelHasGlbAccessories(root)) {
    applyGlbAccessories(root, options);
  }
}

export function hideConfiguratorAccessories(viewer: ModelViewerElement): void {
  try {
    hideAllGlbAccessories(getModelRoot(viewer));
  } catch {
    /* model not loaded yet */
  }
}

export function modelSupportsGlbAccessories(viewer: ModelViewerElement): boolean {
  try {
    return modelHasGlbAccessories(getModelRoot(viewer));
  } catch {
    return false;
  }
}
