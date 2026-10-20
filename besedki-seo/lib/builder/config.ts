import builder from '@/data/builder.json';
import type { BuilderConfig, BuilderFormat, BuilderStep, BuilderState } from '@/lib/builder/types';

export function getBuilderConfig(): BuilderConfig {
  return builder as BuilderConfig;
}

export function getBuilderSteps(format: BuilderFormat | null): BuilderStep[] {
  if (!format) return ['format'];
  if (format === 'closed') return ['format', 'model', 'extras', 'summary'];
  return ['format', 'model', 'panels', 'extras', 'summary'];
}

export function stepLabel(step: BuilderStep): string {
  const labels: Record<BuilderStep, string> = {
    format: 'Тип беседки',
    model: 'Размер',
    panels: 'Рисунок панелей',
    extras: 'Комплектация',
    summary: 'Итог',
  };
  return labels[step];
}

export function defaultBuilderState(config: BuilderConfig): BuilderState {
  return {
    format: null,
    catalogSlug: null,
    panelId: config.panels[0]?.id ?? null,
    walls: [],
    extras: { radio: {}, checkbox: {}, quantity: {} },
  };
}

export function stepIndex(steps: BuilderStep[], step: BuilderStep): number {
  return steps.indexOf(step);
}
