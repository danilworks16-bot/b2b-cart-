'use client'

import { Download, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { HtProduct } from '@/lib/b2b/types'

export function ProductInfo({ product }: { product: HtProduct }) {
  return (
    <section aria-label="Информация о товаре">
      <Tabs defaultValue="description" className="gap-0">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-0 border-b border-border p-0 group-data-horizontal/tabs:h-auto"
        >
          {[
            { value: 'description', label: 'Описание' },
            { value: 'specs', label: 'Спецификации' },
            { value: 'docs', label: 'Документы' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative h-auto flex-none rounded-none px-3.5 pb-3 pt-0 text-[14px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground data-active:text-foreground group-data-horizontal/tabs:after:inset-x-3.5 group-data-horizontal/tabs:after:bottom-[-1px] group-data-horizontal/tabs:after:h-[2px] group-data-horizontal/tabs:after:rounded-full group-data-horizontal/tabs:after:bg-primary"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* min-h держит высоту при переключении табов — контент разной длины не «прыгает» */}
        <TabsContent value="description" className="min-h-[240px] pt-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex max-w-[62ch] flex-col gap-4 text-[14.5px] leading-relaxed text-foreground/85">
              <p className="text-pretty">{product.description}</p>
              <p className="text-pretty">
                <span className="font-medium text-foreground">Применение. </span>
                {product.metadata.application}
              </p>
              <p className="text-pretty text-muted-foreground">
                <span className="font-medium text-foreground">Коммерческие условия. </span>
                {product.metadata.commercial_terms}
              </p>
            </div>

            <dl className="ht-numeric grid h-fit grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-border bg-muted/40 p-4 text-[13px] lg:grid-cols-1">
              {[
                { label: 'HS-код', value: product.metadata.hs_code },
                { label: 'Происхождение', value: 'Китай' },
                { label: 'Срок годности', value: product.metadata.shelf_life },
                { label: 'Производство', value: product.metadata.factory },
              ].map((row) => (
                <div key={row.label} className="lg:flex lg:items-baseline lg:justify-between lg:gap-4">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="mt-0.5 font-medium lg:mt-0 lg:text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="min-h-[240px] pt-7">
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {product.spec_groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h3>
                <dl className="mt-3">
                  {group.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-6 border-b border-border py-2.5 last:border-b-0"
                    >
                      <dt className="text-[13.5px] text-muted-foreground">{row.label}</dt>
                      <dd className="ht-numeric text-right text-[13.5px] font-medium">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs" className="min-h-[240px] pt-7">
          <ul className="grid max-w-[820px] gap-2.5 sm:grid-cols-2">
            {product.documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-input hover:shadow-panel active:scale-[0.995]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <FileText className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{doc.title}</span>
                    <span className="block text-[12px] text-muted-foreground">{doc.size}</span>
                  </span>
                  <Download
                    className="size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-primary"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Партийный CoA и полный инвойс-пакет предоставляются менеджером после подтверждения котировки.
          </p>
        </TabsContent>
      </Tabs>
    </section>
  )
}
