export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 24.09.2026 · будничный прогон (чт)</p>
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
            <strong>P2.</strong> На карточках og:image = фото модели, но <code>og:type=website</code> — лучше{" "}
            <code>product</code>.
          </li>
          <li>
            <strong>P2.</strong> Сирота <code>/blog/category/sovety</code>: 200, H1 «sovety», без noindex, не в
            sitemap и не в ссылках с <code>/blog</code>.
          </li>
          <li>
            <strong>P2.</strong> В sitemap 63 URL тегов блога — thin pages едят краул-бюджет.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> Нет <code>besedki-seo/</code> и{" "}
            <code>~/.ssh/besedki_deploy</code> — P2 на прод не выкатить.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Агент снова честный на main 25.08: нет og:image = P1; type=website + фото модели = P2; backlog не
            открывает закрытые живые пункты; weekday = один <code>collect</code>.
          </li>
          <li>
            Прод без регресса по P0/P1. Каталог вырос: sitemap <strong>458 / 180 / 153 / 63 / 5</strong> (было
            414 / 149 на 10.09). Пустой <code>/katalog/poisk</code> по-прежнему <code>noindex, follow</code> и
            вне карты.
          </li>
          <li>
            ContactPage, BreadcrumbList, уникальные title, человеческие H1 категорий блога в sitemap — на месте.
          </li>
          <li>NS Beget, origin 31.128.44.47. Cloudflare как P1 не открываем.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 458 URL · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 9/9 · светофор «клиент может пользоваться»</li>
          <li>Health: P0=0 · P1=0 · P2=3 · emergency нет</li>
          <li>iPhone UA главная 200, форма, tel:+7 (495) 255-54-77, Metrika 111500128</li>
          <li>http и www → 301 на канон (curl -I) · SSL до 2026-11-22 · PageSpeed не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики. Яндекс Бизнес / GBP.</li>
          <li>
            После кода: <code>og:type=product</code>; 301/noindex leftover sovety; дроп или noindex тегов
            блога.
          </li>
        </ol>
      </section>
    </article>
  );
}
