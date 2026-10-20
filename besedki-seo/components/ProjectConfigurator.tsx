'use client';

import { useMemo, useState } from 'react';
import LeadForm from '@/components/LeadForm';
import {
  buildOptionContext,
  calculateConfiguredPrice,
  defaultProductOptionSelection,
  formatOptionPrice,
  getConfiguratorProfile,
  type ProductOptionSelection,
} from '@/lib/productOptions';

type Props = {
  projectTitle: string;
  basePrice: number;
  configuratorId?: string;
};

export default function ProjectConfigurator({ projectTitle, basePrice, configuratorId }: Props) {
  const profile = getConfiguratorProfile(configuratorId);
  const { groups, sectionTitle, sectionHint } = profile;

  const [selection, setSelection] = useState<ProductOptionSelection>(() =>
    defaultProductOptionSelection(groups),
  );

  const { total, onRequest } = useMemo(
    () => calculateConfiguredPrice(basePrice, groups, selection),
    [basePrice, groups, selection],
  );

  const context = useMemo(
    () => buildOptionContext(projectTitle, basePrice, groups, selection),
    [projectTitle, basePrice, groups, selection],
  );

  function setRadio(groupId: string, choiceId: string) {
    setSelection((prev) => ({
      ...prev,
      radio: { ...prev.radio, [groupId]: choiceId },
    }));
  }

  function toggleCheckbox(groupId: string, choiceId: string) {
    setSelection((prev) => {
      const current = prev.checkbox[groupId] ?? [];
      const next = current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return {
        ...prev,
        checkbox: { ...prev.checkbox, [groupId]: next },
      };
    });
  }

  function setQuantity(choiceId: string, qty: number) {
    setSelection((prev) => ({
      ...prev,
      quantity: { ...prev.quantity, [choiceId]: Math.max(0, qty) },
    }));
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-5" aria-label="Конфигурация и цена">
        <div>
          <h2 className="font-heading text-lg">{sectionTitle ?? 'Комплектация и опции'}</h2>
          <p className="mt-1 text-sm text-text-muted">
            Базовая цена каркаса — от {basePrice.toLocaleString('ru-RU')} ₽.
            {sectionHint ? ` ${sectionHint}` : ' Выберите модификации для расчёта.'}
          </p>
        </div>

        {groups.map((group) => (
          <fieldset key={group.id} className="space-y-2">
            <legend className="text-sm font-medium text-text">{group.title}</legend>
            <div className="space-y-2">
              {group.choices.map((choice) => {
                if (group.type === 'quantity') {
                  const qty = selection.quantity[choice.id] ?? 0;
                  const priceLabel = formatOptionPrice(choice, qty);
                  return (
                    <div
                      key={choice.id}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-DEFAULT border px-3 py-2.5 text-sm ${
                        qty > 0 ? 'border-accent bg-surface' : 'border-border'
                      }`}
                    >
                      <span className="min-w-0 flex-1 basis-full sm:basis-auto">{choice.label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Меньше: ${choice.label}`}
                          onClick={() => setQuantity(choice.id, qty - 1)}
                          disabled={qty <= 0}
                          className="flex h-11 w-11 items-center justify-center rounded-DEFAULT border border-border text-lg leading-none disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center tabular-nums">{qty}</span>
                        <button
                          type="button"
                          aria-label={`Больше: ${choice.label}`}
                          onClick={() => setQuantity(choice.id, qty + 1)}
                          className="flex h-11 w-11 items-center justify-center rounded-DEFAULT border border-border text-lg leading-none"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-full text-right text-text-muted sm:ml-auto sm:w-auto">{priceLabel}</span>
                    </div>
                  );
                }

                const priceLabel = formatOptionPrice(choice);

                if (group.type === 'radio') {
                  const checked = selection.radio[group.id] === choice.id;
                  return (
                    <label
                      key={choice.id}
                      className={`flex cursor-pointer flex-wrap items-start gap-x-3 gap-y-1 rounded-DEFAULT border px-3 py-2.5 text-sm transition-colors ${
                        checked ? 'border-accent bg-surface' : 'border-border hover:border-accent/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`option-${group.id}`}
                        checked={checked}
                        onChange={() => setRadio(group.id, choice.id)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0 flex-1">{choice.label}</span>
                      <span className="shrink-0 text-text-muted">{priceLabel}</span>
                    </label>
                  );
                }

                const checked = (selection.checkbox[group.id] ?? []).includes(choice.id);
                return (
                  <label
                    key={choice.id}
                    className={`flex cursor-pointer flex-wrap items-start gap-x-3 gap-y-1 rounded-DEFAULT border px-3 py-2.5 text-sm transition-colors ${
                      checked ? 'border-accent bg-surface' : 'border-border hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheckbox(group.id, choice.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">{choice.label}</span>
                    <span className="shrink-0 text-text-muted">{priceLabel}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="border-t border-border pt-4">
          <p className="text-xl font-semibold text-accent">
            Итого: от {total.toLocaleString('ru-RU')} ₽
          </p>
          {onRequest.length > 0 && (
            <p className="mt-1 text-sm text-text-muted">
              {onRequest.join(', ')} — цена по запросу
            </p>
          )}
        </div>
      </section>

      <LeadForm context={context} />
    </div>
  );
}
