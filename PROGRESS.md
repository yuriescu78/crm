# NexusCRM Next.js — Progress Notes

## Completado

### Setup inicial
- Next.js 14 creado con TypeScript + Tailwind + App Router
- Dependencias: @supabase/supabase-js, @supabase/ssr instaladas
- CLAUDE.md configurado, memoria automática creada

### Infraestructura Supabase
- `.env.local` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
- `lib/supabase/client.ts` — createBrowserClient para componentes cliente
- `lib/supabase/server.ts` — createServerClient con cookies para SSR
- `middleware.ts` — auth guard: redirige a /login si no hay sesión, redirige a /dashboard si ya hay sesión en /login

### Librería compartida
- `lib/colors.ts` — sistema de tokens COLORS + AVATAR_PALETTE (oklch)
- `lib/types.ts` — tipos TypeScript completos: Profile, Client, Opportunity, Activity, Task, CalendarEvent, Document
- `lib/db.ts` — nexusDB con factory _table tipada (list/create/update/remove) + nexusLogActivity
- `lib/utils.ts` — avatarColor, initials, formatRelTime, formatDate, formatDateTime, isOverdue, isToday, fmtCurrency

### Layout
- `app/layout.tsx` — Plus Jakarta Sans, globals.css con animaciones
- `app/globals.css` — Tailwind base + scrollbar custom + keyframes
- `tailwind.config.ts` — fontFamily jakarta
- `app/(crm)/layout.tsx` — layout CRM con Sidebar + TopBar, carga perfil del usuario
- `components/layout/Sidebar.tsx` — nav con router.push, initials/nombre del usuario, collapsed
- `components/layout/TopBar.tsx` — búsqueda, notificaciones, dropdown logout

### Páginas
- `app/page.tsx` — redirect a /dashboard
- `app/login/page.tsx` — login completo con recuperar contraseña
- `app/(crm)/dashboard/page.tsx` — KPIs, alertas, eventos, actividad, tareas (con toggle real en DB)
- Páginas placeholder: /pipeline, /trabajos, /calendario, /telegram, /ajustes

### Páginas CRM (sesión 2)
- `app/(crm)/clientes/page.tsx` — CRUD clientes + ficha detallada + filtros + tabs actividad/oportunidades/tareas
- `app/(crm)/pipeline/page.tsx` — Kanban drag & drop + stats bar + modal crear/editar oportunidad
- `app/(crm)/trabajos/page.tsx` — Kanban + vista lista con toggle, drag & drop de estado, CRUD tarea
- `app/(crm)/calendario/page.tsx` — Vista mes y semana, click en día para crear, modal eventos, detalle
- `app/(crm)/telegram/page.tsx` — Tabs mensajes/usuarios/comandos, panel detalle de mensaje
- `app/(crm)/ajustes/page.tsx` — Nav lateral: Perfil (real DB update), Seguridad (supabase.auth.updateUser), Notificaciones, Supabase esquema, Telegram config

### UI compartida
- `components/ui/Modal.tsx` — modal reutilizable con backdrop, scroll, footer
- `components/ui/Forms.tsx` — Btn (hover state), FormField, FormRow, Toggle, Spinner, inputStyle, selectStyle, textareaStyle
- `lib/constants.ts` — CLIENT_STATUSES, TASK_STATUSES, PIPELINE_STAGES, TASK_KANBAN_COLS, SECTORS, SOURCES, EVENT_COLORS, AGENT_COMMANDS

## Pendiente

### Deploy Vercel
- [ ] Crear repo en GitHub
- [ ] Conectar a Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy

### API Routes
- [ ] `app/api/telegram/route.ts` — webhook del bot

## Decisiones tomadas

- Next.js 14 (no 15/16) por compatibilidad con Node 18
- Inline styles + oklch del prototipo mantenidos (no migrar a Tailwind en componentes)
- Tailwind solo para layout estructural
- `'use client'` en todas las páginas (datos via useEffect + Supabase browser client)
- Prototipo C:/CRM como referencia de diseño y lógica
