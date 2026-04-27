# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reglas de calidad

- SIEMPRE verifica tu trabajo antes de darlo por terminado. Revisa que el código compila, que no hay errores de tipos, y que la lógica tiene sentido.
- Antes de implementar cualquier cambio, investiga el código existente para entender cómo funciona. No asumas — lee el código primero.
- NO implementes nada a menos que estés 100% seguro de que va a funcionar. Si tienes dudas, investiga más o pregúntame antes de proceder.

## Sistema de memoria

- Antes de terminar cualquier sesión de trabajo, guarda un resumen de lo que hiciste, lo que falta por hacer y cualquier decisión importante en PROGRESS.md.
- Al iniciar una nueva sesión, lee PROGRESS.md para entender dónde te quedaste y qué sigue.
- Organiza las notas por secciones: "Completado", "En progreso", "Pendiente" y "Decisiones tomadas".
- Actualiza PROGRESS.md cada vez que completes un bloque significativo de trabajo.

## Comandos

```bash
npm run dev      # servidor de desarrollo en localhost:3000
npm run build    # build de producción (también verifica tipos)
npm run lint     # ESLint
```

No hay test runner configurado. Verifica correctitud con `npm run build`.

## Stack y proyecto

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS + Supabase SSR
- **Deploy objetivo:** Vercel
- **Supabase URL:** `https://rmajfovafnydcwmeyjub.supabase.com`
- Variables de entorno en `.env.local` — nunca hardcodear credenciales
- **Referencia de diseño y lógica:** `C:/CRM` (prototipo HTML original)
- **Fuente:** Plus Jakarta Sans (Google Fonts, cargada en `app/layout.tsx`)

## Arquitectura

### Routing

```
app/
  page.tsx                  → redirect a /dashboard
  login/page.tsx            → login + recuperar contraseña
  (crm)/
    layout.tsx              → layout compartido: Sidebar + TopBar, carga perfil
    dashboard/page.tsx      → KPIs, alertas, eventos, actividad, tareas
    pipeline/page.tsx       → (placeholder)
    trabajos/page.tsx       → (placeholder)
    calendario/page.tsx     → (placeholder)
    telegram/page.tsx       → (placeholder)
    ajustes/page.tsx        → (placeholder)
```

`middleware.ts` protege todas las rutas bajo `/(crm)/`: redirige a `/login` sin sesión, redirige a `/dashboard` si ya hay sesión en `/login`.

### Capa de datos (`lib/`)

- **`lib/supabase/client.ts`** — `createBrowserClient` para componentes cliente
- **`lib/supabase/server.ts`** — `createServerClient` con cookies para SSR/Server Components
- **`lib/db.ts`** — `nexusDB`: factory `table<T>(name)` que expone `list/create/update/remove` con conversión automática snake_case ↔ camelCase. Uso: `nexusDB.clients.list()`, `nexusDB.opportunities.create(obj)`, etc. También exporta `nexusLogActivity`.
- **`lib/types.ts`** — tipos TypeScript para todas las entidades: `Profile`, `Client`, `Opportunity`, `Activity`, `Task`, `CalendarEvent`, `Document`
- **`lib/utils.ts`** — `avatarColor`, `initials`, `formatRelTime`, `formatDate`, `formatDateTime`, `isOverdue`, `isToday`, `fmtCurrency`
- **`lib/colors.ts`** — tokens `COLORS` y `AVATAR_PALETTE` en oklch

### Esquema Supabase (tablas existentes)

`profiles`, `clients`, `opportunities`, `activities`, `tasks`, `calendar_events`, `documents`, `telegram_users`, `telegram_messages`, `audit_log`

### Convenciones de estilo

- **Tailwind** solo para layout estructural (flex, grid, gap, padding)
- **Inline styles con tokens oklch** (`COLORS` de `lib/colors.ts`) para todo el diseño visual de componentes — igual que el prototipo HTML
- Todas las páginas usan `'use client'` y cargan datos con `useEffect` + Supabase browser client
