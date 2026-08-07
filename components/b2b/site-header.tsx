'use client'

import { BookOpen, Boxes, ChevronDown, ClipboardList, FlaskConical, ShoppingBag } from 'lucide-react'
import { useCustomer } from './customer-context'

const NAV = [
  { label: 'Каталог', icon: Boxes },
  { label: 'R&D', icon: FlaskConical },
  { label: 'Материалы', icon: BookOpen },
  { label: 'Заказы', icon: ClipboardList },
]

/**
 * Шапка сохранена как в текущем портале: плавающая капсула, тот же набор
 * пунктов, тот же переключатель языка и иконка корзины справа.
 * Изменения только в токенах цвета/типографики.
 */
export function SiteHeader() {
  const { isRecalculating } = useCustomer()

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex h-14 max-w-[1160px] items-center gap-6 rounded-xl border border-border bg-card/80 px-4 shadow-panel backdrop-blur-xl backdrop-saturate-150">
        <a href="#" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground">
            H
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">Homtree</span>
        </a>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ label, icon: Icon }) => (
            <a
              key={label}
              href="#"
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-[13.5px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            disabled={isRecalculating}
            className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            RU
            <ChevronDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Корзина котировки"
            className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            <ShoppingBag className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
