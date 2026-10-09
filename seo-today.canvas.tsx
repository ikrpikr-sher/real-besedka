export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 09.10.2026 · будничный прогон</p>
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
            <strong>P1.</strong> Старые карточки B-51 (
            <code>/katalog/besedki-s-ostekleniem/b-51</code> и{" "}
            <code>/katalog/besedki-s-mangalom/b-51</code>) отдают 404 без 301. Живая карточка —{" "}
            <code>/katalog/otkrytye-besedki/b-51</code>.
          </li>
          <li>
            <strong>P1.</strong> <code>/katalog/loft</code> и пять карточек b-53, b-54, b-55, b-62,
            b-63 отдают 404 без Location. Канон — <code>/katalog/besedki-osteklennye-loft</code>,
            все пять карточек 200 и в sitemap.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — 301 и ссылки хаба на прод не выкатить.
          </li>
          <li>
            Хаб мангала: в sitemap 39 SKU, в сетке 10 ссылок (только bm-*). b-76…b-94 в HTML хаба
            нет.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что проверено сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>P0 = 0. Маршруты 7/7. Карточки выборки 10/10, hero и GLB 10/10.</li>
          <li>
            8 хабов категорий и 55 корневых посадочных — 200. Фанера и каркас 80×80 — 200.
          </li>
          <li>Sitemap 2200 URL, как вчера: SKU 167, статьи 1943, коммерческие 55.</li>
          <li>
            IndexNow: 94 приоритетных URL, Яндекс HTTP 202, success true. Блог и 404 не
            отправлялись.
          </li>
          <li>
            <code>seoDescription</code>: 0. <code>priceFrom</code> и целый katalog.json не
            трогались. Деплой не запускался.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>301 для двух старых B-51 и шести старых URL лофта.</li>
          <li>Ссылки с хаба мангала на b-76…b-94.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики. Сейчас: недостаточно данных.</li>
        </ol>
      </section>
    </article>
  );
}
