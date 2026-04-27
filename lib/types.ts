export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ClientStatus =
  | 'nuevo' | 'contactado' | 'reunion' | 'diagnostico'
  | 'propuesta' | 'negociacion' | 'ganado' | 'perdido' | 'dormido' | 'activo'

export type Priority = 'baja' | 'media' | 'alta' | 'urgente'

export interface Client {
  id: string
  firstName: string
  lastName: string | null
  company: string | null
  position: string | null
  email: string | null
  phone: string | null
  city: string | null
  sector: string | null
  source: string | null
  status: ClientStatus
  priority: Priority
  ownerId: string | null
  tags: string[]
  summary: string | null
  observations: string | null
  lastActivityAt: string | null
  nextActionAt: string | null
  createdAt: string
  updatedAt: string
}

export type OpportunityStage =
  | 'nuevo' | 'contactado' | 'propuesta' | 'negociacion'
  | 'ganado' | 'perdido' | 'dormido' | 'reunion' | 'diagnostico'

export interface Opportunity {
  id: string
  clientId: string
  title: string
  description: string | null
  stage: OpportunityStage
  estimatedValue: number
  probability: number
  weightedValue: number
  expectedCloseDate: string | null
  lostReason: string | null
  ownerId: string | null
  createdAt: string
  updatedAt: string
}

export type ActivityType =
  | 'nota' | 'email' | 'llamada' | 'reunion' | 'cambio'
  | 'documento' | 'tarea' | 'recordatorio' | 'telegram' | 'sistema'

export interface Activity {
  id: string
  clientId: string | null
  opportunityId: string | null
  type: ActivityType
  description: string
  origin: 'web' | 'system' | 'telegram'
  createdBy: string | null
  createdAt: string
}

export type TaskStatus = 'pendiente' | 'en_curso' | 'bloqueada' | 'completada' | 'cancelada'

export interface Task {
  id: string
  clientId: string | null
  opportunityId: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  assignedTo: string | null
  createdBy: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type EventType = 'reunion' | 'llamada' | 'propuesta' | 'recordatorio' | 'vencimiento'

export interface CalendarEvent {
  id: string
  clientId: string | null
  opportunityId: string | null
  title: string
  description: string | null
  type: EventType
  startAt: string
  endAt: string | null
  status: 'programado' | 'realizado' | 'cancelado'
  ownerId: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  clientId: string | null
  opportunityId: string | null
  name: string
  type: 'propuesta' | 'presupuesto' | 'contrato' | 'briefing' | 'acta' | 'tecnico' | 'imagen' | 'otro'
  status: 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'firmado' | 'archivado'
  version: string
  storagePath: string | null
  notes: string | null
  uploadedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface TelegramMessage {
  id: string
  telegramUser: string
  text: string
  intent: string | null
  status: 'processed' | 'pending_confirmation' | 'failed'
  response: string | null
  userId: string | null
  createdAt: string
}

export interface TelegramUser {
  id: string
  userId: string | null
  telegramUser: string
  active: boolean
  createdAt: string
}
