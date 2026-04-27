'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { nexusDB } from '@/lib/db'
import type { Profile } from '@/lib/types'
import { COLORS } from '@/lib/colors'
import { Btn, FormField, FormRow, inputStyle, Toggle, Spinner } from '@/components/ui/Forms'

const SECTIONS = [
  { id: 'perfil',         label: 'Perfil',           icon: '👤' },
  { id: 'seguridad',      label: 'Seguridad',         icon: '🔒' },
  { id: 'notificaciones', label: 'Notificaciones',    icon: '🔔' },
  { id: 'supabase',       label: 'Base de datos',     icon: '🗄️' },
  { id: 'telegram',       label: 'Telegram',          icon: '✈️' },
]

const DB_TABLES = [
  { name: 'clients',          desc: 'Clientes y leads',           cols: 'id, first_name, last_name, email, phone, status, priority, owner_id, tags, created_at' },
  { name: 'opportunities',    desc: 'Oportunidades de venta',     cols: 'id, client_id, title, stage, estimated_value, probability, expected_close_date' },
  { name: 'tasks',            desc: 'Tareas y actividades',       cols: 'id, client_id, title, status, priority, due_date, assigned_to' },
  { name: 'activities',       desc: 'Registro de actividad',      cols: 'id, client_id, type, description, origin, created_at' },
  { name: 'calendar_events',  desc: 'Eventos del calendario',     cols: 'id, client_id, title, type, start_at, end_at, status' },
  { name: 'documents',        desc: 'Documentos',                 cols: 'id, client_id, name, type, status, version' },
  { name: 'profiles',         desc: 'Usuarios del sistema',       cols: 'id, name, email, role, active' },
  { name: 'telegram_messages',desc: 'Mensajes del bot Telegram',  cols: 'id, telegram_user, text, intent, status, response' },
  { name: 'telegram_users',   desc: 'Usuarios de Telegram',       cols: 'id, telegram_user, active, user_id' },
]

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>{desc}</div>}
    </div>
  )
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '20px 24px' }}>{children}</div>
}

export default function AjustesPage() {
  const [section, setSection] = useState('perfil')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  // Profile form
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')

  // Password form
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError]     = useState('')
  const [pwdSaved, setPwdSaved]     = useState(false)

  // Notification toggles
  const [notifs, setNotifs] = useState({
    nuevaOportunidad: true, tareaVencida: true, mensajeTelegram: false, resumenDiario: false,
  })

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return }
      const profiles = await nexusDB.profiles.list({ id: data.user.id })
      const p = profiles[0] ?? null
      setProfile(p)
      setName(p?.name ?? data.user.email?.split('@')[0] ?? '')
      setEmail(data.user.email ?? '')
      setLoading(false)
    })
  }, [])

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    await nexusDB.profiles.update(profile.id, { name })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  async function savePassword() {
    setPwdError('')
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return }
    if (newPwd.length < 6) { setPwdError('Mínimo 6 caracteres'); return }
    setSaving(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password: newPwd })
    setSaving(false)
    if (error) { setPwdError(error.message); return }
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    setPwdSaved(true)
    setTimeout(() => setPwdSaved(false), 2500)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', padding: '24px 28px', gap: 24 }}>
      {/* Left nav */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Configuración</div>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, textAlign: 'left', background: section === s.id ? COLORS.primary100 : 'transparent', color: section === s.id ? COLORS.primary : COLORS.textSub, transition: 'all 0.15s', marginBottom: 2 }}
          >
            <span style={{ fontSize: 15 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Perfil */}
        {section === 'perfil' && (
          <SectionCard>
            <SectionHeader title="Perfil de usuario" desc="Actualiza tu información personal" />
            <SectionBody>
              <FormField label="Nombre">
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
              </FormField>
              <FormField label="Email" hint="El email solo puede cambiarse desde Supabase Auth">
                <input style={{ ...inputStyle, background: COLORS.n50, color: COLORS.textMuted }} value={email} readOnly />
              </FormField>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Btn onClick={saveProfile} disabled={saving}>{saving ? <Spinner /> : 'Guardar cambios'}</Btn>
                {saved && <span style={{ fontSize: 12, color: COLORS.green600, fontWeight: 600 }}>Guardado correctamente</span>}
              </div>
            </SectionBody>
          </SectionCard>
        )}

        {/* Seguridad */}
        {section === 'seguridad' && (
          <SectionCard>
            <SectionHeader title="Cambiar contraseña" desc="Usa una contraseña segura de al menos 6 caracteres" />
            <SectionBody>
              <FormField label="Contraseña actual">
                <input style={inputStyle} type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" />
              </FormField>
              <FormRow>
                <FormField label="Nueva contraseña">
                  <input style={inputStyle} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" />
                </FormField>
                <FormField label="Confirmar contraseña">
                  <input style={inputStyle} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" />
                </FormField>
              </FormRow>
              {pwdError && <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 12 }}>{pwdError}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Btn onClick={savePassword} disabled={saving || !newPwd}>{saving ? <Spinner /> : 'Cambiar contraseña'}</Btn>
                {pwdSaved && <span style={{ fontSize: 12, color: COLORS.green600, fontWeight: 600 }}>Contraseña actualizada</span>}
              </div>
            </SectionBody>
          </SectionCard>
        )}

        {/* Notificaciones */}
        {section === 'notificaciones' && (
          <SectionCard>
            <SectionHeader title="Notificaciones" desc="Configura qué notificaciones quieres recibir" />
            <SectionBody>
              {[
                { key: 'nuevaOportunidad', label: 'Nueva oportunidad asignada',   desc: 'Cuando se te asigna una nueva oportunidad' },
                { key: 'tareaVencida',     label: 'Tarea vencida',                desc: 'Cuando una tarea supera su fecha límite' },
                { key: 'mensajeTelegram',  label: 'Mensajes de Telegram',          desc: 'Cuando el bot recibe un mensaje' },
                { key: 'resumenDiario',    label: 'Resumen diario',                desc: 'Email diario con resumen de actividad' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSub}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{label}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{desc}</div>
                  </div>
                  <Toggle value={notifs[key as keyof typeof notifs]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <Btn>Guardar preferencias</Btn>
              </div>
            </SectionBody>
          </SectionCard>
        )}

        {/* Supabase */}
        {section === 'supabase' && (
          <>
            <SectionCard>
              <SectionHeader title="Conexión Supabase" desc="Estado de la conexión con la base de datos" />
              <SectionBody>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.green }} />
                  <span style={{ fontSize: 13, color: COLORS.green600, fontWeight: 600 }}>Conectado</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSub, fontFamily: 'monospace', background: COLORS.n50, padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                  https://rmajfovafnydcwmeyjub.supabase.co
                </div>
              </SectionBody>
            </SectionCard>
            <SectionCard>
              <SectionHeader title="Esquema de tablas" desc="Tablas disponibles en la base de datos" />
              <SectionBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {DB_TABLES.map(t => (
                    <div key={t.name} style={{ background: COLORS.n50, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <code style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, fontFamily: 'monospace' }}>{t.name}</code>
                        <span style={{ fontSize: 12, color: COLORS.textMuted }}>{t.desc}</span>
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' }}>{t.cols}</div>
                    </div>
                  ))}
                </div>
              </SectionBody>
            </SectionCard>
          </>
        )}

        {/* Telegram */}
        {section === 'telegram' && (
          <SectionCard>
            <SectionHeader title="Configuración del bot" desc="Parámetros del agente de Telegram" />
            <SectionBody>
              <FormField label="Token del bot" hint="Obtenido desde @BotFather en Telegram">
                <input style={inputStyle} type="password" placeholder="••••••••••••••••••••••" />
              </FormField>
              <FormField label="Webhook URL" hint="URL pública donde Telegram enviará los mensajes">
                <input style={inputStyle} placeholder="https://tu-dominio.com/api/telegram/webhook" />
              </FormField>
              <FormField label="Modo">
                <select style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option>Producción</option>
                  <option>Desarrollo (polling)</option>
                </select>
              </FormField>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn>Guardar configuración</Btn>
                <Btn variant="secondary">Probar conexión</Btn>
              </div>
            </SectionBody>
          </SectionCard>
        )}
      </div>
    </div>
  )
}
