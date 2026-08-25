export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 25.08.2026 · будничный прогон</p>
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
            <strong>P1, владелец.</strong> Cloudflare NS уже lola+moura, но прокси выключен:
            A=31.128.44.47, нет cf-* headers. Origin отвечает 200 — это не авария сайта, нужен
            оранжевый cloud в кабинете CF.
          </li>
          <li>
            <strong>Блокер деплоя.</strong> В репозитории нет <code>besedki-seo/</code> и нет ключа{" "}
            <code>~/.ssh/besedki_deploy</code> — товарный OG и ContactPage на прод не выкатить.
          </li>
          <li>
            Карточки: og:type=website, нет og:image. Категория блога «proekty-i-idei» в title как slug.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено / снято сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Агент больше не принимает create-next-app за сайт и не рисует ложные critical.</li>
          <li>Выборка карточек с sitemap прода: 10/10 страниц, hero и GLB.</li>
          <li>Ложный P1 «нет мобильного меню» снят: на телефоне CTA «Каталог» + поиск.</li>
          <li>
            Health больше не ставит emergency из‑за CF, если origin, форма и телефон живые. В health
            добавлен живой on-page: товарный OG, ContactPage, H1 категорий блога.
          </li>
          <li>Прод: /proekty → 301 /katalog; в 59 URL блога нет href /proekty.</li>
          <li>Title карточек уникальны. Пол в сниппете — фанера, ДПК как опция.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · поиск B-51 / В51 · sitemap 216 URL · 0/20 ошибок</li>
          <li>iPhone UA главная 200, форма и tel:+7 (495) 255-54-77</li>
          <li>SSL до 2026-11-22 · PageSpeed не запускался (не понедельник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Владелец: оранжевое облако на A/www в Cloudflare, SSL Full (strict).</li>
          <li>Положить код сайта и SSH-ключ в среду агента.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики.</li>
          <li>После кода: товарный OG, ContactPage, H1 категорий блога.</li>
        </ol>
      </section>
    </article>
  );
}
