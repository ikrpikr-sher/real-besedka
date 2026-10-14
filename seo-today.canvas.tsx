export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 14.10.2026 · 08:02 UTC · среда</p>
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
            b-63 отдают 404 без Location. Канон — <code>/katalog/besedki-osteklennye-loft</code>.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — 301 и ссылки хаба на прод не выкатить.
          </li>
          <li>
            <strong>P2.</strong> Хаб мангала: sitemap 39, сетка 10 (только bm-*), JSON-LD 20.
            b-76…b-94 нет ни в сетке, ни в JSON-LD.
          </li>
          <li>
            <strong>P2.</strong> Sitemap +1 статья: 2200 → 2201, блог 1943 → 1944. Новая{" "}
            <code>/blog/foto-dvora-ne-studiya</code> (200, lastmod 2026-12-06).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сделано сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>P0 = 0. Маршруты 7/7. Карточки выборки 10/10, hero и GLB 10/10.</li>
          <li>iPhone UA: форма, tel:+74952555477, viewport. 8/8 хабов категорий — 200.</li>
          <li>SKU 167 без сдвига: остекление 20, открытые 29, мангал 39, павильоны 15, навесы 8, качели 36, мангалы 15, лофт 5.</li>
          <li>
            IndexNow: 94 URL без <code>/katalog/poisk</code>, блога и 404. api.indexnow.org и Bing —
            HTTP 200, тело пустое. Прямой Яндекс не вызывали.
          </li>
          <li>SSL days_left 38 (утром было 39), до 2026-11-22. Порог P2 (&lt;30) ещё не горит.</li>
          <li>PageSpeed в среду не запускался.</li>
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
          <li>
            <code>PAGESPEED_API_KEY</code> — иначе следующий понедельничный PSI останется 429.
          </li>
          <li>SSL до 2026-11-22, health 14.10 08:02: 38 дней.</li>
        </ol>
      </section>
    </article>
  );
}
