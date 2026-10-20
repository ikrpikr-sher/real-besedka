import type { CatalogItem } from '@/lib/content';

export type CatalogSpec = { label: string; value: string };

/** Единые для всего каталога (тех. характеристики + карточка в списке). */
export const CATALOG_MOUNTING = 'на фундамент или винтовые сваи';
export const CATALOG_FLOOR_BASE =
  'Влагостойкая нескользящая фанера в базовой комплектации (ДПК — опция).';
export const CATALOG_FRAME_FINISH =
  'Все каркасы проходят пескоструйную обработку и имеют порошковое окрашивание с использованием цинкосодержащего грунта.';
export const CATALOG_LEAD_TIME = 'от 7 дней';
export const CATALOG_SERVICE_LIFE = 'более 10 лет';

export const CATALOG_COMMON_SPECS: CatalogSpec[] = [
  { label: 'Пол', value: CATALOG_FLOOR_BASE },
  { label: 'Монтаж', value: CATALOG_MOUNTING },
  { label: 'Каркас', value: CATALOG_FRAME_FINISH },
  { label: 'Срок изготовления', value: CATALOG_LEAD_TIME },
  { label: 'Срок службы', value: CATALOG_SERVICE_LIFE },
];

/** Убирает сроки из текста описания (они выводятся отдельно в характеристиках). */
export function stripCatalogTimingFromDescription(description: string): string {
  return description
    .trim()
    .replace(/\s*Срок\s+изготовления[^.]*\.?/gi, '')
    .replace(/\s*Срок\s+службы[^.]*\.?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
}

type SpecSource = {
  facadeM: number;
  depthM: number;
  ridgeM: number;
  roofPitchDeg: number;
  overhangCm: number;
  podiumCm: number;
  panelHeightM?: number;
  panels?: string;
  postProfileMm?: string;
};

function fmtM(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} м`;
}

function buildSpecs(source: SpecSource): CatalogSpec[] {
  const items: CatalogSpec[] = [
    { label: 'Длина (фасад, открытый вход)', value: fmtM(source.facadeM) },
    { label: 'Глубина', value: fmtM(source.depthM) },
    { label: 'Высота по коньку', value: fmtM(source.ridgeM) },
    { label: 'Уклон крыши', value: `${source.roofPitchDeg}°` },
    { label: 'Свес', value: `${source.overhangCm} см` },
    { label: 'Подиум / пол', value: `${source.podiumCm} см` },
  ];

  if (source.panels) {
    const height = source.panelHeightM ? ` — высота ${fmtM(source.panelHeightM)}` : '';
    items.push({ label: 'Панели', value: `${source.panels}${height}` });
  }

  if (source.postProfileMm) {
    items.push({ label: 'Профиль стоек', value: `${source.postProfileMm} мм` });
  }

  return items;
}

/** Технические параметры из 3D-моделей (build_besedka_*.py). */
const OPEN_BESEDKA_SPECS: Record<string, CatalogSpec[]> = {
  'b-10': buildSpecs({
    facadeM: 2.0,
    depthM: 2.0,
    ridgeM: 2.4,
    roofPitchDeg: 22,
    overhangCm: 16,
    podiumCm: 15,
    panelHeightM: 0.8,
    panels: 'Опционально в конфигураторе (узор «олени»)',
    postProfileMm: '80×80',
  }),
  'b-11': buildSpecs({
    facadeM: 4.0,
    depthM: 4.0,
    ridgeM: 3.0,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Богатыри, дракон, орнамент (сталь 3 мм, ЧПУ)',
    postProfileMm: '80×80',
  }),
  'b-12': buildSpecs({
    facadeM: 3.0,
    depthM: 3.0,
    ridgeM: 2.7,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Медведи (сталь 3 мм, ЧПУ)',
    postProfileMm: '80×80',
  }),
  'b-13': buildSpecs({
    facadeM: 4.0,
    depthM: 3.0,
    ridgeM: 3.0,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Лоси — лес, семья, зов (сталь 3 мм, ЧПУ)',
    postProfileMm: '80×80',
  }),
  'b-14': buildSpecs({
    facadeM: 6.0,
    depthM: 3.0,
    ridgeM: 3.0,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Рыцари — отъезд, путь, битва, победа (сталь 3 мм, ЧПУ)',
    postProfileMm: '80×80',
  }),
  'b-15': buildSpecs({
    facadeM: 4.0,
    depthM: 3.0,
    ridgeM: 3.0,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Лоси — лес, семья, зов (сталь 3 мм, ЧПУ)',
    postProfileMm: '80×80',
  }),
  'b-16': buildSpecs({
    facadeM: 5.0,
    depthM: 4.0,
    ridgeM: 3.0,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Лесная жизнь — лес, орёл, птицы, горы, кабаны, козы (сталь 3 мм, ЧПУ)',
    postProfileMm: '80×80',
  }),
  'b-18': buildSpecs({
    facadeM: 2.5,
    depthM: 2.5,
    ridgeM: 2.5,
    roofPitchDeg: 22,
    overhangCm: 16,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Лофт-паутина, сталь 3 мм ЧПУ. Фасад открыт',
    postProfileMm: '80×80×3',
  }),
  'b-19': buildSpecs({
    facadeM: 2.0,
    depthM: 3.0,
    ridgeM: 2.5,
    roofPitchDeg: 22,
    overhangCm: 16,
    podiumCm: 15,
    panelHeightM: 1.0,
    panels: 'Лофт-паутина, сталь 3 мм ЧПУ. Фасад открыт',
    postProfileMm: '80×80×3',
  }),
  'b-53': [
    { label: 'Длина фасада', value: '3,0 м' },
    { label: 'Глубина', value: '4,0 м' },
    { label: 'Высота по коньку', value: '3,0 м' },
    { label: 'Стены', value: 'Фасад 3 створки и лево 4 створки — стекло; зад и право — С8 снаружи, WPC 8030 внутри' },
    { label: 'Профиль стоек', value: '80×80×3 мм' },
  ],
  'b-51': [
    { label: 'Форма', value: 'Правильный шестигранник' },
    { label: 'Диаметр (грань–грань)', value: '2,5 м' },
    { label: 'Диаметр (вершина–вершина)', value: '2,9 м' },
    { label: 'Высота по коньку', value: '2,5 м' },
    { label: 'Уклон крыши', value: '22°' },
    { label: 'Свес', value: '16 см' },
    { label: 'Подиум / пол', value: '15 см' },
    { label: 'Панели', value: 'Лофт-паутина на 5 гранях — высота 1,0 м. Фасад открыт' },
    { label: 'Профиль стоек', value: '80×80×3 мм' },
  ],
  'b-52': [
    { label: 'Форма', value: 'Правильный шестигранник' },
    { label: 'Диаметр (вершина–вершина)', value: '3,0 м' },
    { label: 'Диаметр (грань–грань)', value: '2,6 м' },
    { label: 'Высота по коньку', value: '2,5 м' },
    { label: 'Уклон крыши', value: '22°' },
    { label: 'Свес', value: '16 см' },
    { label: 'Подиум / пол', value: '15 см' },
    { label: 'Панели', value: 'Лофт-паутина на 5 гранях — высота 1,0 м. Фасад открыт' },
    { label: 'Профиль стоек', value: '80×80×3 мм' },
  ],
  'b-41': buildOpenPanel2mSpecs(3.0, 3.0, 2.5, 'Дамаск'),
  'b-42': buildOpenPanel2mSpecs(3.0, 4.0, 2.5, 'Александрия'),
  'b-43': buildOpenPanel2mSpecs(4.0, 4.0, 2.7, 'Вавилон'),
  'b-44': buildOpenPanel2mSpecs(5.0, 4.0, 3.0, 'Средняя Азия'),
  'b-45': buildOpenPanel2mSpecs(5.0, 5.0, 3.0, 'Древняя Русь'),
  'b-46': buildOpenPanel2mSpecs(6.0, 3.0, 3.0, 'Кавказ'),
  'b-47': buildOpenPanel2mSpecs(6.0, 4.0, 3.0, 'Дамаск'),
  'b-48': buildOpenPanel2mSpecs(6.0, 5.0, 3.0, 'Александрия'),
  'b-49': buildOpenPanel2mSpecs(8.0, 4.0, 3.0, 'Вавилон'),
  'b-50': buildOpenPanel2mSpecs(8.0, 5.0, 3.0, 'Древняя Русь'),
};

function buildOpenPanel2mSpecs(facadeM: number, depthM: number, ridgeM: number, art: string): CatalogSpec[] {
  return buildSpecs({
    facadeM,
    depthM,
    ridgeM,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: 2.0,
    panels: `Лазер 3 мм на задней, левой и правой стенах — ${art}. Фасад открыт`,
    postProfileMm: '80×80×3',
  });
}

function glazingModulesText(facadeM: number, depthM: number): string {
  const modulesL = Math.round(facadeM);
  const modulesW = Math.round(depthM);
  if (Math.abs(facadeM - depthM) < 0.01) {
    return `по ${modulesL} на каждой из 4 сторон`;
  }
  return `на сторонах ${fmtM(facadeM)} — по ${modulesL}, на ${fmtM(depthM)} — по ${modulesW}`;
}

function buildGlazedSpecs(facadeM: number, depthM: number, ridgeM: number): CatalogSpec[] {
  return [
    { label: 'Длина (фасад)', value: fmtM(facadeM) },
    { label: 'Глубина', value: fmtM(depthM) },
    { label: 'Высота по коньку', value: fmtM(ridgeM) },
    { label: 'Высота стен', value: '2,0 м' },
    { label: 'Остекление', value: `Раздвижные стеклопакеты по 1 м (${glazingModulesText(facadeM, depthM)})` },
    { label: 'Кровля', value: 'Металлочерепица S-волна над графитовой фанерой' },
    { label: 'Свес', value: '18 см' },
    { label: 'Подиум / пол', value: '15 см, влагостойкая нескользящая фанера (ДПК — опция)' },
    { label: 'Профиль стоек', value: '80×80×3 мм' },
  ];
}

function buildGlazedPanelSpecs(facadeM: number, depthM: number, ridgeM: number, art: string): CatalogSpec[] {
  return [
    ...buildGlazedSpecs(facadeM, depthM, ridgeM),
    {
      label: 'Панели',
      value: `Лазер 3 мм, высота 2,0 м, снаружи стекла на задней и левой стенах — ${art}`,
    },
  ];
}

/** Технические параметры из build_glazed_besedka.py. */
const GLAZED_BESEDKA_SPECS: Record<string, CatalogSpec[]> = {
  'b-21': buildGlazedSpecs(3.0, 3.0, 2.5),
  'b-22': buildGlazedSpecs(3.0, 4.0, 2.5),
  'b-23': buildGlazedSpecs(4.0, 4.0, 2.7),
  'b-24': buildGlazedSpecs(5.0, 4.0, 3.0),
  'b-25': buildGlazedSpecs(5.0, 5.0, 3.0),
  'b-26': buildGlazedSpecs(6.0, 3.0, 3.0),
  'b-27': buildGlazedSpecs(6.0, 4.0, 3.0),
  'b-28': buildGlazedSpecs(6.0, 5.0, 3.0),
  'b-29': buildGlazedSpecs(8.0, 4.0, 3.0),
  'b-30': buildGlazedSpecs(8.0, 5.0, 3.0),
  'b-31': buildGlazedPanelSpecs(3.0, 3.0, 2.5, 'Дамаск'),
  'b-32': buildGlazedPanelSpecs(3.0, 4.0, 2.5, 'Александрия'),
  'b-33': buildGlazedPanelSpecs(4.0, 4.0, 2.7, 'Вавилон'),
  'b-34': buildGlazedPanelSpecs(5.0, 4.0, 3.0, 'Средняя Азия'),
  'b-35': buildGlazedPanelSpecs(5.0, 5.0, 3.0, 'Древняя Русь'),
  'b-36': buildGlazedPanelSpecs(6.0, 3.0, 3.0, 'Кавказ'),
  'b-37': buildGlazedPanelSpecs(6.0, 4.0, 3.0, 'Дамаск'),
  'b-38': buildGlazedPanelSpecs(6.0, 5.0, 3.0, 'Александрия'),
  'b-39': buildGlazedPanelSpecs(8.0, 4.0, 3.0, 'Вавилон'),
  'b-40': buildGlazedPanelSpecs(8.0, 5.0, 3.0, 'Древняя Русь'),
};

function fmtExactM(value: number): string {
  const text = value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `${text.replace('.', ',')} м`;
}

function buildSeriesKacheliSpecs(opts: {
  seats: string;
  length: number;
  depth: number;
  height: number;
  roof: string;
  extra?: CatalogSpec[];
}): CatalogSpec[] {
  return [
    { label: 'Мест', value: opts.seats },
    { label: 'Длина', value: fmtExactM(opts.length) },
    { label: 'Глубина', value: fmtExactM(opts.depth) },
    { label: 'Высота', value: fmtExactM(opts.height) },
    { label: 'Крыша', value: opts.roof },
    { label: 'Профиль стоек', value: '70×70×2 мм' },
    ...(opts.extra ?? []),
  ];
}

function buildKacheliSpecs(seats: 2 | 3, art: string): CatalogSpec[] {
  const size =
    seats === 2
      ? { length: 1.6, depth: 1.2, ridge: 2.0 }
      : { length: 2.0, depth: 1.5, ridge: 2.2 };
  return [
    { label: 'Мест', value: String(seats) },
    { label: 'Длина (ось сиденья)', value: fmtM(size.length) },
    { label: 'Глубина', value: fmtM(size.depth) },
    { label: 'Высота по коньку', value: fmtM(size.ridge) },
    { label: 'Крыша', value: 'Металлочерепица S-волна, двускатная, графит RAL 7016' },
    { label: 'Панели', value: `Лазер 3 мм на боковинах, заполнение 70% — ${art}` },
    { label: 'Профиль стоек', value: '80×80×3 мм' },
  ];
}

function buildMangalBesedkaSpecs(
  facadeM: number,
  depthM: number,
  ridgeM: number,
  opts: { panels?: string; sink?: boolean; hip?: boolean } = {},
): CatalogSpec[] {
  const items = buildSpecs({
    facadeM,
    depthM,
    ridgeM,
    roofPitchDeg: 22,
    overhangCm: 18,
    podiumCm: 15,
    panelHeightM: opts.panels ? 1.0 : undefined,
    panels: opts.panels,
    postProfileMm: '80×80×3',
  });
  items.push({
    label: 'Крыша',
    value: opts.hip
      ? 'Металлочерепица S-волна, вальма, графит RAL 7016'
      : 'Металлочерепица S-волна, двускатная, графит RAL 7016',
  });
  items.push({
    label: 'Мангал',
    value: 'Внутри слева у стены: жаровня 800×350 мм, печь под казан 420×420 мм, зонт, дымоход',
  });
  if (opts.sink) {
    items.push({ label: 'Мойка', value: 'В модуле BBQ' });
  }
  return items;
}

const MANGAL_BESEDKA_SPECS: Record<string, CatalogSpec[]> = {
  'bm-32': buildMangalBesedkaSpecs(3.0, 2.0, 2.7),
  'bm-12': buildMangalBesedkaSpecs(3.0, 3.0, 2.7, { panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт' }),
  'bm-42': buildMangalBesedkaSpecs(3.0, 4.0, 2.5, {
    panels: 'Лазер 3 мм на задней, левой и правой стенах — Александрия. Фасад открыт',
    hip: true,
  }),
  'bm-11': buildMangalBesedkaSpecs(4.0, 4.0, 3.0, { panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт' }),
  'bm-13': buildMangalBesedkaSpecs(4.0, 3.0, 3.0, { panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт' }),
  'bm-16': buildMangalBesedkaSpecs(5.0, 4.0, 3.0, { panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт' }),
  'bm-43': buildMangalBesedkaSpecs(4.0, 4.0, 2.7, { panels: 'Лазер 3 мм на задней, левой и правой стенах — Вавилон. Фасад открыт' }),
  'bm-14': buildMangalBesedkaSpecs(6.0, 3.0, 3.0, { panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт' }),
  'bm-52': buildMangalBesedkaSpecs(4.0, 3.0, 3.0, {
    panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт',
    sink: true,
  }),
  'bm-48': buildMangalBesedkaSpecs(6.0, 5.0, 3.0, {
    panels: 'Лазер 3 мм на задней, левой и правой стенах — орнамент. Фасад открыт',
    sink: true,
  }),
};

const KACHELI_SPECS: Record<string, CatalogSpec[]> = {
  'k-01': buildKacheliSpecs(2, 'Богатыри'),
  'k-02': buildKacheliSpecs(3, 'Богатыри'),
  'k-03': buildKacheliSpecs(2, 'Медведи'),
  'k-04': buildKacheliSpecs(3, 'Медведи'),
  'k-05': buildKacheliSpecs(2, 'Лоси'),
  'k-06': buildKacheliSpecs(3, 'Лоси'),
  'k-07': buildKacheliSpecs(2, 'Рыцари'),
  'k-08': buildKacheliSpecs(3, 'Рыцари'),
  'k-09': buildKacheliSpecs(2, 'Олени'),
  'k-10': buildKacheliSpecs(3, 'Олени'),
  'k-11': buildKacheliSpecs(2, 'Лесная жизнь'),
  'k-12': buildKacheliSpecs(3, 'Лесная жизнь'),
  'k-13': buildKacheliSpecs(2, 'Дамаск'),
  'k-14': buildKacheliSpecs(3, 'Дамаск'),
  'k-15': buildKacheliSpecs(2, 'Александрия'),
  'k-16': buildKacheliSpecs(3, 'Александрия'),
  'k-17': buildKacheliSpecs(2, 'Вавилон'),
  'k-18': buildKacheliSpecs(3, 'Вавилон'),
  'k-19': buildKacheliSpecs(2, 'Средняя Азия'),
  'k-20': buildKacheliSpecs(3, 'Средняя Азия'),
  'k-21': buildKacheliSpecs(2, 'Древняя Русь'),
  'k-22': buildKacheliSpecs(3, 'Древняя Русь'),
  'k-23': buildKacheliSpecs(2, 'Кавказ'),
  'k-24': buildKacheliSpecs(3, 'Кавказ'),
  'k-25': buildSeriesKacheliSpecs({
    seats: '3',
    length: 2.05,
    depth: 1.43,
    height: 1.73,
    roof: 'Профнастил, двускатный, графит RAL 7016',
    extra: [{ label: 'Сиденье', value: '1,60 м, на цепях 30 мм' }],
  }),
  'k-26': buildSeriesKacheliSpecs({
    seats: '3',
    length: 2.27,
    depth: 1.15,
    height: 1.86,
    roof: 'Профнастил, односкатный, графит RAL 7016',
    extra: [{ label: 'Сиденье', value: '1,60 м, на цепях 30 мм' }],
  }),
  'k-28': buildSeriesKacheliSpecs({
    seats: '3',
    length: 2.4,
    depth: 1.2,
    height: 2.2,
    roof: 'Без кровли — открытая пергола',
    extra: [{ label: 'Сиденье', value: '1,80 м, деревянная рейка' }],
  }),
  'k-29': buildSeriesKacheliSpecs({
    seats: '2 кресла',
    length: 3.0,
    depth: 1.5,
    height: 2.2,
    roof: 'Без сплошной кровли — A-frame с лазерным заполнением',
    extra: [{ label: 'Заполнение', value: 'Лазер 3 мм, лофт-сетка на боковинах A-frame' }],
  }),
  'k-30': buildSeriesKacheliSpecs({
    seats: '2',
    length: 1.8,
    depth: 1.4,
    height: 2.1,
    roof: 'Без кровли — X-каркас',
  }),
  'k-31': buildSeriesKacheliSpecs({
    seats: '8 (стол + подвесные сиденья)',
    length: 2.2,
    depth: 2.2,
    height: 2.0,
    roof: 'Поликарбонат монолитный бронза',
  }),
  'k-32': buildSeriesKacheliSpecs({
    seats: '3',
    length: 2.0,
    depth: 1.2,
    height: 1.8,
    roof: 'Профнастил, двускатный, графит RAL 7016',
    extra: [
      { label: 'Сиденье', value: '1,50 м' },
      { label: 'Панели', value: 'Лазер 3 мм — олени' },
    ],
  }),
  'k-33': buildSeriesKacheliSpecs({
    seats: '2 дивана по 1,0 м',
    length: 3.7,
    depth: 2.5,
    height: 2.8,
    roof: 'Пергола, деревянные ламели',
    extra: [
      { label: 'Подиум', value: '12 см, площадка 5,7×4,5 м' },
      { label: 'Заполнение', value: 'Плазменная ива, рамка 10 см, открытая резка' },
    ],
  }),
  'k-33-poly': buildSeriesKacheliSpecs({
    seats: '2 дивана по 1,0 м',
    length: 3.7,
    depth: 2.5,
    height: 2.8,
    roof: 'Поликарбонат монолитный бронза',
    extra: [
      { label: 'Подиум', value: '12 см, площадка 5,7×4,5 м' },
      { label: 'Заполнение', value: 'Плазменная ива, рамка 10 см, открытая резка' },
    ],
  }),
  'k-34': buildSeriesKacheliSpecs({
    seats: '1 диван 1,5 м (3 взрослых)',
    length: 3.0,
    depth: 1.9,
    height: 2.4,
    roof: 'Пергола, деревянные ламели',
    extra: [
      { label: 'Подиум', value: '12 см, площадка 5,0×3,9 м' },
      { label: 'Заполнение', value: 'Плазменная цапля, рамка 10 см, открытая резка' },
    ],
  }),
  'k-34-poly': buildSeriesKacheliSpecs({
    seats: '1 диван 1,5 м (3 взрослых)',
    length: 3.0,
    depth: 1.9,
    height: 2.4,
    roof: 'Поликарбонат монолитный бронза',
    extra: [
      { label: 'Подиум', value: '12 см, площадка 5,0×3,9 м' },
      { label: 'Заполнение', value: 'Плазменная цапля, рамка 10 см, открытая резка' },
    ],
  }),
};

export function getProductSpecs(item: CatalogItem): CatalogSpec[] {
  if (item.specs?.length) return item.specs;
  return (
    OPEN_BESEDKA_SPECS[item.slug] ??
    GLAZED_BESEDKA_SPECS[item.slug] ??
    MANGAL_BESEDKA_SPECS[item.slug] ??
    KACHELI_SPECS[item.slug] ??
    []
  );
}

export function productHasSpecs(item: CatalogItem): boolean {
  return getProductSpecs(item).length > 0;
}
