import { ChevronRight } from 'lucide-react'
import { CaseStudies } from '@/components/b2b/case-studies'
import { CustomerProvider } from '@/components/b2b/customer-context'
import { OrderBuilder } from '@/components/b2b/order-builder'
import { ProductInfo } from '@/components/b2b/product-info'
import { RelatedProducts } from '@/components/b2b/related-products'
import { SiteFooter } from '@/components/b2b/site-footer'
import { SiteHeader } from '@/components/b2b/site-header'
import { StateSwitcher } from '@/components/b2b/state-switcher'
import { product, relatedProducts } from '@/lib/b2b/mock-data'

export default function ProductPage() {
  return (
    <CustomerProvider>
      <SiteHeader />

      <main className="mx-auto max-w-[1160px] px-4 pb-24">
        <nav aria-label="Хлебные крошки" className="py-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted-foreground">
            {['Каталог', product.collection.title].map((crumb) => (
              <li key={crumb} className="flex items-center gap-1.5">
                <a href="#" className="transition-colors duration-150 hover:text-foreground">
                  {crumb}
                </a>
                <ChevronRight className="size-3.5 opacity-50" strokeWidth={2} aria-hidden="true" />
              </li>
            ))}
            <li aria-current="page" className="truncate font-medium text-foreground">
              {product.title}
            </li>
          </ol>
        </nav>

        <OrderBuilder product={product} />

        <div className="mt-16 flex flex-col gap-16">
          <ProductInfo product={product} />
          <CaseStudies cases={product.case_studies} />
          <RelatedProducts items={relatedProducts} />
        </div>
      </main>

      <SiteFooter />
      <StateSwitcher />
    </CustomerProvider>
  )
}
