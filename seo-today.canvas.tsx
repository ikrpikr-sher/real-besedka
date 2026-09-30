export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 30.09.2026 · будничный прогон</p>
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
            <strong>P2, регресс карты.</strong> Sitemap 458→620 URL: пустой{" "}
            <code>/katalog/poisk</code> снова в карте без noindex (выдача с{" "}
            <code>?q=</code> по-прежнему noindex). Теги блога 63→262.
          </li>
          <li>
            <strong>P2, размеры.</strong> Восемь indexable хабов{" "}
            <code>/katalog/razmer/4x4</code> … <code>8x5</code> пропали из sitemap, но
            остаются 200 + <code>index,follow</code>. 3x3 / 2x2 / 3x4 — noindex, не в карте.
          </li>
          <li>
            Карточки: og:image = фото модели, <code>og:type=website</code>. Сирота{" "}
            <code>/blog/category/sovety</code> (H1 «sovety», без noindex).
          </li>
          <li>
            <strong>Блокер деплоя.</strong> Нет <code>besedki-seo/</code> и{" "}
            <code>~/.ssh/besedki_deploy</code> — карту и OG на прод не выкатить.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Повторно применены честные проверки агента (PR 18): SKU ≠ size hub, one collect,
            first-hop 301, live backlog.
          </li>
          <li>
            Новый P2: индексируемые <code>/katalog/razmer/*</code> без записи в sitemap.
          </li>
          <li>P0/P1 health = 0. Сайт с телефона открывается, форма и звонок живые.</li>
          <li>
            Закрыто на проде: ContactPage, BreadcrumbList, уникальные title, человеческие H1
            категорий из sitemap, фанера в оффере, <code>/proekty</code> → 301.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 620 URL · 0/20 ошибок · 172 SKU</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=0 · P2=5 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77, Метрика 111500128</li>
          <li>SSL до 2026-11-22 · NS Beget · origin 31.128.44.47 · PageSpeed не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH-ключ в среду агента.</li>
          <li>После кода: poisk из карты + noindex; вернуть size hubs в карту; резать теги.</li>
          <li>
            <code>og:type=product</code>, 301/noindex leftover sovety, seoDescription.
          </li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики. PSI-ключ на понедельник.</li>
        </ol>
      </section>
    </article>
  );
}
