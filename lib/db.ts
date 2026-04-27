'use client'

import { createClient } from '@/lib/supabase/client'
import type { Client, Opportunity, Task, Activity, CalendarEvent, Document, Profile, TelegramMessage, TelegramUser } from '@/lib/types'

// snake_case → camelCase
const s2c = (s: string) => s.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
function deepCamel<T>(o: unknown): T {
  if (!o || typeof o !== 'object') return o as T
  if (Array.isArray(o)) return o.map(deepCamel) as T
  return Object.fromEntries(
    Object.entries(o as Record<string, unknown>).map(([k, v]) => [s2c(k), deepCamel(v)])
  ) as T
}

// camelCase → snake_case
const c2s = (s: string) => s.replace(/([A-Z])/g, l => `_${l.toLowerCase()}`)
function deepSnake(o: unknown): Record<string, unknown> {
  if (!o || typeof o !== 'object') return o as Record<string, unknown>
  if (Array.isArray(o)) return o.map(deepSnake) as unknown as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(o as Record<string, unknown>).map(([k, v]) => [c2s(k), deepSnake(v)])
  )
}

function table<T>(name: string) {
  return {
    async list(filters: Record<string, string> = {}, order = 'created_at'): Promise<T[]> {
      try {
        const sb = createClient()
        let q = sb.from(name).select('*')
        Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v) as typeof q })
        const { data, error } = await q.order(order, { ascending: false })
        if (error) throw error
        return ((data || []) as unknown[]).map(r => deepCamel<T>(r))
      } catch (e: unknown) {
        console.warn(`[nexusDB] ${name}.list:`, (e as Error).message)
        return []
      }
    },
    async create(obj: Partial<T>): Promise<T | null> {
      try {
        const sb = createClient()
        const payload = deepSnake(obj)
        delete payload.id
        payload.created_at = payload.created_at || new Date().toISOString()
        const { data, error } = await sb.from(name).insert([payload]).select().single()
        if (error) throw error
        return deepCamel<T>(data)
      } catch (e: unknown) {
        console.warn(`[nexusDB] ${name}.create:`, (e as Error).message)
        return null
      }
    },
    async update(id: string, obj: Partial<T>): Promise<T | null> {
      try {
        const sb = createClient()
        const payload = deepSnake(obj)
        delete payload.id
        payload.updated_at = new Date().toISOString()
        const { data, error } = await sb.from(name).update(payload).eq('id', id).select().single()
        if (error) throw error
        return deepCamel<T>(data)
      } catch (e: unknown) {
        console.warn(`[nexusDB] ${name}.update:`, (e as Error).message)
        return null
      }
    },
    async remove(id: string): Promise<boolean> {
      try {
        const sb = createClient()
        const { error } = await sb.from(name).delete().eq('id', id)
        if (error) throw error
        return true
      } catch (e: unknown) {
        console.warn(`[nexusDB] ${name}.remove:`, (e as Error).message)
        return false
      }
    },
  }
}

export const nexusDB = {
  clients:       table<Client>('clients'),
  opportunities: table<Opportunity>('opportunities'),
  tasks:         table<Task>('tasks'),
  activities:    table<Activity>('activities'),
  events:        table<CalendarEvent>('calendar_events'),
  documents:     table<Document>('documents'),
  profiles:      table<Profile>('profiles'),
  tgMessages:    table<TelegramMessage>('telegram_messages'),
  tgUsers:       table<TelegramUser>('telegram_users'),
}

export async function nexusLogActivity(data: Partial<Activity>) {
  return nexusDB.activities.create({
    type: 'sistema',
    origin: 'web',
    createdAt: new Date().toISOString(),
    ...data,
  })
}
