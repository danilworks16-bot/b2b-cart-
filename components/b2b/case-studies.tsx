'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { HtCaseStudy } from '@/lib/b2b/types'

function Rating({ value }: { value: number }) {
  return (
    <div className="inline-flex w-fit shrink-0 items-center gap-1.5 self-start rounded-md bg-primary-soft px-2 py-1">
      <div className="flex gap-[1px]" role="img" aria-label={`Оценка ${value} из 5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3',
              index < Math.round(value) ? 'fill-primary text-primary' : 'text-primary/25',
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="ht-numeric text-[11.5px] font-semibold text-primary">
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export function CaseStudies({ cases }: { cases: HtCaseStudy[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<HtCaseStudy | null>(null)

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * (rail.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="cases-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="cases-heading" className="font-display text-[19px] font-semibold tracking-tight">
            Опыт производств
          </h2>
          <p className="ht-numeric mt-1 text-[13px] text-muted-foreground">
            {cases.length} проверенных B2B-кейса
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {(
            [
              { dir: -1 as const, Icon: ArrowLeft, label: 'Предыдущий кейс' },
              { dir: 1 as const, Icon: ArrowRight, label: 'Следующий кейс' },
            ]
          ).map(({ dir, Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => scrollBy(dir)}
              className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-95"
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={railRef}
        className="ht-scroll-x ht-snap-x -mx-1 mt-5 flex gap-3 px-1 pb-2"
        role="list"
      >
        {cases.map((item) => (
          <article
            key={item.id}
            role="listitem"
            className="flex w-[min(340px,84vw)] shrink-0 flex-col rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-200 ease-out hover:border-input hover:shadow-panel"
          >
            <Rating value={item.rating} />

            <h3 className="mt-3 text-pretty font-display text-[15px] font-semibold leading-snug">
              {item.title}
            </h3>

            <p className="mt-2 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
              {item.body}
            </p>

            <button
              type="button"
              onClick={() => setActive(item)}
              className="mt-3 self-start rounded-md text-[13px] font-medium text-primary transition-opacity duration-150 hover:opacity-70"
            >
              Читать полностью
            </button>

            <footer className="mt-4 border-t border-border pt-3 text-[12px] text-muted-foreground">
              {item.author}, {item.role}
            </footer>
          </article>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-[520px] gap-0 rounded-2xl p-6">
          {active && (
            <>
              <DialogHeader className="gap-3 text-left">
                <Rating value={active.rating} />
                <DialogTitle className="text-balance font-display text-[20px] font-semibold leading-snug">
                  {active.title}
                </DialogTitle>
                <DialogDescription className="text-[13px] font-medium text-primary">
                  {active.author}, {active.role}
                </DialogDescription>
              </DialogHeader>
              <p className="mt-4 text-pretty text-[14px] leading-relaxed text-foreground/85">
                {active.body}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
