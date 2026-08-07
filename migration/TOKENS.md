# TOKENS — перенос дизайн-системы в b2b-starter

## 0. Ключевое различие: Tailwind v4 vs v3

| | Прототип | b2b-starter |
| --- | --- | --- |
| Tailwind | v4 | **v3** |
| Конфиг темы | `@theme inline { }` в CSS | `tailwind.config.js` → `theme.extend` |
| Импорт | `@import "tailwindcss"` | `@tailwind base/components/utilities` |
| Preset | — | `@medusajs/ui-preset` |

**Нельзя копировать `@theme inline` блок в starter — он не скомпилируется.**
Токены переносятся как CSS-переменные + расширение `tailwind.config.js`.

Перед началом проверить фактическую версию:
`cat storefront/package.json | grep tailwindcss`. Если там v4 — использовать
`@theme inline` как в прототипе и пропустить раздел 2.

---

## 1. CSS-переменные → `src/styles/globals.css`

Добавить ПОСЛЕ `@tailwind utilities;`, не трогая существующие правила starter'а:

```css
:root {
  color-scheme: light;

  /* Homtree B2B palette — light only, белый холст обязателен */
  --ht-background: #ffffff;
  --ht-foreground: #16161a;

  --ht-primary: #8e1b3c;           /* корпоративный винно-красный */
  --ht-primary-foreground: #ffffff;
  --ht-primary-soft: #fbf1f4;

  --ht-muted: #f7f7f8;
  --ht-muted-foreground: #6c6c75;

  --ht-success: #0f7a52;
  --ht-success-soft: #edf8f2;

  --ht-destructive: #b3261e;

  --ht-border: #e8e8ec;
  --ht-input: #dfdfe4;
  --ht-ring: #8e1b3c;

  --ht-radius: 0.75rem;

  --ht-shadow-panel: 0 1px 2px 0 rgb(22 22 26 / 0.04),
    0 8px 24px -12px rgb(22 22 26 / 0.12);
  --ht-shadow-lift: 0 1px 2px 0 rgb(22 22 26 / 0.05),
    0 18px 40px -18px rgb(22 22 26 / 0.18);
}
```

Префикс `--ht-` обязателен: starter уже определяет свои `--border`, `--muted`
и т.п. через `@medusajs/ui-preset`. Без префикса будет конфликт и «поедут»
штатные компоненты корзины и чекаута.

---

## 2. `tailwind.config.js` — расширение (только для Tailwind v3)

```js
// storefront/tailwind.config.js
module.exports = {
  presets: [require("@medusajs/ui-preset")],
  // ... existing content / darkMode
  theme: {
    extend: {
      colors: {
        ht: {
          bg: "var(--ht-background)",
          fg: "var(--ht-foreground)",
          primary: "var(--ht-primary)",
          "primary-fg": "var(--ht-primary-foreground)",
          "primary-soft": "var(--ht-primary-soft)",
          muted: "var(--ht-muted)",
          "muted-fg": "var(--ht-muted-foreground)",
          success: "var(--ht-success)",
          "success-soft": "var(--ht-success-soft)",
          destructive: "var(--ht-destructive)",
          border: "var(--ht-border)",
          input: "var(--ht-input)",
          ring: "var(--ht-ring)",
        },
      },
      borderRadius: {
        ht: "var(--ht-radius)",
        "ht-lg": "calc(var(--ht-radius) * 1.35)",
        "ht-xl": "calc(var(--ht-radius) * 1.75)",
      },
      boxShadow: {
        "ht-panel": "var(--ht-shadow-panel)",
        "ht-lift": "var(--ht-shadow-lift)",
      },
    },
  },
}
```

`presets: [require("@medusajs/ui-preset")]` уже есть в starter — НЕ удалять.

---

## 3. Замена классов в перенесённых компонентах

Обязательная замена по всем файлам `ht-order/`:

| Прототип (v4 semantic)  | b2b-starter              |
| ----------------------- | ------------------------ |
| `bg-background`         | `bg-ht-bg`               |
| `text-foreground`       | `text-ht-fg`             |
| `bg-card`               | `bg-ht-bg`               |
| `text-primary`          | `text-ht-primary`        |
| `bg-primary`            | `bg-ht-primary`          |
| `text-primary-foreground` | `text-ht-primary-fg`   |
| `bg-primary-soft`       | `bg-ht-primary-soft`     |
| `bg-muted`              | `bg-ht-muted`            |
| `text-muted-foreground` | `text-ht-muted-fg`       |
| `text-success`          | `text-ht-success`        |
| `bg-success-soft`       | `bg-ht-success-soft`     |
| `border-border`         | `border-ht-border`       |
| `border-input`          | `border-ht-input`        |
| `ring-ring`             | `ring-ht-ring`           |
| `shadow-panel`          | `shadow-ht-panel`        |
| `shadow-lift`           | `shadow-ht-lift`         |
| `rounded-xl`            | `rounded-ht-lg`          |
| `rounded-2xl`           | `rounded-ht-xl`          |

`border-border` в прототипе применён глобально через `@layer base { * { ... } }`.
В starter такого правила нет — каждый `border` в перенесённых компонентах
должен явно получить `border-ht-border`, иначе рамки будут дефолтно-серыми.

---

## 4. Типографика

Прототип: Inter (`--font-sans`) + Inter Tight (`--font-display`).
Starter: Inter через `next/font/google` в `src/app/layout.tsx`.

Что делать:

```tsx
// src/app/layout.tsx
import { Inter, Inter_Tight } from "next/font/google"

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })
const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-tight",
})

// <html className={`${inter.variable} ${interTight.variable}`}>
```

Добавить `cyrillic` в `subsets` — иначе русские подписи («Итого без НДС»,
«Загрузка 20FT») отрендерятся системным фолбэком и метрики поедут.

В `tailwind.config.js`:

```js
fontFamily: {
  "ht-sans": ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
  "ht-display": ["var(--font-inter-tight)", "var(--font-inter)", "sans-serif"],
}
```

Замена: `font-sans` → `font-ht-sans`, `font-display` → `font-ht-display`.

---

## 5. Утилитарные классы прототипа

Три кастомных класса не входят в Tailwind. Перенести в `globals.css` starter'а:

```css
/* Табличные цифры — обязательны для цен, SKU и количеств */
.ht-numeric {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Контролируемый горизонтальный скролл спек-таблиц */
.ht-scroll-x {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--ht-input) transparent;
}
.ht-scroll-x::-webkit-scrollbar { height: 8px; }
.ht-scroll-x::-webkit-scrollbar-thumb {
  background: var(--ht-input);
  border-radius: 999px;
}
```

`.ht-numeric` — не косметика: без него цифры в оптовой сетке и в блоке
«Итого» скачут по ширине при пересчёте количества.

---

## 6. Что НЕ переносить

- `@import 'shadcn/tailwind.css'` — starter не использует shadcn.
- `@import 'tw-animate-css'` — вместо `animate-in fade-in slide-in-from-top-1`
  использовать `transition-*` + `data-[state=open]` или штатные анимации
  `@medusajs/ui`. Либо добавить `tailwindcss-animate` в starter, если он
  ещё не установлен (проверить `package.json`).
- `--radius`, `--border`, `--input` без префикса — конфликтуют с preset'ом.
- Любые `dark:` варианты — карточка light-only по требованию.

---

## 7. Правило по контрасту

При переопределении фона ВСЕГДА переопределяется и цвет текста:

- `bg-ht-primary` → `text-ht-primary-fg`
- `bg-ht-success-soft` → `text-ht-success`
- `bg-ht-muted` → `text-ht-fg` или `text-ht-muted-fg`

Прямые цвета (`text-white`, `bg-black`, `text-gray-500`) в перенесённых
компонентах запрещены — всё только через `ht-*` токены.
