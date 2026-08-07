# FILE_MAP — куда переносить каждый файл

Источник: этот прототип (Next.js App Router + Tailwind v4 + shadcn).
Цель: `medusajs/b2b-starter-medusa` → каталог `storefront/`.

Все пути ниже указаны относительно `storefront/`.

---

## 1. Карта переноса

| Источник (прототип)                     | Цель (b2b-starter)                                                   | Тип     |
| --------------------------------------- | -------------------------------------------------------------------- | ------- |
| `lib/b2b/types.ts`                      | `src/modules/products/components/ht-order/types.ts`                  | адаптер |
| `lib/b2b/pricing.ts`                    | `src/modules/products/components/ht-order/pricing.ts`                | copy    |
| `lib/b2b/container.ts`                  | `src/modules/products/components/ht-order/container.ts`              | copy    |
| `lib/b2b/summary.ts`                    | `src/modules/products/components/ht-order/summary.ts`                | copy    |
| `lib/b2b/format.ts`                     | `src/lib/util/ht-format.ts`                                          | адаптер |
| `components/b2b/order-builder.tsx`      | `src/modules/products/components/ht-order/index.tsx`                 | адаптер |
| `components/b2b/purchase-panel.tsx`     | `src/modules/products/components/ht-order/order-panel.tsx`           | адаптер |
| `components/b2b/variant-row.tsx`        | `src/modules/products/components/ht-order/variant-row.tsx`           | copy    |
| `components/b2b/tier-grid.tsx`          | `src/modules/products/components/ht-order/tier-grid.tsx`             | copy    |
| `components/b2b/order-summary.tsx`      | `src/modules/products/components/ht-order/order-summary.tsx`         | copy    |
| `components/b2b/sticky-order-bar.tsx`   | `src/modules/products/components/ht-order/sticky-order-bar.tsx`      | copy    |
| `components/b2b/quantity-stepper.tsx`   | `src/modules/products/components/ht-order/quantity-stepper.tsx`      | copy    |
| `components/b2b/customer-context.tsx`   | заменить на `useCustomer()` / server props                            | удалить |
| `components/b2b/state-switcher.tsx`     | —                                                                    | удалить |
| `lib/b2b/mock-data.ts`                  | —                                                                    | удалить |
| `components/b2b/product-gallery.tsx`    | использовать штатный `ImageGallery`                                  | удалить |
| `components/b2b/product-info.tsx`       | `src/modules/products/components/ht-product-info/index.tsx`          | copy    |
| `components/b2b/related-products.tsx`   | использовать штатный `RelatedProducts`                               | удалить |
| `components/b2b/case-studies.tsx`       | `src/modules/products/components/ht-case-studies/index.tsx`          | copy    |
| `components/b2b/site-header.tsx`        | —                                                                    | удалить |
| `components/b2b/site-footer.tsx`        | —                                                                    | удалить |
| `app/globals.css` (токены)              | `src/styles/globals.css` (см. `TOKENS.md`)                            | merge   |
| `app/layout.tsx` (шрифты)               | `src/app/layout.tsx`                                                 | merge   |

Легенда:
- **copy** — файл переносится почти без изменений (только импорты).
- **адаптер** — требует правки: типы Medusa, server actions, `useCustomer`.
- **merge** — вливается в существующий файл starter'а, НЕ заменяет его.
- **удалить** — только для прототипа, в проде не нужен.

---

## 2. Точка встраивания

Файл: `src/modules/products/templates/index.tsx` (`ProductTemplate`).

Что делает starter сейчас:

```tsx
<ProductActionsWrapper id={product.id} region={region} />
```

Что должно стать:

```tsx
import HtOrder from "@modules/products/components/ht-order"

// ...
<Suspense fallback={<SkeletonProductActions />}>
  <HtOrder product={product} countryCode={countryCode} />
</Suspense>
```

`HtOrder` — единственный публичный вход. Ничего больше в шаблоне не меняется:
галерея, tabs, related products и breadcrumbs остаются штатными.

---

## 3. Обязательные правки импортов

Прототип использует алиас `@/`. Starter использует свои алиасы из `tsconfig.json`:

| Прототип                    | b2b-starter                            |
| --------------------------- | -------------------------------------- |
| `@/lib/utils`               | `@lib/util/cn` (или `clsx` напрямую)   |
| `@/lib/b2b/format`          | `@lib/util/ht-format`                  |
| `@/lib/b2b/types`           | `./types` (внутри `ht-order/`)         |
| `@/components/b2b/...`      | `@modules/products/components/ht-order/...` |
| `@/components/ui/button`    | `Button` из `@medusajs/ui`             |

Проверить фактические алиасы в `storefront/tsconfig.json` перед заменой —
в разных версиях starter'а набор отличается (`@modules`, `@lib`, `@pages`).

---

## 4. Компоненты shadcn → @medusajs/ui

Прототип тянет shadcn. Starter уже содержит `@medusajs/ui` и `@medusajs/icons`.
НЕ ставить shadcn в starter. Замены:

| shadcn / прототип       | @medusajs/ui                                  |
| ----------------------- | --------------------------------------------- |
| `<Button>`              | `<Button variant="primary" \| "secondary">`   |
| `<Badge>`               | `<Badge color="grey" \| "green" \| "red">`    |
| ручной `<h1 className>` | `<Heading level="h1">`                        |
| ручной `<p className>`  | `<Text size="small" \| "base" \| "large">`    |
| `<Card>`                | `<Container>`                                 |
| `<Tooltip>`             | `<Tooltip content="...">`                     |
| `lucide-react` иконки   | `@medusajs/icons` (см. таблицу ниже)          |

Соответствие иконок:

| lucide-react   | @medusajs/icons        |
| -------------- | ---------------------- |
| `Package`      | `Component`            |
| `Truck`        | `Buildings`            |
| `ChevronDown`  | `ChevronDown`          |
| `Check`        | `CheckCircleSolid`     |
| `ShieldCheck`  | `ShieldCheck`          |
| `Box`          | `Component`            |

Если точного аналога нет — оставить inline SVG 16×16 с `currentColor`,
НЕ добавлять `lucide-react` в зависимости starter'а.

---

## 5. Порядок работ

1. Скопировать `lib/b2b/{pricing,container,summary}.ts` — чистые функции, без правок.
2. Написать `types.ts` адаптер (см. `MEDUSA_MAPPING.md`, раздел «Нормализация»).
3. Влить токены в `src/styles/globals.css` (см. `TOKENS.md`).
4. Перенести презентационные компоненты: `variant-row`, `tier-grid`, `order-summary`, `sticky-order-bar`, `quantity-stepper`.
5. Написать `order-panel.tsx` — состояние + вызов server action.
6. Написать `index.tsx` (`HtOrder`) — серверная обёртка: получает `product`, нормализует, отдаёт панель.
7. Подключить в `ProductTemplate`.
8. Пройти `CHECKLIST.md`.
