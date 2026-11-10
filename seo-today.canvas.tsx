export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 01.10.2026 · будничный прогон</p>
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
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — on-page на прод не выкатить.
          </li>
          <li>
            <strong>P2 sitemap.</strong> Карта 620→2200 URL за сутки: 1943 статьи (было 153), теги
            262→0. Четыре шаблонные серии ~200 URL: фундамент-сваи, климат, кровля, заказ-доставка.
          </li>
          <li>
            Пустой <code>/katalog/poisk</code> снова в sitemap без noindex. Сирота{" "}
            <code>/blog/category/sovety</code>: 200, H1 «sovety».
          </li>
          <li>
            Карточки: og:image = фото модели, <code>og:type=website</code> (лучше product).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Агент снова честный без кода сайта: one collect, first-hop 301, SKU ≠ size hub,
            live backlog.
          </li>
          <li>
            Новое P2: ≥400 статей в sitemap. Composition считает коммерческие посадочные отдельно
            (сегодня 50: <code>/besedka-4x4</code>, <code>/kupit-metallicheskuyu-besedku</code>…).
          </li>
          <li>
            Вчерашние P2 закрыты на проде: теги убраны из карты (leftover tag = noindex);
            <code>/katalog/razmer/3x3|2x2|4x4</code> = <code>noindex, follow</code>, взамен корневые
            посадочные.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2200 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=0 · P2=4 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77, Метрика 111500128</li>
          <li>SSL до 2026-11-22 · PageSpeed не запускался (не понедельник)</li>
          <li>NS Beget · A 31.128.44.47 · http/www first hop 301</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>
            После кода: og:type=product; noindex и выкинуть пустой poisk; закрыть sovety; проредить
            1943 статьи в карте.
          </li>
        </ol>
      </section>
    </article>
  );
}
