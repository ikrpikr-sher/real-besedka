export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 07.09.2026 · будничный прогон (понедельник)</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. P0=0 · P1=0 · P2=3.
          Органика и индекс — недостаточно данных (нет Вебмастера / GSC / Метрики). PageSpeed —
          недостаточно данных (PSI 429).
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
            <strong>P2.</strong> Карточки: og:image = фото модели, но <code>og:type=website</code> (лучше{" "}
            <code>product</code>).
          </li>
          <li>
            <strong>P2.</strong> Сирота <code>/blog/category/sovety</code>: 200, title/H1 «sovety», без
            noindex, нет в sitemap.
          </li>
          <li>
            <strong>P2.</strong> 63 URL тегов блога в карте (было 264 на 04.09). Sitemap теперь 414 URL.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            На main снова накатились правки агента из незамерженных PR 3–10: нет og:image = P1,
            type=website + фото = P2; backlog не открывает закрытые live-пункты; weekday — один
            collect; sitemap P2; leftover sovety; analyzer без layout.tsx, если нет кода сайта.
          </li>
          <li>
            На проде пустой <code>/katalog/poisk</code> больше не в sitemap и отдаёт{" "}
            <code>noindex, follow</code> (и хаб, и <code>?q=</code>). P2 поиска снят.
          </li>
          <li>
            Карта сжалась 591 → 414: товары 141 → 149, теги 264 → 63, статьи 153 без изменений.
          </li>
          <li>
            Пять категорий в карте с человеческими H1. ContactPage, BreadcrumbList, уникальные title —
            закрыты.
          </li>
          <li>
            Агент теперь ловит leftover пустого поиска даже если URL уже выкинули из sitemap (сегодня
            noindex есть — сигнал не открывается).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 414 URL · 0/20 ошибок</li>
          <li>149 карточек · 153 статьи · 63 тега · 5 категорий блога</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 7/7 · светофор «клиент может пользоваться»</li>
          <li>Health weekday: P0=0 · P1=0 · P2=3</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>NS Beget · origin 31.128.44.47 · SSL до 2026-11-22 · PSI 429 без ключа</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: код сайта + SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики. Яндекс Бизнес / GBP. PAGESPEED_API_KEY.</li>
          <li>
            После кода: <code>og:type=product</code>; теги блога — noindex или выкинуть остаток из
            карты; 301/noindex для <code>/blog/category/sovety</code>.
          </li>
        </ol>
      </section>
    </article>
  );
}
