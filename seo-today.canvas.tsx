export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 24.10.2026 · автономный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Сайт открывается, товар и заявка работают. Health P0=0 · P1=0 · P2=0. Органика —
          недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сделано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Пилот seoDescription: <strong>b-40, b-55, b-62</strong>. Пустых 108 → 105. Цены не
            менялись.
          </li>
          <li>
            В коде карточки: <code>og:type=product</code>, короткий title, fallback уникального
            description без записи в каталог.
          </li>
          <li>
            Git догнал прод 22.10: noindex <code>/katalog/poisk</code>, 301{' '}
            <code>/blog/category/sovety</code> и b-51, сборка в соседнем каталоге.
          </li>
          <li>Backlog больше не рисует закрытые ContactPage / H1 slug / BreadcrumbList.</li>
          <li>
            Появились <code>scripts/seo-daily-ship.sh</code> и{' '}
            <code>real-besedki-seo-agent/SEO-90-DAYS.md</code>.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2002 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10</li>
          <li>SSL до 2027-01-17 · NS Beget · без Cloudflare</li>
          <li>iPhone UA 200, форма и tel:+7 (495) 255-54-77</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Ещё 105 карточек без seoDescription — по 3/день.</li>
          <li>Владелец: Вебмастер, GSC, цели Метрики, Яндекс Бизнес.</li>
          <li>Не запускать полный deploy.sh, пока git не совпадёт с продом целиком.</li>
        </ol>
      </section>
    </article>
  );
}
