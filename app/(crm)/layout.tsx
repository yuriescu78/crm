'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { COLORS } from '@/lib/colors'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const pathname = usePathname()

  // Derive view name from pathname
  const view = pathname.split('/')[1] || 'dashboard'

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      sb.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data)
        } else {
          setProfile({
            name: user.user_metadata?.full_name || user.email,
            email: user.email,
            role: 'user',
          })
        }
      })
    })
  }, [])

  const initials = (name: string) =>
    name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const userName = profile?.name || profile?.email || ''
  const userInitials = userName ? initials(userName) : '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        collapsed={collapsed}
        userInitials={userInitials}
        userName={userName}
        userRole={profile?.role}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          view={view}
          onToggle={() => setCollapsed(c => !c)}
          userName={userName}
          userEmail={profile?.email || ''}
          userInitials={userInitials}
        />
        <main style={{
          flex: 1, overflowY: 'auto', padding: '26px 30px',
          background: COLORS.bg,
        }}>
          <div className="view-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
