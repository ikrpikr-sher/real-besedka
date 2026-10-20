import type { BuilderFormat, BuilderState, BuilderVisualOptions } from '@/lib/builder/types';

export function buildVisualOptions(
  state: BuilderState,
  startSlug: string,
): BuilderVisualOptions {
  const extras = state.extras.checkbox['builder-extras'] ?? [];
  const frameColorId = state.extras.radio.color ?? 'grafit';
  const isStart = state.catalogSlug === startSlug;

  return {
    frameColorId,
    hideDecorPanels: isStart,
    format: state.format ?? 'open',
    walls: state.walls,
    curtains: extras.includes('shtory'),
    mosquitoNets: extras.includes('moskitnye-setki'),
    lighting: extras.includes('osveshchenie'),
  };
}
