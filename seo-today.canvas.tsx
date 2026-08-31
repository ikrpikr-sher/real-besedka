export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 31.08.2026 · понедельник · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт с телефона, посмотреть товар и оставить заявку. Органика, индекс и
          PageSpeed — недостаточно данных (нет Вебмастера / GSC / Метрики; PSI ответил 429).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — <code>og:type=product</code>, noindex поиска и чистку
            sitemap с агента не выкатить.
          </li>
          <li>
            <strong>P2.</strong> На карточках og:image уже фото модели, но <code>og:type=website</code>.
          </li>
          <li>
            <strong>P2.</strong> Пустой <code>/katalog/poisk</code> в sitemap без noindex. Запрос{" "}
            <code>?q=</code> уже <code>noindex, follow</code>.
          </li>
          <li>
            <strong>P2.</strong> Sitemap 517 URL: 140 карточек, 124 статьи и <strong>221 тег</strong> блога.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Агент больше не ставит P1 «нет товарного OG», если og:image есть. Нет фото = P1,{" "}
            <code>type=website</code> / общий hero = P2.
          </li>
          <li>
            Backlog не просит переписать уникальные title, ContactPage, BreadcrumbList и H1 категорий —
            на проде они уже закрыты.
          </li>
          <li>Weekday делает один <code>collect</code>, а не четыре полных health.</li>
          <li>
            DNS: ушли с Cloudflare NS на Beget. Origin 31.128.44.47, сайт 200 — это не авария. Оранжевое
            облако больше не висит как P1.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 517 URL · 0/20 ошибок · 140 карточек</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>После сверки классификатора: P0=0 · P1=0 · P2=3 · emergency нет</li>
          <li>iPhone UA главная 200, форма, tel:+7 (495) 255-54-77, Метрика 111500128</li>
          <li>SSL до 2026-11-22 · PageSpeed: недостаточно данных (429)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики; Яндекс Бизнес и Google Business.</li>
          <li>
            После кода: <code>og:type=product</code>; noindex и убрать пустой поиск из sitemap; убрать
            теги из карты.
          </li>
        </ol>
      </section>
    </article>
  );
}
