export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 20.10.2026 · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Сайт открывается, товар и заявка на месте. Старые адреса лофта и B-51 больше не 404.
          Органика и индекс — недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что было сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>P1.</strong> /katalog/loft и старые /b-51 в остеклении и мангале отдавали 404.
            Живые страницы при этом были 200.
          </li>
          <li>
            Сборка не проходила: CatalogCard не принимал priority, а хаб каталога его передавал.
            Watchdog возвращал карточку из pin.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сделано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>308 на живые URL лофта и B-51. Сборка BUILD_ID rcRSJtVfZMjUagcCuvyzC.</li>
          <li>seoDescription у b-57, b-59, b-58. Цены не менялись, в каталоге по-прежнему 193 позиции.</li>
          <li>IndexNow: 19 коммерческих URL, IndexNow и Яндекс ответили 200.</li>
          <li>Хабы каталога и посадочные после деплоя — 200. Форма и телефон на главной живые.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Маршруты 7/7 · карточки 10/10 · sitemap 2201 · выборка 0/20</li>
          <li>Health: P0=0 · P1=0 · P2=2 (og:type и 800 городских URL)</li>
          <li>SSL до 2027-01-17 · PageSpeed не запускался (вторник)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Выгрузки Вебмастера, GSC и целей Метрики.</li>
          <li>Ещё около 103 опубликованных карточек без seoDescription — по 1–3 за прогон.</li>
          <li>og:type=product упирается в Next 14. Городские шаблоны блога из sitemap не вынимались.</li>
        </ol>
      </section>
    </article>
  );
}
