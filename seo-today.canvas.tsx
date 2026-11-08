export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 02.10.2026 · будничный прогон (пятница)</p>
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
            <strong>P2.</strong> og:type=website на карточках при живом фото модели (k-07, n-05, b-63).
          </li>
          <li>
            <strong>P2.</strong> Сирота <code>/blog/category/sovety</code>: 200, H1 «sovety», без noindex,
            нет в sitemap.
          </li>
          <li>
            <strong>P2.</strong> Пустой <code>/katalog/poisk</code> в sitemap без noindex. Поиск с{" "}
            <code>?q=</code> — <code>noindex, follow</code>.
          </li>
          <li>
            <strong>P2.</strong> 1943 статьи в sitemap (порог агента 400; SKU 172). Серии fundament-svai,
            klimat-nagruzki, krovlya-ostekleni, zakaz-dostavka по ~200 URL.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Агент снова честный: one collect, first-hop 301, SKU ≠ size hub, live backlog, P2 при ≥400
            статьях. PRs 3–20 не влиты — правки перенесены с main 25.08.
          </li>
          <li>
            Выборка внутренних карточек фильтрует <code>razmer</code>/<code>poisk</code> через{" "}
            <code>is_product_catalog_path</code>.
          </li>
          <li>
            Живые сигналы закрыты: уникальные title, og:image модели, ContactPage, BreadcrumbList,
            человеческие H1 категорий блога в sitemap, <code>/proekty</code> → 301 <code>/katalog</code>.
          </li>
          <li>Cloudflare не открыт как P1: NS Beget, origin 200, нет cf-* headers.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 2205 URL · 0/20 ошибок</li>
          <li>
            Состав: SKU 172 · статьи 1943 · теги 0 · хабы размера 0 · коммерческие посадочные{" "}
            <strong>55</strong> (вчера 50, карта 2200→2205)
          </li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=0 · P2=4 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+74952555477, viewport</li>
          <li>
            Хабы размера 3×3 / 4×4: 200, <code>noindex, follow</code>. Метрика 111500128 в layout-чанке.
          </li>
          <li>SSL до 2026-11-22 · PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики (форма + телефон).</li>
          <li>
            После кода: og:type=product; noindex/убрать пустой poisk; закрыть sovety; сжать блог в
            sitemap.
          </li>
          <li>
            Проверить +5 корневых посадочных (модели, 2,5×2,5, барбекю, садовые качели) — тонкие,
            индексные.
          </li>
        </ol>
      </section>
    </article>
  );
}
