'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart, ImageOff, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/b2b/format'
import type { HtRelatedProduct } from '@/lib/b2b/types'
import { useCustomer } from './customer-context'

const STATE_COPY: Record<HtRelatedProduct['inventory_state'], string> = {
  in_stock: 'На складе',
  on_request: 'Доступно по запросу',
  made_to_order: 'Под заказ',
}

function ProductCard({ item }: { item: HtRelatedProduct }) {
  const { customer } = useCustomer()
  const [saved, setSaved] = useState(false)
  const isLoading = customer.state === 'loading'

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-input hover:shadow-lift">
      <button
        type="button"
        aria-label={saved ? `Убрать из избранного: ${item.title}` : `В избранное: ${item.title}`}
        aria-pressed={saved}
        onClick={() => setSaved((prev) => !prev)}
        className="absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground backdrop-blur-md transition-[color,transform] duration-150 ease-out hover:text-primary active:scale-90"
      >
        <Heart
          className={cn('size-[15px]', saved && 'fill-primary text-primary')}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      <a href="#" className="relative block aspect-[4/3] w-full overflow-hidden bg-muted/40">
        {item.image ? (
          <Image
            src={item.image || '/placeholder.svg'}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-7" strokeWidth={1.25} aria-hidden="true" />
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="ht-numeric text-[11.5px] font-medium tracking-tight text-muted-foreground">
          {item.sku}
        </span>

        <h3 className="mt-1 min-h-[40px] text-pretty text-[14px] font-semibold leading-snug">
          <a href="#" className="transition-colors duration-150 hover:text-primary">
            {item.title}
          </a>
        </h3>

        <ul className="ht-numeric mt-2.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          {[item.moq, item.packaging].map((chip) => (
            <li key={chip} className="rounded-md bg-secondary px-1.5 py-0.5">
              {chip}
            </li>
          ))}
          <li className="rounded-md bg-success-soft px-1.5 py-0.5 font-medium text-success">
            Котировка
          </li>
        </ul>

        {/* Зона цены с зафиксированной высотой — skeleton не меняет геометрию сетки */}
        <div className="mt-auto flex min-h-[62px] items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            {isLoading ? (
              <>
                <span className="block h-[19px] w-20 animate-pulse rounded bg-muted" />
                <span className="mt-1.5 block h-3 w-16 animate-pulse rounded bg-muted" />
              </>
            ) : (
              <>
                <span className="ht-numeric block font-display text-[17px] font-semibold tracking-tight">
                  {formatAmount(item.amount)}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      item.inventory_state === 'made_to_order' ? 'bg-muted-foreground' : 'bg-success',
                    )}
                    aria-hidden="true"
                  />
                  {STATE_COPY[item.inventory_state]}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={isLoading}
            aria-label={`Добавить в заявку: ${item.title}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-[transform,opacity] duration-150 ease-out hover:opacity-90 active:scale-90 disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

export function RelatedProducts({ items }: { items: HtRelatedProduct[] }) {
  return (
    <section aria-labelledby="related-heading" className="rounded-2xl bg-muted/50 p-5 sm:p-7">
      <h2 id="related-heading" className="font-display text-[19px] font-semibold tracking-tight">
        Подходит для этой B2B-закупки
      </h2>
      <p className="mt-1 max-w-[62ch] text-pretty text-[13.5px] text-muted-foreground">
        Решения той же области применения, совместимые продукты и альтернативы для оптовой котировки.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
