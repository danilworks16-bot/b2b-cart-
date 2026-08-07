import { ChevronDown } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Категории',
    links: [
      'Решения для хлеба',
      'Решения для тортов и бисквитов',
      'Премиксы и смеси',
      'Фруктовые начинки и соусы',
      'Натуральные консерванты',
      'Решения для замороженной выпечки',
    ],
  },
  { title: 'Коллекции', links: ['Избранные решения'] },
  { title: 'B2B', links: ['Котировки', 'Согласования', 'Компания'] },
  { title: 'Операции', links: ['Каталог', 'Заказы', 'Корзина'] },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1160px] px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground">
                H
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight">
                B2B-портал
              </span>
            </div>
            <p className="mt-4 max-w-[38ch] text-pretty text-[13px] leading-relaxed text-muted-foreground">
              Ингредиенты, R&amp;D и B2B-поставки Homtree для хлебопекарных производств: от
              технологической задачи до стабильной серийной партии.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium transition-colors duration-150 hover:bg-accent"
            >
              Русский
              <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-[13px] font-semibold">{column.title}</h3>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-pretty text-[13px] leading-snug text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Homtree B2B Portal. Все права защищены.</p>
          <p>R&amp;D, производство и применение — единая система Homtree.</p>
        </div>
      </div>
    </footer>
  )
}
