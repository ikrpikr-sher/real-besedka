export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 12.10.2026 · понедельник</p>
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
            <strong>P2.</strong> Хаб мангала: sitemap 39, сетка 10 (только bm-*), JSON-LD 20.
            b-76…b-94 нет ни в сетке, ни в JSON-LD.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сделано сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>P0 = 0. Маршруты 7/7. Карточки выборки 10/10, hero и GLB 10/10.</li>
          <li>8 хабов категорий — 200. iPhone UA: форма, tel:+74952555477, viewport.</li>
          <li>Sitemap 2200 URL без сдвига: SKU 167, статьи 1943, коммерческие 55.</li>
          <li>
            IndexNow: 94 URL без <code>/katalog/poisk</code>, блога и 404. api.indexnow.org и Bing —
            HTTP 200. Список теперь собирает <code>sources/indexnow.py</code>.
          </li>
          <li>
            Агент: хаб мангала — P2 в health; SSL предупредит за 30/21 день (08:12: 40 дней, тихо).
          </li>
          <li>
            Повтор 08:12: P0=0, 8 хабов 200, sitemap 2200, IndexNow 94 (api.indexnow.org и Bing HTTP
            200, прямой Яндекс не вызывали).
          </li>
          <li>
            PageSpeed mobile 08:12: снова 429 на главной и каталоге. Нет{" "}
            <code>PAGESPEED_API_KEY</code>.
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
          <li>
            <code>PAGESPEED_API_KEY</code> — иначе понедельничный PSI останется 429.
          </li>
          <li>SSL до 2026-11-22, health 08:12: 40 дней (утром check писал 41).</li>
        </ol>
      </section>
    </article>
  );
}
