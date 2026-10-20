type Props = {
  slug: string;
};

export default function PavilionVentilation({ slug }: Props) {
  const isB63 = slug === 'b-63';

  return (
    <section id="pavilion-vent" className="mt-8 border-t border-border pt-6">
      <h2 className="text-lg font-semibold text-text">Естественная вентиляция</h2>
      <p className="mt-1 text-sm text-text-muted">
        Холодный остеклённый контур, без мангала. Это стек холодного лофта от конденсата — не приточная
        установка и не дымоудаление.
      </p>

      <p className="mt-3 text-sm text-text">
        Односкатка высокая с фасада, сток назад. Холодный воздух заходит снизу в глухую стену С21,
        проходит глубину павильона, нагревается и уходит в софит высокого свеса.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-DEFAULT border border-border bg-surface px-3 py-2">
          <p className="text-lg font-semibold text-text">2</p>
          <p className="text-xs text-text-muted">Приток низ тыла С21</p>
        </div>
        <div className="rounded-DEFAULT border border-border bg-surface px-3 py-2">
          <p className="text-lg font-semibold text-text">2</p>
          <p className="text-xs text-text-muted">Вытяжка в софите фасада</p>
        </div>
        <div className="rounded-DEFAULT border border-border bg-surface px-3 py-2">
          <p className="text-lg font-semibold text-text">Ø125</p>
          <p className="text-xs text-text-muted">Гильза, колпак вниз</p>
        </div>
        <div className="rounded-DEFAULT border border-border bg-surface px-3 py-2">
          <p className="text-lg font-semibold text-text">~3,5°</p>
          <p className="text-xs text-text-muted">Скат: высокий фасад</p>
        </div>
      </div>

      <h3 className="mt-6 text-sm font-medium text-text">Разрез — как идёт воздух</h3>
      <p className="mt-1 text-xs text-text-muted">
        Слева высокий фасад и вытяжка. Справа низкий тыл С21 и приток.
      </p>
      <p className="mt-3">
        <img
          src="/images/osteklenie/ventilyaciya/vent-razrez.png"
          alt="Разрез вентиляции: приток низ тыла С21, вытяжка в софите высокого фасада"
          className="w-full rounded-DEFAULT border border-border"
        />
      </p>

      <h3 className="mt-6 text-sm font-medium text-text">План — куда ставят клапаны</h3>
      <p className="mt-1 text-xs text-text-muted">
        Вход снизу, тыл С21 сверху. Стрелки от двух синих кружков притока к двум вытяжкам у фасада.
      </p>
      <p className="mt-3">
        <img
          src="/images/osteklenie/ventilyaciya/vent-plan.png"
          alt="План вентиляции: два притока Ø125 на тыле, две вытяжки Ø125 на фасаде"
          className="w-full rounded-DEFAULT border border-border"
        />
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="bg-surface text-left">
              <th className="border border-border px-3 py-2 font-medium">Узел</th>
              <th className="border border-border px-3 py-2 font-medium">Где</th>
              <th className="border border-border px-3 py-2 font-medium">Как собрано</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-3 py-2">Приток Ø125 × 2</td>
              <td className="border border-border px-3 py-2">
                {isB63
                  ? 'Низ тыла С21, пролёты 02 и 05, ~0,43 м над ДПК. Не над розетками и не у щитка.'
                  : 'Низ глухой стены С21. Не над розетками и не у щитка.'}
              </td>
              <td className="border border-border px-3 py-2">
                Диск внутри, колпак с отворотом под задним свесом 65 см.
              </td>
            </tr>
            <tr>
              <td className="border border-border px-3 py-2">Вытяжка Ø125 × 2</td>
              <td className="border border-border px-3 py-2">
                Решётка в потолке у фасада, те же оси. В стекло не сверлим: верх створки ниже ригеля.
              </td>
              <td className="border border-border px-3 py-2">
                Дальше холодный кровельный зазор и колпак под карнизом высокого свеса.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isB63 ? null : (
        <p className="mt-4 text-xs text-text-muted">
          Чертежи — «Лофт 8×6» B-63. На других остеклённых и закрытых павильонах тот же стек: приток
          снизу сзади, вытяжка сверху спереди. Оси сверления — по проекту.
        </p>
      )}
      <p className="mt-4 text-sm">
        <a className="text-accent hover:underline" href="/blog/ventilyaciya-holodnogo-lofta-b-63">
          Статья про стек холодного лофта
        </a>
        {' · '}
        <a className="text-accent hover:underline" href="/docs/B-63-ventilyaciya.html">
          HTML-схема
        </a>
        {' · '}
        <a className="text-accent hover:underline" href="/docs/B-63-ventilyaciya.pdf">
          PDF
        </a>
      </p>
    </section>
  );
}

export function showPavilionVentilation(category: string, slug: string): boolean {
  if (category === 'besedki-s-ostekleniem' || category === 'besedki-osteklennye-loft') return true;
  return /^p-(0[8-9]|1[0-3])$/.test(slug);
}
