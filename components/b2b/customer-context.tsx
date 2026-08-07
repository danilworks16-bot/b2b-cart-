'use client'

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from 'react'
import type { HtCustomerCtx } from '@/lib/b2b/types'

/**
 * В реальном b2b-starter это НЕ клиентский стейт: контекст приходит из
 * RSC (`retrieveCustomer()` + `employee.company`) и прокидывается пропсом.
 *
 * Здесь провайдер существует только чтобы продемонстрировать все три
 * состояния разметки (loading / guest / b2b) в статичном превью.
 * При переносе: удалить провайдер, принимать `customer` как проп.
 */

const B2B_CUSTOMER: HtCustomerCtx = {
  state: 'b2b',
  company: {
    id: 'comp_hleb3',
    name: 'АО «Хлебокомбинат №3»',
    spending_limit_reset_frequency: 'monthly',
    requires_admin_approval: true,
  },
  employee: {
    id: 'emp_01',
    name: 'И. Ковалёв',
    spending_limit: 8000000,
    spent: 2415000,
    is_admin: false,
  },
  price_list_name: 'Оптовый прайс · Россия/СНГ',
}

type CtxValue = {
  customer: HtCustomerCtx
  /** имитация «весь контекст пересчитывается» — блокирует интерактив */
  isRecalculating: boolean
  setCustomerState: (next: 'guest' | 'b2b') => void
}

const CustomerContext = createContext<CtxValue | null>(null)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<HtCustomerCtx>({ state: 'loading' })
  const [isRecalculating, startRecalc] = useTransition()

  // Первичная «гидрация» контекста — показывает skeleton-состояние.
  useEffect(() => {
    const t = setTimeout(() => setCustomer(B2B_CUSTOMER), 900)
    return () => clearTimeout(t)
  }, [])

  const value = useMemo<CtxValue>(
    () => ({
      customer,
      isRecalculating,
      setCustomerState: (next) => {
        startRecalc(() => {
          setCustomer(next === 'b2b' ? B2B_CUSTOMER : { state: 'guest' })
        })
      },
    }),
    [customer, isRecalculating],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used inside CustomerProvider')
  return ctx
}
