# MEDUSA_MAPPING — поля дизайна → Medusa v2 Store API

Все суммы в Medusa v2 — **минорные единицы** (fen для CNY, копейки для RUB).
Прототип использует ту же конвенцию, поэтому пересчёт не нужен.

## 1. Продукт

| Прототип (`HtProduct`) | Medusa v2 | Примечание |
| --- | --- | --- |
| `id`, `handle`, `title`, `subtitle`, `description` | `StoreProduct.*` | как есть |
| `collection.title` | `product.collection.title` | нужен `fields=+collection.*` |
| `images[]` | `product.images[]` (`{ id, url }`) | `alt` в Medusa нет → генерируй из `product.title` |
| `metadata.application` | `product.metadata.application` | текст |
| `metadata.commercial_terms` | `product.metadata.commercial_terms` | текст |
| `metadata.hs_code` | `product.hs_code` | **нативное поле**, не metadata |
| `metadata.origin_country` | `product.origin_country` | **нативное поле** |
| `metadata.shelf_life` | `product.metadata.shelf_life` | |
| `metadata.factory` | `product.metadata.factory` | |
| `spec_groups[]` | `product.metadata.spec_groups` (JSON) | либо ProductType/атрибуты |
| `documents[]` | `product.metadata.documents` (JSON) | ссылки на файлы в File Module |
| `case_studies[]` | отдельный CMS/кастомный модуль | не часть core Medusa |

## 2. Вариант

| Прототип (`HtVariant`) | Medusa v2 | Примечание |
| --- | --- | --- |
| `id`, `title`, `sku` | `StoreProductVariant.*` | как есть |
| `options[]` | `variant.options[] → { option: { title }, value }` | форма отличается, адаптируй |
| `inventory_quantity` | `variant.inventory_quantity` | нужен `fields=+inventory_quantity` и настроенный Stock Location |
| `manage_inventory`, `allow_backorder` | одноимённые поля | как есть |
| `inventory_state` | **вычисляется** | см. §2.1 |
| `calculated_price.calculated_amount` | `variant.calculated_price.calculated_amount` | требует `region_id` + `?fields=*variants.calculated_price` |
| `calculated_price.original_amount` | `variant.calculated_price.original_amount` | |
| `calculated_price.price_list_id` / `price_list_type` | `variant.calculated_price.calculated_price.price_list_id` / `price_list_type` | в v2 вложено на уровень глубже |
| `price_tiers[]` | price rules `quantity` на price set | см. §2.2 |
| `min_order_quantity` | `variant.metadata.min_order_quantity` | **добавить в metadata** |
| `order_step` | `variant.metadata.order_step` | **добавить в metadata** |
| `metadata.net_weight_kg` | `variant.weight` (граммы!) или `metadata.net_weight_kg` | если берёшь `variant.weight` — делить на 1000 |
| `metadata.gross_weight_kg` | `variant.metadata.gross_weight_kg` | **добавить в metadata** |
| `metadata.volume_m3` | вычисляй из `variant.length/width/height` (мм) либо `metadata.volume_m3` | `l*w*h/1e9` |
| `metadata.units_per_pallet` | `variant.metadata.units_per_pallet` | **добавить в metadata** |
| `metadata.lead_time_days` | `variant.metadata.lead_time_days` | **добавить в metadata** |
| `metadata.grade` | значение опции `Grade` либо `metadata.grade` | предпочтительно опция |

### 2.1 `inventory_state`

```ts
function toInventoryState(v: StoreProductVariant) {
  if (!v.manage_inventory) return 'on_request'
  if ((v.inventory_quantity ?? 0) > 0) return 'in_stock'
  if (v.allow_backorder) return 'made_to_order'
  return 'made_to_order'
}
```

### 2.2 Оптовая сетка (`price_tiers`)

В Medusa v2 ступени — это **price rules `quantity`** на price set варианта:

```ts
// backend: admin API / seed script
prices: [
  { amount: 37000, currency_code: 'cny', min_quantity: 1,   max_quantity: 19 },
  { amount: 35150, currency_code: 'cny', min_quantity: 20,  max_quantity: 99 },
  { amount: 33300, currency_code: 'cny', min_quantity: 100, max_quantity: null },
]
```

Store API **не отдаёт всю лестницу** в `calculated_price` — он возвращает цену
для одного `quantity`. Два рабочих варианта:

- **A (рекомендуется).** Отдельный route handler
  `storefront/src/app/api/price-tiers/[variantId]/route.ts`, который через
  Admin/Store SDK возвращает массив ступеней и кешируется (`revalidate`).
- **B.** Дублировать лестницу в `variant.metadata.price_tiers` (JSON) как
  «витринную» копию, а источником истины оставить price rules.
  Дешевле, но требует синхронизации.

`discount_percent` — это UI-поле: `round((base - tier) / base * 100)`.
Не храни его в БД.

## 3. Клиент / компания (B2B-модуль стартера)

| Прототип (`HtCustomerCtx`) | b2b-starter | Примечание |
| --- | --- | --- |
| `state: 'loading' \| 'guest' \| 'b2b'` | `customer === undefined` / `null` / есть `employee` | в RSC «loading» отсутствует — используй `<Suspense>` со скелетоном |
| `company.id`, `company.name` | `customer.employee.company.{id,name}` | |
| `company.spending_limit_reset_frequency` | `company.spending_limit_reset_frequency` | `never \| daily \| weekly \| monthly \| yearly` |
| `company.requires_admin_approval` | `company.approval_settings.requires_admin_approval` | модуль `approval` |
| `employee.id`, `employee.name` | `employee.id`, `employee.customer.first_name/last_name` | |
| `employee.spending_limit` | `employee.spending_limit` | минорные единицы |
| `employee.spent` | **вычисляется** | сумма заказов за период сброса; в стартере есть util `getSpentAmount` — проверь актуальное имя |
| `employee.is_admin` | `employee.is_admin` | |
| `price_list_name` | `variant.calculated_price.calculated_price.price_list_id` → название | Store API отдаёт только id; название или из Admin, или строкой из `company.metadata.price_list_name` |

Запрос customer в стартере: `retrieveCustomer()` из `@lib/data/customer`
с `fields` включающими `*employee.company`.

## 4. Корзина / заявка

| Прототип | Medusa v2 |
| --- | --- |
| `quantities: Record<variantId, number>` | `cart.items[] → { variant_id, quantity }` |
| `summary.total` | `cart.total` (или `subtotal` для «без НДС») |
| `summary.originalTotal` | `cart.original_total` |
| `summary.savings` | `cart.original_total - cart.total` (≈ `discount_total`) |
| `summary.units` | `sum(items.quantity)` |
| `summary.netWeightKg` / `grossWeightKg` / `volumeM3` | считай по `item.variant.metadata` |
| «Итого без НДС» | `cart.subtotal` — **не `total`**, если регион с `automatic_taxes` |
| «уйдёт на согласование» | `cart.approvals` / `approval_status` (модуль `approval`) |

Bulk-добавление в стартере: используй существующий server action
`addToCartBulk` (`@lib/data/cart`). Если его нет в твоей версии — напиши
обёртку над `sdk.store.cart.createLineItem` в цикле **внутри одного** server
action, а не N вызовов из клиента.

## 5. Загрузка контейнера

Чистый фронтовый расчёт, бэкенд не нужен:

```
byVolume = Σ(volume_m3 × qty)      / container.volume_m3
byWeight = Σ(gross_weight_kg × qty)/ container.payload_kg
ratio    = max(byVolume, byWeight)
```

Спецификации (`lib/b2b/container.ts`): 20FT — 28 м³ / 21 000 кг,
40HQ — 68 м³ / 26 000 кг. Значения вынесены в константу — уточни у логистики
и правь в одном месте.

## 6. Чего в Medusa нет и надо решать отдельно

- `image.alt` — генерируй, либо храни в `product.metadata.image_alts`.
- `case_studies` — кастомный модуль или CMS.
- `documents` (TDS/CoA/сертификаты) — File Module + `product.metadata`.
- `employee.spent` за период — считается запросом по заказам.
- Название price list на сторонe storefront — Store API отдаёт только id.
