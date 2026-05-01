import { Home, Network, Swords, Settings as SettingsIcon, AlertTriangle, Layers, Trophy } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { countDecayedNodes } from '@/utils/memoryDecay'
import { decayTuning } from '@/config/tuning'
import { useMemo } from 'react'

type NavItem = {
  to: string
  icon: typeof Home
  label: string
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: Home, label: '首页', end: true },
  { to: '/graph', icon: Network, label: '知识图谱' },
  { to: '/decks', icon: Layers, label: '卡组' },
  { to: '/battle', icon: Swords, label: '对战' },
  { to: '/achievements', icon: Trophy, label: '成就' },
  { to: '/settings', icon: SettingsIcon, label: '设置' },
]

export function AppHeader() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const nodes = useKnowledgeStore((s) => s.nodes)

  const decayedCount = useMemo(() => countDecayedNodes(nodes), [nodes])
  const showDecayBadge = decayedCount >= decayTuning.decayBannerThreshold
  // Subscribe to actual state slices so the selector is reactive when data changes.
  const hasUnseenAch = useAchievementStore((s) =>
    Object.keys(s.unlockedIds).some((id) => !s.seenIds[id]),
  )

  return (
    <header className="sticky top-0 z-30 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3"
        >
          <span className="text-2xl">⚔️</span>
          <h1 className="text-lg font-bold text-white tracking-tight">Knowledge Quest</h1>
        </button>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const showBadge =
              (item.to === '/graph' && showDecayBadge) ||
              (item.to === '/achievements' && hasUnseenAch)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`
                }
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white">
                    !
                  </span>
                )}
              </NavLink>
            )
          })}

          {user && (
            <div className="ml-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-sm">
                {user.avatar}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="text-white font-medium">{user.username}</div>
                <div className="text-gray-500">Lv.{user.level} · {user.gold}💰</div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {showDecayBadge && (
        <div
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-300"
          onClick={() => navigate('/graph')}
        >
          <AlertTriangle size={12} />
          <span>{decayedCount} 个知识节点正在衰退，点击进入图谱复习</span>
        </div>
      )}
    </header>
  )
}
