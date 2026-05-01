import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Lock } from 'lucide-react'
import { ACHIEVEMENTS, evaluateAll } from '@/data/achievements'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { AchievementCategory } from '@/types'

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  knowledge: '🧠 知识图谱',
  original: '✨ 原创秘技',
  mastery: '💪 掌握精进',
  battle: '⚔️ 战斗记录',
  deck: '🎴 卡组构筑',
  meta: '🎯 跨域成就',
}

const CATEGORY_ORDER: AchievementCategory[] = [
  'knowledge',
  'original',
  'mastery',
  'battle',
  'deck',
  'meta',
]

export function AchievementsPage() {
  const navigate = useNavigate()
  const { unlockedIds, markAllSeen } = useAchievementStore()
  const { nodes } = useKnowledgeStore()
  const { decks } = useDeckStore()
  const { user } = useAuthStore()

  // Mark badge as seen on enter
  useEffect(() => {
    markAllSeen()
  }, [markAllSeen])

  const evaluations = useMemo(() => {
    return evaluateAll({
      nodes,
      decks,
      user,
      battlesWon: user?.stats.battlesWon ?? 0,
    })
  }, [nodes, decks, user])

  const grouped = useMemo(() => {
    const map = new Map<AchievementCategory, typeof evaluations>()
    for (const cat of CATEGORY_ORDER) map.set(cat, [])
    for (const ev of evaluations) {
      map.get(ev.def.category)!.push(ev)
    }
    return map
  }, [evaluations])

  const totalUnlocked = Object.keys(unlockedIds).length
  const completionPct = Math.round((totalUnlocked / ACHIEVEMENTS.length) * 100)

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            成就
          </h1>
          <div className="ml-auto text-right">
            <div className="text-xs text-white/40">完成度</div>
            <div className="text-lg font-bold text-amber-300">
              {totalUnlocked} / {ACHIEVEMENTS.length}
              <span className="text-xs text-white/50 ml-1.5">({completionPct}%)</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="space-y-8">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? []
            if (list.length === 0) return null
            return (
              <section key={cat}>
                <h2 className="text-sm font-semibold text-white/80 mb-3">{CATEGORY_LABEL[cat]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((ev) => {
                    const unlockedAt = unlockedIds[ev.def.id]
                    const unlocked = Boolean(unlockedAt)
                    const isHidden = ev.def.hidden && !unlocked
                    const showProgress = !unlocked && ev.target !== undefined && (ev.progress ?? 0) > 0
                    return (
                      <motion.div
                        key={ev.def.id}
                        whileHover={{ y: -2 }}
                        className={`relative rounded-2xl border p-4 transition-all ${
                          unlocked
                            ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-400/40'
                            : 'bg-white/[0.02] border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`text-3xl shrink-0 transition-all ${
                              unlocked ? '' : 'grayscale opacity-40'
                            }`}
                          >
                            {isHidden ? '❓' : ev.def.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold truncate ${
                                unlocked ? 'text-amber-200' : 'text-white/70'
                              }`}
                            >
                              {isHidden ? '???' : ev.def.title}
                            </div>
                            <p
                              className={`text-xs mt-0.5 ${
                                unlocked ? 'text-amber-100/70' : 'text-white/40'
                              }`}
                            >
                              {isHidden ? '满足某个隐藏条件解锁' : ev.def.description}
                            </p>

                            {showProgress && (
                              <div className="mt-2">
                                <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
                                  <span>进度</span>
                                  <span>
                                    {ev.progress} / {ev.target}
                                  </span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500"
                                    style={{
                                      width: `${Math.min(100, ((ev.progress ?? 0) / ev.target!) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {unlocked && (
                              <div className="text-[10px] text-amber-300/60 mt-1.5">
                                {new Date(unlockedAt).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {!unlocked && (
                            <Lock size={12} className="text-white/20 shrink-0 mt-1" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
