export default function SeoToday() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 p-6 font-sans text-zinc-900">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">real-besedki.ru · 21.10.2026 · будничный прогон</p>
        <h1 className="text-2xl font-semibold tracking-tight">SEO — сегодня</h1>
        <p className="text-zinc-600">
          Клиент может открыть сайт, посмотреть товар и оставить заявку. P1 редиректов закрыты
          nginx 301. Органика и индекс — недостаточно данных (нет Вебмастера / GSC / Метрики).
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что сломано</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>P2.</strong> Хаб мангала: сетка 10 при карте 39 (вчера было 39). Next-сборка
            staging не прошла — блок «другие модели» на прод не выехал.
          </li>
          <li>
            <strong>P2.</strong> Пустой /katalog/poisk в sitemap без noindex; сирота
            /blog/category/sovety; 1734 статьи в карте; og:type=website при живом фото.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что починено сегодня</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            nginx 301: B-51 остекление/мангал → /katalog/otkrytye-besedki/b-51; /katalog/loft и
            пять SKU → /katalog/besedki-osteklennye-loft. Health повторно P1=0.
          </li>
          <li>/proekty — живое портфолио 200; агент больше не требует менять ссылки на каталог.</li>
          <li>Агент не читает katalog.prod.json и видит Метрику в components/.</li>
          <li>IndexNow 96 URL без poisk, оба эндпоинта 200.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Проверка прода</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Health: P0=0 · P1=0 · P2=5 · emergency нет</li>
          <li>Маршруты 7/7 · поиск B-51 / В51 · карточки 10/10 · светофор ок</li>
          <li>Sitemap 2003 · SKU 167 · статьи 1734 · коммерческие 57</li>
          <li>iPhone UA главная 200, form + tel:+74952555477 + viewport</li>
          <li>SSL YR2 до 2027-01-17 (87 дней) · PageSpeed не запускался</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Что осталось</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Повторить remote-deploy.sh, когда Next staging собирается.</li>
          <li>Выгрузки Вебмастер / GSC / цели Метрики; PAGESPEED_API_KEY.</li>
          <li>Не трогать priceFrom и целый katalog.json.</li>
        </ol>
      </section>
    </article>
  );
}
