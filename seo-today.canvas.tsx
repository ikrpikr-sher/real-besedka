export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 29.09.2026 · будничный прогон (вторник)</p>
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
            <code>~/.ssh/besedki_deploy</code> — P2 on-page на прод не выкатить.
          </li>
          <li>
            <strong>P2.</strong> Карточки: og:image = фото модели, но <code>og:type=website</code> вместо{" "}
            <code>product</code>.
          </li>
          <li>
            <strong>P2.</strong> Сирота <code>/blog/category/sovety</code>: 200, H1 «sovety», без noindex, не в
            sitemap.
          </li>
          <li>
            <strong>P2.</strong> 63 URL тегов блога в sitemap (thin pages).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Снова наложены honesty-правки PR 17: один collect, живой backlog, first hop 301.</li>
          <li>
            Хабы <code>/katalog/razmer/*</code> больше не считаются карточками. Ложный P2 «общий hero на
            6x3» снят: это посадочная размера, не SKU. Каталог <strong>172</strong> SKU + 8 хабов в карте
            458.
          </li>
          <li>Прод без регресса: P0=0 · P1=0 · P2=3. Sitemap 458 без изменений к 28.09.</li>
          <li>ContactPage, BreadcrumbList, уникальные title, человекочитаемые H1 категорий блога в sitemap.</li>
          <li>
            Пустой <code>/katalog/poisk</code> — noindex, follow, не в карте. Хабы 3x3 / 2x2 / 3x4 тоже
            noindex и не в sitemap.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 458 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=0 · P2=3 · emergency нет</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77, Метрика 111500128</li>
          <li>SSL до 2026-11-22 · NS Beget · origin 31.128.44.47</li>
          <li>PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики; PAGESPEED_API_KEY по понедельникам.</li>
          <li>После кода: og:type=product; 301/noindex leftover sovety; дроп/noindex тегов блога.</li>
        </ol>
      </section>
    </article>
  );
}
