'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import LeadForm from '@/components/LeadForm';
import {
  buildLeadContext,
  buildVisualOptions,
  initBuilderExtras,
  resolvePreview,
  type BuilderConfig,
  type BuilderFormat,
  type BuilderState,
  type BuilderWallSide,
  type CatalogItemLite,
} from '@/lib/builder';
import {
  findItemBySize,
  getOpenSizeOptions,
  getSizeOptions,
  sizeOptionLabel,
} from '@/lib/builder/sizes';
import {
  BUILDER_OPTION_GROUPS,
  formatOptionPrice,
  type ProductOptionGroup,
} from '@/lib/productOptions';

const ConfiguratorModelViewer = dynamic(() => import('@/components/ConfiguratorModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[320px] items-center justify-center rounded-DEFAULT border border-border bg-surface text-sm text-text-muted">
      Загружаем 3D…
    </div>
  ),
});

type Props = {
  config: BuilderConfig;
  openItems: CatalogItemLite[];
  closedItems: CatalogItemLite[];
};

const TYPE_OPTIONS: { id: BuilderFormat; label: string }[] = [
  { id: 'open', label: 'Открытая' },
  { id: 'closed', label: 'С остеклением' },
];

const WALL_OPTIONS: { id: BuilderWallSide; label: string }[] = [
  { id: 'S', label: 'Передняя (вход)' },
  { id: 'N', label: 'Задняя' },
  { id: 'W', label: 'Левая' },
  { id: 'E', label: 'Правая' },
];

const selectClassName =
  'w-full rounded-DEFAULT border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}</label>
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
      {children}
    </div>
  );
}

function ExtrasEditor({
  groups,
  extras,
  onChange,
}: {
  groups: ProductOptionGroup[];
  extras: BuilderState['extras'];
  onChange: (extras: BuilderState['extras']) => void;
}) {
  function setRadio(groupId: string, choiceId: string) {
    onChange({ ...extras, radio: { ...extras.radio, [groupId]: choiceId } });
  }

  function toggleCheckbox(groupId: string, choiceId: string) {
    const current = extras.checkbox[groupId] ?? [];
    const next = current.includes(choiceId)
      ? current.filter((id) => id !== choiceId)
      : [...current, choiceId];
    onChange({ ...extras, checkbox: { ...extras.checkbox, [groupId]: next } });
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <fieldset key={group.id} className="space-y-2">
          <legend className="text-sm font-medium text-text">{group.title}</legend>
          <div className="space-y-1.5">
            {group.choices.map((choice) => {
              if (group.type === 'radio') {
                const checked = extras.radio[group.id] === choice.id;
                return (
                  <label
                    key={choice.id}
                    className={`flex cursor-pointer flex-wrap items-start gap-x-2 gap-y-1 rounded-DEFAULT border px-3 py-2.5 text-sm ${
                      checked ? 'border-accent bg-surface' : 'border-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`builder-${group.id}`}
                      checked={checked}
                      onChange={() => setRadio(group.id, choice.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">{choice.label}</span>
                    <span className="text-xs text-text-muted">{formatOptionPrice(choice)}</span>
                  </label>
                );
              }

              const checked = (extras.checkbox[group.id] ?? []).includes(choice.id);
              return (
                <label
                  key={choice.id}
                  className={`flex cursor-pointer flex-wrap items-start gap-x-2 gap-y-1 rounded-DEFAULT border px-3 py-2.5 text-sm ${
                    checked ? 'border-accent bg-surface' : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheckbox(group.id, choice.id)}
                    className="mt-0.5"
                  />
                  <span className="min-w-0 flex-1">{choice.label}</span>
                  <span className="text-xs text-text-muted">
                    {choice.id === 'moskitnye-setki'
                      ? `${choice.priceAdd?.toLocaleString('ru-RU')} ₽`
                      : choice.priceAdd
                        ? `от ${choice.priceAdd.toLocaleString('ru-RU')} ₽`
                        : formatOptionPrice(choice)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default function BuilderClient({ config, openItems, closedItems }: Props) {
  const startSlug = config.modularSlug;
  const initialSlug = startSlug;

  const [state, setState] = useState<BuilderState>({
    format: 'open',
    catalogSlug: initialSlug,
    panelId: config.panels[0]?.id ?? null,
    walls: [],
    extras: initBuilderExtras(),
  });

  const sizeOptions = useMemo(() => {
    if (state.format === 'closed') return getSizeOptions(closedItems);
    return getOpenSizeOptions(openItems, startSlug);
  }, [state.format, openItems, closedItems, startSlug]);

  const selectedItem = [...openItems, ...closedItems].find((item) => item.slug === state.catalogSlug);
  const selectedSize = selectedItem?.size ?? sizeOptions[0]?.size ?? '';

  const preview = useMemo(
    () => resolvePreview(state, config, openItems, closedItems),
    [state, config, openItems, closedItems],
  );

  const visualOptions = useMemo(
    () => buildVisualOptions(state, startSlug),
    [state, startSlug],
  );

  const leadContext = buildLeadContext(state, config, openItems, closedItems, preview);
  const modelKey = `${preview.model3d ?? 'none'}-${JSON.stringify(visualOptions)}`;

  function changeType(format: BuilderFormat) {
    const sizes =
      format === 'closed' ? getSizeOptions(closedItems) : getOpenSizeOptions(openItems, startSlug);
    const keepSize = sizes.some((o) => o.size === selectedSize);
    const nextOpt = keepSize ? sizes.find((o) => o.size === selectedSize) : sizes[0];

    setState((prev) => ({
      ...prev,
      format,
      catalogSlug: nextOpt?.slug ?? startSlug,
      walls: format === 'open' ? prev.walls : [],
      panelId: format === 'open' ? prev.panelId ?? config.panels[0]?.id ?? null : null,
    }));
  }

  function changeSize(size: string) {
    const opt = sizeOptions.find((o) => o.size === size);
    if (opt) {
      setState((prev) => ({ ...prev, catalogSlug: opt.slug }));
      return;
    }
    const item = findItemBySize(state.format === 'closed' ? closedItems : openItems, size);
    if (item) setState((prev) => ({ ...prev, catalogSlug: item.slug }));
  }

  function selectPanel(panelId: string) {
    setState((prev) => ({ ...prev, panelId }));
  }

  function toggleWall(side: BuilderWallSide) {
    setState((prev) => ({
      ...prev,
      walls: prev.walls.includes(side)
        ? prev.walls.filter((w) => w !== side)
        : [...prev.walls, side],
    }));
  }

  const showPanels = state.format === 'open' && state.catalogSlug !== startSlug;
  const showWalls = state.format === 'open';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-8">
      <div className="card space-y-5 p-4 sm:p-5">
        <Field label="Размер" hint="«Старт» — пустой каркас без декоративных панелей">
          <select
            className={selectClassName}
            value={selectedSize}
            onChange={(e) => changeSize(e.target.value)}
          >
            {sizeOptions.map((opt) => (
              <option key={opt.slug} value={opt.size}>
                {sizeOptionLabel(opt)}
              </option>
            ))}
          </select>
        </Field>

        {state.format === 'open' && state.catalogSlug === startSlug ? (
          <p className="text-xs text-text-muted">
            Режим «Старт» — пустой каркас без декоративных панелей. Выберите другой размер, чтобы
            подобрать рисунок.
          </p>
        ) : null}

        <Field label="Тип беседки">
          <select
            className={selectClassName}
            value={state.format ?? 'open'}
            onChange={(e) => changeType(e.target.value as BuilderFormat)}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        {showPanels ? (
          <Field label="Рисунок панелей" hint="Узор резки стали 3 мм — 3D обновится сразу">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {config.panels.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => selectPanel(panel.id)}
                  className={`min-h-[44px] overflow-hidden rounded-DEFAULT border text-xs transition-colors ${
                    state.panelId === panel.id
                      ? 'border-accent ring-1 ring-accent'
                      : 'border-border hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-center bg-white p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panel.previewImage}
                      alt=""
                      className="h-8 w-full object-contain sm:h-7"
                      loading="lazy"
                    />
                  </div>
                  <p className="border-t border-border px-1 py-1 text-center text-[11px] leading-tight sm:text-xs">
                    {panel.label}
                  </p>
                </button>
              ))}
            </div>
          </Field>
        ) : null}

        {showWalls ? (
          <Field label="Стены" hint="Глухие стенки из фанеры — отображаются в 3D">
            <div className="grid grid-cols-2 gap-1.5">
              {WALL_OPTIONS.map((wall) => (
                <label
                  key={wall.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-DEFAULT border px-3 py-2 text-sm ${
                    state.walls.includes(wall.id)
                      ? 'border-accent bg-surface'
                      : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={state.walls.includes(wall.id)}
                    onChange={() => toggleWall(wall.id)}
                  />
                  {wall.label}
                </label>
              ))}
            </div>
          </Field>
        ) : null}

        <ExtrasEditor
          groups={BUILDER_OPTION_GROUPS}
          extras={state.extras}
          onChange={(extras) => setState((prev) => ({ ...prev, extras }))}
        />

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-medium text-text">{config.resultCta.title}</p>
          <p className="mb-3 text-xs text-text-muted">{config.resultCta.text}</p>
          <LeadForm context={leadContext} />
        </div>
      </div>

      <div className="lg:sticky lg:top-20">
        <div className="card space-y-3 p-4">
          <div>
            <p className="text-xs text-text-muted">{preview.subtitle}</p>
            <h2 className="font-heading text-lg leading-snug">{preview.title}</h2>
          </div>

          {preview.model3d ? (
            <ConfiguratorModelViewer
              key={modelKey}
              src={preview.model3d}
              alt={`3D — ${preview.title}`}
              visualOptions={visualOptions}
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-DEFAULT border border-border bg-surface text-sm text-text-muted">
              3D-модель для этой конфигурации скоро появится
            </div>
          )}

          <div className="rounded-DEFAULT bg-surface p-3">
            <p className="text-2xl font-semibold text-accent">
              от {preview.total.toLocaleString('ru-RU')} ₽
            </p>
            {preview.onRequest.length > 0 ? (
              <p className="mt-1 text-xs text-text-muted">
                {preview.onRequest.join(', ')} — по запросу
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
