export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 07.10.2026 · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. Органика и индекс —
          недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>P1.</strong> Старые URL B-51 отдают 404 без Location:{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> и{" "}
            <code>/katalog/besedki-s-mangalom/b-51</code>. Живая карточка —{" "}
            <code>/katalog/otkrytye-besedki/b-51</code> («Графит · Лофт»). 301 не выкатить: нет{" "}
            <code>besedki-seo/</code> и <code>~/.ssh/besedki_deploy</code>.
          </li>
          <li>
            <strong>P2.</strong> Sitemap 2179: SKU 146 (было 172 на 02.10), 1943 статьи, пустой{" "}
            <code>/katalog/poisk</code> без noindex, сирота <code>/blog/category/sovety</code>.
          </li>
          <li>
            Карточки: og:image есть, <code>og:type=website</code>. JSON-LD Product + Offer на месте.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Агент снова честный на main: re-apply PR 24 (P0=0 не emergency из‑за Beget, backlog
            держит health P1, поиск считает только href карточки).
          </li>
          <li>
            В <code>sku_aliases</code> добавлен мангал-путь B-51 — тот же артикул, одна живая
            карточка в поиске и sitemap.
          </li>
          <li>
            Прод без регресса против 06.10: маршруты 7/7, форма + tel, ContactPage, BreadcrumbList,
            уникальные title, человекочитаемые H1 категорий из sitemap.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2179 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health weekday: P0=0 · P1=1 · P2=5. После алиаса мангал B-51 живая проверка: P1=2</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77; Metrika в layout-чанке</li>
          <li>SSL до 2026-11-22 (46 дн.) · PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH-ключ в среду агента.</li>
          <li>
            301 остекление/мангал B-51 → открытые B-51; аудит снятых slug (b-1 без текущей
            карточки).
          </li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>
            После кода: og:type=product; noindex пустого поиска и сироты sovety; ужать 1943 статьи
            в sitemap.
          </li>
        </ol>
      </section>
    </article>
  );
}
