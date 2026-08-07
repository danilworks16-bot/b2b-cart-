'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { HtProduct } from '@/lib/b2b/types'

/**
 * Фиксированный aspect-ratio + `sizes` — площадь под изображение
 * зарезервирована до загрузки, поэтому CLS = 0 при SSR-гидрации.
 */
export function ProductGallery({ images }: { images: HtProduct['images'] }) {
  const [active, setActive] = useState(0)
  const current = images[active]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted/40 sm:aspect-[5/4]">
        <Image
          key={current.id}
          src={current.url || '/placeholder.svg'}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
          className="animate-in fade-in object-contain p-6 duration-500 ease-out"
        />
      </div>

      <div className="flex gap-2.5">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={image.alt}
            aria-current={index === active}
            className={cn(
              'relative size-[72px] shrink-0 overflow-hidden rounded-xl border bg-muted/40 transition-all duration-200 ease-out active:scale-[0.97]',
              index === active
                ? 'border-primary ring-2 ring-primary/15'
                : 'border-border hover:border-input',
            )}
          >
            <Image
              src={image.url || '/placeholder.svg'}
              alt=""
              fill
              sizes="72px"
              className="object-contain p-1.5"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
