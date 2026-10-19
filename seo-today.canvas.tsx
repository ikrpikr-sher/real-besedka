export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 19.10.2026 · будничный прогон, понедельник</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. P0=0. Органика и индекс —
          недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-zinc-200 p-3">
          <p className="text-2xl font-semibold">0</p>
          <p className="text-sm text-zinc-500">P0 авария</p>
        </div>
        <div className="border border-zinc-200 p-3">
          <p className="text-2xl font-semibold">3</p>
          <p className="text-sm text-zinc-500">P1 редиректы</p>
        </div>
        <div className="border border-zinc-200 p-3">
          <p className="text-2xl font-semibold">5</p>
          <p className="text-sm text-zinc-500">P2 рост</p>
        </div>
        <div className="border border-zinc-200 p-3">
          <p className="text-2xl font-semibold">34</p>
          <p className="text-sm text-zinc-500">дней SSL</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>P1.</strong> Старые URL B-51{" "}
            <code>/katalog/besedki-s-ostekleniem/b-51</code> и{" "}
            <code>/katalog/besedki-s-mangalom/b-51</code> — 404 без 301 на живую{" "}
            <code>/katalog/otkrytye-besedki/b-51</code>.
          </li>
          <li>
            <strong>P1.</strong> Старый префикс <code>/katalog/loft</code> и пять карточек — 404 без
            301 на <code>/katalog/besedki-osteklennye-loft</code>.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> Нет <code>besedki-seo/</code> и{" "}
            <code>~/.ssh/besedki_deploy</code> — 301 с этого прогона не выкатить.
          </li>
          <li>
            <strong>P2.</strong> Хаб мангала: карта 39, сетка 10, JSON-LD 20; b-76…b-94 без ссылок.
            og:type=website при живом фото. Сирота <code>/blog/category/sovety</code>. Пустой{" "}
            <code>/katalog/poisk</code> в sitemap. 1944 статьи в карте.
          </li>
          <li>
            <strong>PageSpeed.</strong> Понедельник: 429 на главной и /katalog — нет{" "}
            <code>PAGESPEED_API_KEY</code>.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Снова накатил честный health с PR 42: one collect, SKU aliases, loft 301, hub_links, IndexNow без poisk.</li>
          <li>В health-отчёте SSL теперь печатает <code>days_left</code> (сегодня 34; P2 загорится около 23.10).</li>
          <li>IndexNow 94 URL, api.indexnow.org и Bing HTTP 200, без poisk / блога / 404.</li>
          <li>Ложный P1 «нет og:image» не поднимался: фото модели есть, это P2 type=website.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2201 URL · 0/20 ошибок</li>
          <li>SKU 167 · статьи 1944 · коммерческие 55 · без сдвига к 16.10</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=3 · P2=5 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+74952555477</li>
          <li>SSL до 2026-11-22, days_left 34 · NS Beget, origin 31.128.44.47</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>301 старых B-51 и /katalog/loft на живые URL.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики + PAGESPEED_API_KEY.</li>
          <li>После кода: og:type=product, noindex poisk и sovety, сжать блог в sitemap, href b-76…b-94 на хабе мангала.</li>
          <li>Продлить LE до 2026-11-22 (P2 через ~4 дня).</li>
        </ol>
      </section>
    </article>
  );
}
