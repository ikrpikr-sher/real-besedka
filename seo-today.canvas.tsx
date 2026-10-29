export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 29.10.2026 · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. Органика и индекс —
          недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сделано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Честные сниппеты B-46, B-47, B-48: убрано ложное «раздвижное остекление». priceFrom
            672 000 / 816 000 / 936 000 ₽ не менялись.
          </li>
          <li>
            В репо: <code>seo-daily-ship.sh</code>, CATALOG-SAFETY, SEO-90-DAYS, честный генератор.
          </li>
          <li>
            Git сверен с продом 2026.10.28.1: poisk noindex, leftover 301, эталон nginx с
            og:type=product. Полный deploy.sh не запускался.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Health P0=0 · P1=0 · P2=0 · emergency нет</li>
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 1699 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>iPhone UA главная 200, форма и tel</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>B-73 — последнее ложное остекление, затем пустые kacheli по 3 шт.</li>
          <li>Владелец: Вебмастер / GSC / цели Метрики / Яндекс Бизнес.</li>
          <li>Смержить weekday-PR, чтобы git догнал прод 2026.10.28.1.</li>
        </ol>
      </section>
    </article>
  );
}
