import { COLORS } from './colors'

export const CLIENT_STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  nuevo:        { label: 'Nuevo lead',        color: COLORS.n500,     bg: COLORS.n100 },
  contactado:   { label: 'Contactado',        color: COLORS.sky,      bg: COLORS.sky100 },
  reunion:      { label: 'Reunión agendada',  color: COLORS.primary,  bg: COLORS.primary100 },
  diagnostico:  { label: 'En diagnóstico',    color: COLORS.violet,   bg: COLORS.violet100 },
  propuesta:    { label: 'Propuesta enviada', color: COLORS.amber,    bg: COLORS.amber100 },
  negociacion:  { label: 'En negociación',    color: COLORS.green,    bg: COLORS.green100 },
  ganado:       { label: 'Ganado',            color: COLORS.green600, bg: 'oklch(0.92 0.06 160)' },
  perdido:      { label: 'Perdido',           color: COLORS.red600,   bg: COLORS.red100 },
  dormido:      { label: 'Dormido',           color: COLORS.n500,     bg: 'oklch(0.940 0.008 255)' },
  activo:       { label: 'Cliente activo',    color: COLORS.teal,     bg: COLORS.teal100 },
}

export const TASK_STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: 'Pendiente',  color: COLORS.n500,     bg: COLORS.n100 },
  en_curso:   { label: 'En curso',   color: COLORS.primary,  bg: COLORS.primary100 },
  bloqueada:  { label: 'Bloqueada',  color: COLORS.red,      bg: COLORS.red100 },
  completada: { label: 'Completada', color: COLORS.green600, bg: 'oklch(0.92 0.06 160)' },
  cancelada:  { label: 'Cancelada',  color: COLORS.n500,     bg: 'oklch(0.940 0.008 255)' },
}

export const PIPELINE_STAGES = [
  { id: 'nuevo',       label: 'Lead 🎯',         color: COLORS.n500    },
  { id: 'contactado',  label: 'Contactado 📞',   color: COLORS.sky     },
  { id: 'propuesta',   label: 'Propuesta 📄',    color: COLORS.amber   },
  { id: 'negociacion', label: 'Negociación 🤝',  color: COLORS.green   },
  { id: 'ganado',      label: 'Cerrado ✅',      color: COLORS.green600 },
  { id: 'dormido',     label: 'Pendiente ⏳',    color: COLORS.violet  },
]

export const TASK_KANBAN_COLS = [
  { id: 'pendiente',  label: 'Pendiente'  },
  { id: 'en_curso',   label: 'En curso'   },
  { id: 'bloqueada',  label: 'Bloqueada'  },
  { id: 'completada', label: 'Completada' },
]

export const SECTORS = [
  'Salud', 'Tecnología', 'Gestión', 'Construcción', 'Marketing',
  'Legal', 'Inmobiliaria', 'Educación', 'Hostelería', 'Comercio',
]

export const SOURCES = [
  'Referido', 'Web', 'LinkedIn', 'Evento', 'Llamada en frío',
  'Google', 'Instagram', 'Telegram', 'Email', 'Otro',
]

export const EVENT_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  reunion:      { color: COLORS.primary, bg: COLORS.primary100, label: 'Reunión' },
  llamada:      { color: COLORS.amber,   bg: COLORS.amber100,   label: 'Llamada' },
  propuesta:    { color: COLORS.green,   bg: COLORS.green100,   label: 'Propuesta' },
  recordatorio: { color: COLORS.violet,  bg: COLORS.violet100,  label: 'Recordatorio' },
  vencimiento:  { color: COLORS.red,     bg: COLORS.red100,     label: 'Vencimiento' },
}

export const AGENT_COMMANDS = [
  { group: 'Clientes', items: [
    { cmd: '/cliente crear', desc: 'Crea un nuevo cliente' },
    { cmd: '/cliente buscar [nombre]', desc: 'Busca un cliente por nombre' },
    { cmd: 'Crea cliente [nombre] empresa [empresa]', desc: 'Lenguaje natural' },
  ]},
  { group: 'Tareas', items: [
    { cmd: '/tarea crear', desc: 'Crea una nueva tarea' },
    { cmd: '/tareas hoy', desc: 'Muestra tareas de hoy' },
    { cmd: 'Qué tareas tengo hoy', desc: 'Lenguaje natural' },
  ]},
  { group: 'Pipeline', items: [
    { cmd: '/pipeline', desc: 'Muestra resumen del pipeline' },
    { cmd: 'Qué oportunidades están en [etapa]', desc: 'Consulta por etapa' },
    { cmd: 'Pasa [cliente] a [etapa]', desc: 'Actualiza oportunidad' },
  ]},
  { group: 'Notas y Actividad', items: [
    { cmd: '/nota añadir [cliente]', desc: 'Añade nota a un cliente' },
    { cmd: 'Añade nota a [cliente]: [texto]', desc: 'Lenguaje natural' },
    { cmd: 'Registra llamada con [cliente]: [resumen]', desc: 'Registra actividad' },
  ]},
  { group: 'Reuniones', items: [
    { cmd: '/reunion crear', desc: 'Agenda una reunión' },
    { cmd: 'Agenda reunión con [cliente] el [fecha] a las [hora]', desc: 'Lenguaje natural' },
  ]},
]
