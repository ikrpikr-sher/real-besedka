export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 26.08.2026 · будничный прогон</p>
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
            <strong>P1, прод.</strong> Пять статей от 25.08 с выпавшими буквами в title/H1 и тонким
            текстом (246–549 знаков): «теклопакет», «ваи по беседу», «Бесека», «пд ключ», «склько».
            На прод не выкатить — нет <code>besedki-seo/</code>.
          </li>
          <li>
            <strong>P1, владелец.</strong> Cloudflare NS уже lola+moura, прокси выключен: A=31.128.44.47,
            нет cf-* headers. Origin 200 — не авария, нужно оранжевое облако.
          </li>
          <li>
            Карточки: og:type=website, og:image = сайтный <code>/images/hero-besedka.jpg</code>, не
            фото модели. Категории блога — H1 «Категория: slug».
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Health ловит битые title блога по slug и известным опечаткам — больше не молчит.</li>
          <li>
            Backlog больше не требует переписать 130 уникальных title. Analyzer не сравнивает
            layout.tsx, если кода сайта нет.
          </li>
          <li>
            В проверку маршрутов добавлены квиз <code>/podbor-besedki</code> и{" "}
            <code>/konfigurator</code> — оба 200.
          </li>
          <li>OG в отчёте: «сайтный hero», а не «og:image есть».</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 220 URL · 130 карточек · 0/20 ошибок</li>
          <li>Карточки 10/10 · hero 10/10 · GLB 10/10 · светофор «клиент может пользоваться»</li>
          <li>Weekday health: P0=0 · P1=2 (CF, OG) · P2=2 · плюс live: 5 битых статей</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>SSL до 2026-11-22 · PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец или код сайта: поправить 5 статей 25.08 (title/H1/текст).</li>
          <li>Оранжевое облако на A/www в Cloudflare, SSL Full (strict).</li>
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>После кода: товарный OG, ContactPage, H1 категорий блога.</li>
        </ol>
      </section>
    </article>
  );
}
