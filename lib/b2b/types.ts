/**
 * Типы намеренно повторяют форму объектов Medusa v2 Store API,
 * чтобы дизайн переносился в b2b-starter без переписывания разметки.
 *
 * Соответствие:
 *  HtProduct        -> StoreProduct (+ metadata)
 *  HtVariant        -> StoreProductVariant (+ calculated_price)
 *  HtCalculatedPrice-> StoreProductVariant.calculated_price (price_list)
 *  HtCompany        -> ModuleCompany (b2b-starter: companies module)
 *  HtCustomerCtx    -> retrieveCustomer() + employee.company
 */

export type HtCurrency = 'CNY' | 'RUB' | 'USD'

export type HtRegion = {
  id: string
  name: string
  currency_code: Lowercase<HtCurrency>
}

/** StoreProductVariant.calculated_price */
export type HtCalculatedPrice = {
  /** в минорных единицах, как в Medusa (fen / копейки / cents) */
  calculated_amount: number
  original_amount: number
  currency_code: Lowercase<HtCurrency>
  /** null у гостя, заполнен для B2B-аккаунта с прикреплённым price list */
  price_list_id: string | null
  price_list_type: 'sale' | 'override' | null
}

/** Одна ступень оптовой сетки. В Medusa v2 это price rule `quantity` на price set. */
export type HtPriceTier = {
  min_quantity: number
  max_quantity: number | null
  amount: number
  /** служебное поле для UI: % к базовой цене */
  discount_percent: number
}

export type HtInventoryState = 'in_stock' | 'on_request' | 'made_to_order'

/** StoreProductVariant */
export type HtVariant = {
  id: string
  title: string
  sku: string
  /** ProductVariant.options -> [{option_title, value}] */
  options: { option_title: string; value: string }[]
  /** метрики упаковки, в b2b-starter лежат в variant.metadata */
  metadata: {
    net_weight_kg: number
    units_per_pallet: number
    lead_time_days: number
    grade: string
  }
  inventory_quantity: number
  manage_inventory: boolean
  allow_backorder: boolean
  inventory_state: HtInventoryState
  calculated_price: HtCalculatedPrice
  price_tiers: HtPriceTier[]
  /** MOQ и шаг заказа: b2b-starter кладёт в variant.metadata */
  min_order_quantity: number
  order_step: number
}

export type HtSpecGroup = {
  label: string
  rows: { label: string; value: string }[]
}

export type HtDocument = {
  id: string
  title: string
  kind: 'tds' | 'coa' | 'certificate' | 'declaration'
  size: string
}

export type HtCaseStudy = {
  id: string
  rating: number
  title: string
  author: string
  role: string
  body: string
}

/** StoreProduct */
export type HtProduct = {
  id: string
  handle: string
  title: string
  subtitle: string
  description: string
  collection: { id: string; title: string }
  images: { id: string; url: string; alt: string }[]
  variants: HtVariant[]
  metadata: {
    application: string
    commercial_terms: string
    hs_code: string
    origin_country: string
    shelf_life: string
    factory: string
  }
  spec_groups: HtSpecGroup[]
  documents: HtDocument[]
  case_studies: HtCaseStudy[]
}

/** Контекст авторизации: определяет, какие цены и действия доступны */
export type HtCustomerCtx =
  | { state: 'loading' }
  | { state: 'guest' }
  | {
      state: 'b2b'
      company: {
        id: string
        name: string
        spending_limit_reset_frequency: 'monthly' | 'never'
        /** ApprovalSettings в b2b-starter */
        requires_admin_approval: boolean
      }
      employee: {
        id: string
        name: string
        /** в минорных единицах, как в Medusa */
        spending_limit: number
        spent: number
        is_admin: boolean
      }
      price_list_name: string
    }

export type HtRelatedProduct = {
  id: string
  handle: string
  sku: string
  title: string
  image: string | null
  amount: number
  moq: string
  packaging: string
  inventory_state: HtInventoryState
}
