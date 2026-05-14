import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../i18n'
import { StickyNote, BarChart3, Sparkles } from 'lucide-react'
import CollabNotes from './CollabNotes'
import CollabPolls from './CollabPolls'
import WhatsNextWidget from './WhatsNextWidget'

function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= breakpoint)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= breakpoint)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return isDesktop
}

const card = {
  display: 'flex', flexDirection: 'column',
  background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-faint)',
  overflow: 'hidden', minHeight: 0,
}

interface TripMember {
  id: number
  username: string
  avatar_url?: string | null
}

interface CollabFeatures {
  chat: boolean
  notes: boolean
  polls: boolean
  whatsnext: boolean
}

interface CollabPanelProps {
  tripId: number
  tripMembers?: TripMember[]
  collabFeatures?: CollabFeatures
}

const ALL_TABS = [
  { id: 'notes', featureKey: 'notes' as const, labelKey: 'collab.tabs.notes', fallback: 'Notes', icon: StickyNote },
  { id: 'polls', featureKey: 'polls' as const, labelKey: 'collab.tabs.polls', fallback: 'Polls', icon: BarChart3 },
  { id: 'next', featureKey: 'whatsnext' as const, labelKey: 'collab.whatsNext.title', fallback: "What's Next", icon: Sparkles },
]

type CollabPanelTabId = typeof ALL_TABS[number]['id']

export default function CollabPanel({ tripId, tripMembers = [], collabFeatures }: CollabPanelProps) {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const isDesktop = useIsDesktop()

  const features = collabFeatures || { chat: true, notes: true, polls: true, whatsnext: true }

  const tabs = useMemo(() =>
    ALL_TABS.filter(tab => features[tab.featureKey]).map(tab => ({
      ...tab,
      label: t(tab.labelKey) || tab.fallback,
    })),
  [features, t])

  const [mobileTab, setMobileTab] = useState<CollabPanelTabId>(() => tabs[0]?.id || 'notes')

  // If active tab gets disabled, switch to first available
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(t => t.id === mobileTab)) {
      setMobileTab(tabs[0].id)
    }
  }, [tabs, mobileTab])

  const panels = tabs.map(tab => tab.id)

  if (tabs.length === 0) return null

  const renderPanel = (panel: CollabPanelTabId) => {
    if (panel === 'notes') return <CollabNotes tripId={tripId} currentUser={user} />
    if (panel === 'polls') return <CollabPolls tripId={tripId} currentUser={user} />
    return <WhatsNextWidget tripMembers={tripMembers} />
  }

  if (isDesktop) {
    if (panels.length === 3) {
      return (
        <div style={{ height: '100%', display: 'flex', gap: 12, padding: 12, overflow: 'hidden', minHeight: 0 }}>
          <div style={{ ...card, flex: '1 1 55%' }}>
            <CollabNotes tripId={tripId} currentUser={user} />
          </div>

          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', minHeight: 0 }}>
            <div style={{ ...card, flex: 1 }}>
              <CollabPolls tripId={tripId} currentUser={user} />
            </div>
            <div style={{ ...card, flex: 1 }}>
              <WhatsNextWidget tripMembers={tripMembers} />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ height: '100%', display: 'flex', gap: 12, padding: 12, overflow: 'hidden', minHeight: 0 }}>
        {panels.map(panel => (
          <div key={panel} style={{ ...card, flex: 1 }}>
            {renderPanel(panel)}
          </div>
        ))}
      </div>
    )
  }

  // Mobile: tab bar + single panel (only enabled tabs)
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'absolute', inset: 0 }}>
      <div style={{
        display: 'flex', gap: 2, padding: '8px 12px', borderBottom: '1px solid var(--border-faint)',
        background: 'var(--bg-card)', flexShrink: 0,
      }}>
        {tabs.map(tab => {
          const active = mobileTab === tab.id
          return (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-text)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {mobileTab === 'notes' && features.notes && <CollabNotes tripId={tripId} currentUser={user} />}
        {mobileTab === 'polls' && features.polls && <CollabPolls tripId={tripId} currentUser={user} />}
        {mobileTab === 'next' && features.whatsnext && <WhatsNextWidget tripMembers={tripMembers} />}
      </div>
    </div>
  )
}
