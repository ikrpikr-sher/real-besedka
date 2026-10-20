export type ProductOptionChoice = {
  id: string;
  label: string;
  /** Доплата к базовой цене. 0 — входит в базу. */
  priceAdd?: number;
  /** Текст вместо цены, например «по запросу». */
  priceNote?: string;
  /** Для quantity: подпись единицы, например «шт». */
  unit?: string;
};

export type ProductOptionGroup = {
  id: string;
  title: string;
  type: 'radio' | 'checkbox' | 'quantity';
  choices: ProductOptionChoice[];
  /** Для radio: id варианта по умолчанию. */
  defaultChoiceId?: string;
  /** Для checkbox: id вариантов, включённых сразу. */
  defaultCheckedIds?: string[];
};

export type ProductOptionSelection = {
  radio: Record<string, string>;
  checkbox: Record<string, string[]>;
  quantity: Record<string, number>;
};

export type ConfiguratorProfile = {
  id: string;
  groups: ProductOptionGroup[];
  /** Пояснение под ценой на странице товара. */
  baseNote?: string;
  /** Заголовок блока конфигуратора. */
  sectionTitle?: string;
  sectionHint?: string;
};

/** Выбор цвета порошкового покрытия — общий для всех калькуляторов. */
export const COLOR_OPTION_GROUP: ProductOptionGroup = {
  id: 'color',
  title: 'Цвет каркаса',
  type: 'radio',
  defaultChoiceId: 'grafit',
  choices: [
    { id: 'korichnevyy', label: 'Коричневый', priceAdd: 0 },
    { id: 'chernyy', label: 'Чёрный', priceAdd: 0 },
    { id: 'belyy', label: 'Белый', priceAdd: 0 },
    { id: 'grafit', label: 'Графит', priceAdd: 0 },
    { id: 'na-vybor', label: 'На выбор заказчика', priceNote: 'по запросу' },
  ],
};

/** Утепление и доп. опции пола — чекбоксы. */
export const COMFORT_OPTION_GROUP: ProductOptionGroup = {
  id: 'comfort',
  title: 'Утепление и комфорт',
  type: 'checkbox',
  choices: [
    { id: 'uteplenie-pola', label: 'Утепление пола', priceAdd: 20000 },
    { id: 'uteplenie-kryshi', label: 'Утепление крыши', priceAdd: 30000 },
    { id: 'teplye-poly', label: 'Тёплые полы', priceAdd: 50000 },
    { id: 'natyazhnye-potolki', label: 'Натяжные потолки', priceAdd: 60000 },
  ],
};

/** Стандартные опции для готовых моделей B-11…B-26. */
export const STANDARD_OPTION_GROUPS: ProductOptionGroup[] = [
  COLOR_OPTION_GROUP,
  {
    id: 'walls',
    title: 'Стены',
    type: 'radio',
    defaultChoiceId: 'bez-sten',
    choices: [
      { id: 'bez-sten', label: 'Без стен', priceAdd: 0 },
      { id: 'gluhaya-tortsevaya', label: 'Стена глухая торцевая', priceAdd: 30000 },
      { id: 'reznaya', label: 'Стена резная', priceAdd: 20000 },
      { id: 'osteklenie', label: 'Остекление', priceNote: 'по запросу' },
    ],
  },
  {
    id: 'walls-addons',
    title: 'Дополнительно к стенам',
    type: 'checkbox',
    choices: [
      { id: 'shtory', label: 'Шторы', priceAdd: 20000 },
      { id: 'moskitnye-setki', label: 'Москитные сетки', priceAdd: 14000 },
    ],
  },
  {
    id: 'floor',
    title: 'Пол',
    type: 'radio',
    defaultChoiceId: 'fanera',
    choices: [
      { id: 'fanera', label: 'Фанера', priceAdd: 0 },
      { id: 'dpk', label: 'Доска ДПК', priceAdd: 35000 },
      { id: 'listvennica', label: 'Дерево лиственница', priceAdd: 40000 },
      { id: 'kvarts-vinil', label: 'Кварц винил', priceAdd: 40000 },
    ],
  },
  COMFORT_OPTION_GROUP,
  {
    id: 'electrical',
    title: 'Электропроводка',
    type: 'checkbox',
    choices: [
      {
        id: 'skrytaya',
        label: 'Скрытая, с 2 розетками и распределительным щитком с автоматами',
        priceAdd: 20000,
      },
    ],
  },
  {
    id: 'lighting',
    title: 'Освещение',
    type: 'radio',
    defaultChoiceId: 'none',
    choices: [
      { id: 'none', label: 'Без освещения', priceAdd: 0 },
      { id: 'lampovoe', label: 'Ламповое', priceAdd: 10000 },
      { id: 'led-dimmer', label: 'Светодиодная лента с диммером', priceAdd: 45000 },
    ],
  },
];

/** @deprecated Используйте getConfiguratorProfile('standard').groups */
export const PRODUCT_OPTION_GROUPS = STANDARD_OPTION_GROUPS;

/** Опции конфигуратора /konfigurator — только цвет и доп. услуги. */
export const BUILDER_OPTION_GROUPS: ProductOptionGroup[] = [
  COLOR_OPTION_GROUP,
  {
    id: 'builder-extras',
    title: 'Дополнительно',
    type: 'checkbox',
    choices: [
      { id: 'shtory', label: 'Шторы', priceAdd: 20000 },
      { id: 'moskitnye-setki', label: 'Москитные сетки', priceAdd: 15000 },
      { id: 'osveshchenie', label: 'Светодиодная лента по периметру внутри', priceAdd: 20000 },
      { id: 'elektroprovodka', label: 'Электропроводка', priceAdd: 20000 },
      { id: 'natyazhnye-potolki', label: 'Натяжные потолки', priceAdd: 60000 },
    ],
  },
];

export const CONFIGURATOR_PROFILES: Record<string, ConfiguratorProfile> = {
  builder: {
    id: 'builder',
    sectionTitle: 'Комплектация',
    sectionHint: 'Цвет каркаса и дополнительные опции.',
    baseNote: 'Базовая цена — выбранный размер и тип. Дополнения суммируются.',
    groups: BUILDER_OPTION_GROUPS,
  },
  standard: {
    id: 'standard',
    groups: STANDARD_OPTION_GROUPS,
    baseNote: 'Базовая комплектация: без стен, пол — фанера. Дополнительные опции — в блоке справа.',
  },
  'grafit-start': {
    id: 'grafit-start',
    sectionTitle: 'Конструктор комплектации',
    sectionHint: 'Стены, пол и декоративные панели докупаются отдельно.',
    baseNote:
      'Базовая комплектация: металлический каркас и кровля. Стены, пол и декоративные панели докупаются отдельно.',
    groups: [
      COLOR_OPTION_GROUP,
      {
        id: 'panels-walls',
        title: 'Панели и стены',
        type: 'quantity',
        choices: [
          { id: 'panel-reznaya', label: 'Панель резная', priceAdd: 12000, unit: 'шт' },
          { id: 'wall-fanera', label: 'Стена сплошная из фанеры', priceAdd: 25000, unit: 'шт' },
          { id: 'wall-reznaya', label: 'Стена сплошная резная', priceAdd: 20000, unit: 'шт' },
        ],
      },
      {
        id: 'floor',
        title: 'Пол',
        type: 'radio',
        defaultChoiceId: 'none',
        choices: [
          { id: 'none', label: 'Без пола', priceAdd: 0 },
          { id: 'dpk', label: 'Пол из ДПК', priceAdd: 30000 },
          { id: 'fanera', label: 'Пол из влагостойкой фанеры', priceAdd: 30000 },
          { id: 'kvarts-vinil', label: 'Кварц винил', priceAdd: 40000 },
        ],
      },
      COMFORT_OPTION_GROUP,
      {
        id: 'reinforcement',
        title: 'Усиление',
        type: 'checkbox',
        choices: [
          {
            id: 'obvyazka',
            label: 'Обвязка нижнего контура для усиления конструкции',
            priceAdd: 20000,
          },
        ],
      },
    ],
  },
  'loft-beige-8x6': {
    id: 'loft-beige-8x6',
    sectionTitle: 'Комплектация и опции',
    sectionHint: 'Стекло, пол ДПК, LED, скрытая проводка и клапаны вентиляции уже в базе.',
    baseNote:
      'В базе: каркас 100×100 беж RAL 1001, остекление с трёх сторон, зад С21, пол ДПК беж (зазор 3 мм), LED в коробе с диммером, 4 цилиндра, скрытая проводка, щиток IP65, 3 розетки, 2 притока Ø125 + 2 вытяжки Ø125.',
    groups: [
      {
        id: 'color',
        title: 'Цвет каркаса',
        type: 'radio',
        defaultChoiceId: 'bezhevyy',
        choices: [
          { id: 'bezhevyy', label: 'Беж RAL 1001', priceAdd: 0 },
          { id: 'grafit', label: 'Графит RAL 7016', priceAdd: 0 },
          { id: 'korichnevyy', label: 'Коричневый', priceAdd: 0 },
          { id: 'chernyy', label: 'Чёрный', priceAdd: 0 },
          { id: 'belyy', label: 'Белый', priceAdd: 0 },
          { id: 'na-vybor', label: 'На выбор заказчика', priceNote: 'по запросу' },
        ],
      },
      {
        id: 'walls-addons',
        title: 'Дополнительно',
        type: 'checkbox',
        choices: [
          { id: 'shtory', label: 'Шторы', priceAdd: 20000 },
          { id: 'moskitnye-setki', label: 'Москитные сетки', priceAdd: 14000 },
        ],
      },
      {
        id: 'floor',
        title: 'Пол',
        type: 'radio',
        defaultChoiceId: 'dpk',
        choices: [
          { id: 'dpk', label: 'Доска ДПК беж', priceAdd: 0 },
          { id: 'listvennica', label: 'Дерево лиственница', priceAdd: 40000 },
          { id: 'kvarts-vinil', label: 'Кварц винил', priceAdd: 40000 },
        ],
      },
      COMFORT_OPTION_GROUP,
      {
        id: 'electrical',
        title: 'Электропроводка',
        type: 'checkbox',
        defaultCheckedIds: ['skrytaya'],
        choices: [
          {
            id: 'skrytaya',
            label: 'Скрытая, щиток IP65, диммер, 3 розетки (углы + двойная центр)',
            priceAdd: 0,
          },
        ],
      },
      {
        id: 'lighting',
        title: 'Освещение',
        type: 'radio',
        defaultChoiceId: 'led-dimmer',
        choices: [
          { id: 'led-dimmer', label: 'LED в коробе + 4 цилиндра + диммер', priceAdd: 0 },
        ],
      },
    ],
  },
  panorama: {
    id: 'panorama',
    sectionTitle: 'Комплектация и опции',
    baseNote:
      'Базовая комплектация: каркас, раздвижное остекление по периметру, пол ДПК, кровля. Дополнительные опции — справа.',
    groups: [
      COLOR_OPTION_GROUP,
      {
        id: 'walls-addons',
        title: 'Дополнительно',
        type: 'checkbox',
        choices: [
          { id: 'shtory', label: 'Шторы', priceAdd: 20000 },
          { id: 'moskitnye-setki', label: 'Москитные сетки', priceAdd: 14000 },
        ],
      },
      {
        id: 'floor',
        title: 'Пол',
        type: 'radio',
        defaultChoiceId: 'dpk',
        choices: [
          { id: 'dpk', label: 'Доска ДПК', priceAdd: 0 },
          { id: 'listvennica', label: 'Дерево лиственница', priceAdd: 40000 },
          { id: 'kvarts-vinil', label: 'Кварц винил', priceAdd: 40000 },
        ],
      },
      COMFORT_OPTION_GROUP,
      {
        id: 'electrical',
        title: 'Электропроводка',
        type: 'checkbox',
        choices: [
          {
            id: 'skrytaya',
            label: 'Скрытая, с 2 розетками и распределительным щитком с автоматами',
            priceAdd: 20000,
          },
        ],
      },
      {
        id: 'lighting',
        title: 'Освещение',
        type: 'radio',
        defaultChoiceId: 'none',
        choices: [
          { id: 'none', label: 'Без освещения', priceAdd: 0 },
          { id: 'lampovoe', label: 'Ламповое', priceAdd: 10000 },
          { id: 'led-dimmer', label: 'Светодиодная лента с диммером', priceAdd: 45000 },
        ],
      },
    ],
  },
};

export function getConfiguratorProfile(profileId?: string): ConfiguratorProfile {
  if (profileId && CONFIGURATOR_PROFILES[profileId]) {
    return CONFIGURATOR_PROFILES[profileId];
  }
  return CONFIGURATOR_PROFILES.standard;
}

export function defaultProductOptionSelection(groups: ProductOptionGroup[]): ProductOptionSelection {
  const radio: Record<string, string> = {};
  const checkbox: Record<string, string[]> = {};
  for (const group of groups) {
    if (group.type === 'radio' && group.defaultChoiceId) {
      radio[group.id] = group.defaultChoiceId;
    }
    if (group.type === 'checkbox' && group.defaultCheckedIds?.length) {
      checkbox[group.id] = [...group.defaultCheckedIds];
    }
  }
  return { radio, checkbox, quantity: {} };
}

function findChoice(groups: ProductOptionGroup[], groupId: string, choiceId: string): ProductOptionChoice | undefined {
  const group = groups.find((g) => g.id === groupId);
  return group?.choices.find((c) => c.id === choiceId);
}

export function formatOptionPrice(choice: ProductOptionChoice, qty = 1): string {
  if (choice.priceNote) return choice.priceNote;
  if (choice.id === 'natyazhnye-potolki' && choice.priceAdd) {
    return `от ${choice.priceAdd.toLocaleString('ru-RU')} ₽`;
  }
  if (!choice.priceAdd) return 'в базе';
  const unit = choice.unit ? ` / ${choice.unit}` : '';
  if (qty > 1) {
    return `+ ${(choice.priceAdd * qty).toLocaleString('ru-RU')} ₽ (${qty} ${choice.unit ?? 'шт'})`;
  }
  return `+ ${choice.priceAdd.toLocaleString('ru-RU')} ₽${unit}`;
}

export function calculateConfiguredPrice(
  basePrice: number,
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
): { total: number; onRequest: string[] } {
  let total = basePrice;
  const onRequest: string[] = [];

  for (const [groupId, choiceId] of Object.entries(selection.radio)) {
    const choice = findChoice(groups, groupId, choiceId);
    if (!choice) continue;
    if (choice.priceNote) onRequest.push(choice.label);
    else total += choice.priceAdd ?? 0;
  }

  for (const [groupId, choiceIds] of Object.entries(selection.checkbox)) {
    for (const choiceId of choiceIds) {
      const choice = findChoice(groups, groupId, choiceId);
      if (!choice) continue;
      if (choice.priceNote) onRequest.push(choice.label);
      else total += choice.priceAdd ?? 0;
    }
  }

  for (const [choiceId, qty] of Object.entries(selection.quantity)) {
    if (qty <= 0) continue;
    const group = groups.find((g) => g.type === 'quantity' && g.choices.some((c) => c.id === choiceId));
    if (!group) continue;
    const choice = findChoice(groups, group.id, choiceId);
    if (!choice) continue;
    if (choice.priceNote) onRequest.push(`${choice.label} × ${qty}`);
    else total += (choice.priceAdd ?? 0) * qty;
  }

  return { total, onRequest };
}

export function buildOptionContext(
  projectTitle: string,
  basePrice: number,
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
): string {
  const lines: string[] = [`Проект: ${projectTitle}`];
  const { total, onRequest } = calculateConfiguredPrice(basePrice, groups, selection);

  for (const group of groups) {
    if (group.type === 'radio') {
      const choiceId = selection.radio[group.id];
      const choice = choiceId ? findChoice(groups, group.id, choiceId) : undefined;
      if (choice) lines.push(`${group.title}: ${choice.label}`);
    } else if (group.type === 'checkbox') {
      const ids = selection.checkbox[group.id] ?? [];
      if (ids.length === 0) continue;
      const labels = ids
        .map((id) => findChoice(groups, group.id, id)?.label)
        .filter(Boolean)
        .join(', ');
      if (labels) lines.push(`${group.title}: ${labels}`);
    } else if (group.type === 'quantity') {
      const parts = group.choices
        .map((choice) => {
          const qty = selection.quantity[choice.id] ?? 0;
          if (qty <= 0) return null;
          return `${choice.label} × ${qty}`;
        })
        .filter(Boolean);
      if (parts.length > 0) lines.push(`${group.title}: ${parts.join(', ')}`);
    }
  }

  lines.push(`Расчётная цена: от ${total.toLocaleString('ru-RU')} ₽`);
  if (onRequest.length > 0) {
    lines.push(`По запросу: ${onRequest.join(', ')}`);
  }

  return lines.join('\n');
}
