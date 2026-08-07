'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomer } from './customer-context'

/**
 * ТОЛЬКО ДЛЯ ПРЕВЬЮ. Позволяет проверить все три состояния разметки.
 * При переносе в b2b-starter этот компонент удаляется целиком.
 */
export function StateSwitcher() {
  const { customer, isRecalculating, setCustomerState } = useCustomer()

  const options = [
    { key: 'guest' as const, label: 'Гость' },
    { key: 'b2b' as const, label: 'B2B-клиент' },
  ]

  return (
    // приподнят над sticky-панелью заявки
    <div className="fixed bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+5.25rem))] left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/85 p-1.5 pl-3.5 shadow-lift backdrop-blur-xl backdrop-saturate-150">
        <span className="hidden text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground sm:inline">
          Состояние
        </span>
        {options.map((option) => {
          const isActive = customer.state === option.key
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setCustomerState(option.key)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
        {(isRecalculating || customer.state === 'loading') && (
          <Loader2 className="mx-1.5 size-3.5 animate-spin text-primary" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
