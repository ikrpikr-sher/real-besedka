import type {
  BuilderConfig,
  BuilderPreview,
  BuilderState,
  CatalogItemLite,
} from '@/lib/builder/types';
import { getProductModel3dUrlFromSlug } from '@/lib/builder/catalogModels';
import {
  BUILDER_OPTION_GROUPS,
  calculateConfiguredPrice,
  defaultProductOptionSelection,
  type ProductOptionSelection,
} from '@/lib/productOptions';

function findItem(items: CatalogItemLite[], slug: string | null): CatalogItemLite | undefined {
  if (!slug) return undefined;
  return items.find((item) => item.slug === slug);
}

function findPanel(config: BuilderConfig, panelId: string | null) {
  if (!panelId) return undefined;
  return config.panels.find((panel) => panel.id === panelId);
}

export function initBuilderExtras(): ProductOptionSelection {
  return defaultProductOptionSelection(BUILDER_OPTION_GROUPS);
}

/** @deprecated Используйте initBuilderExtras в конфигураторе. */
export function initExtrasForItem(_item: CatalogItemLite | undefined): ProductOptionSelection {
  return initBuilderExtras();
}

export function resolvePreviewItem(
  state: BuilderState,
  config: BuilderConfig,
  openItems: CatalogItemLite[],
  closedItems: CatalogItemLite[],
): CatalogItemLite | undefined {
  const catalog = state.format === 'closed' ? closedItems : openItems;
  const base = findItem(catalog, state.catalogSlug);

  if (state.format === 'closed' || !state.panelId) return base;

  const panel = findPanel(config, state.panelId);
  if (!panel) return base;

  const panelItem = findItem(openItems, panel.catalogSlug);
  return panelItem ?? base;
}

export function resolvePreview(
  state: BuilderState,
  config: BuilderConfig,
  openItems: CatalogItemLite[],
  closedItems: CatalogItemLite[],
): BuilderPreview {
  const catalog = state.format === 'closed' ? closedItems : openItems;
  const base = findItem(catalog, state.catalogSlug);
  const previewItem = resolvePreviewItem(state, config, openItems, closedItems) ?? base;
  const panel = findPanel(config, state.panelId);

  const model3d =
    previewItem?.model3d ??
    (previewItem ? getProductModel3dUrlFromSlug(previewItem.slug) : undefined) ??
    (base ? getProductModel3dUrlFromSlug(base.slug) : undefined);

  const { total, onRequest } = calculateConfiguredPrice(
    base?.priceFrom ?? 0,
    BUILDER_OPTION_GROUPS,
    state.extras,
  );

  const panelLabel = panel?.label;
  const formatLabel = state.format === 'closed' ? 'С остеклением' : 'Открытая';

  return {
    title: base?.title ?? config.title,
    subtitle: [formatLabel, base?.size, panelLabel ? `Панели: ${panelLabel}` : null]
      .filter(Boolean)
      .join(' · '),
    images: base?.images ?? [],
    model3d,
    priceFrom: base?.priceFrom ?? 0,
    total,
    onRequest,
  };
}

export function buildLeadContext(
  state: BuilderState,
  config: BuilderConfig,
  openItems: CatalogItemLite[],
  closedItems: CatalogItemLite[],
  preview: BuilderPreview,
): string {
  const catalog = state.format === 'closed' ? closedItems : openItems;
  const base = findItem(catalog, state.catalogSlug);
  const panel = findPanel(config, state.panelId);
  const lines = ['Конфигуратор беседки'];

  lines.push(state.format === 'closed' ? 'Тип: с остеклением' : 'Тип: открытая беседка');
  if (base) lines.push(`Размер: ${base.size} (${base.title})`);
  if (panel && state.format === 'open') lines.push(`Рисунок панелей: ${panel.label}`);
  if (state.walls.length > 0 && state.format === 'open') {
    const wallLabels: Record<string, string> = {
      S: 'передняя',
      N: 'задняя',
      W: 'левая',
      E: 'правая',
    };
    lines.push(
      `Стены: ${state.walls.map((w) => wallLabels[w] ?? w).join(', ')}`,
    );
  }

  for (const group of BUILDER_OPTION_GROUPS) {
    if (group.type === 'radio') {
      const choiceId = state.extras.radio[group.id];
      const choice = group.choices.find((c) => c.id === choiceId);
      if (choice) lines.push(`${group.title}: ${choice.label}`);
    } else if (group.type === 'checkbox') {
      const ids = state.extras.checkbox[group.id] ?? [];
      if (ids.length === 0) continue;
      const labels = ids
        .map((id) => group.choices.find((c) => c.id === id)?.label)
        .filter(Boolean)
        .join(', ');
      if (labels) lines.push(`${group.title}: ${labels}`);
    }
  }

  lines.push(`Расчётная цена: от ${preview.total.toLocaleString('ru-RU')} ₽`);
  if (preview.onRequest.length > 0) {
    lines.push(`По запросу: ${preview.onRequest.join(', ')}`);
  }

  return lines.join('\n');
}
