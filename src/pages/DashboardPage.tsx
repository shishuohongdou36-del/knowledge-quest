import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Network, Swords, Settings as SettingsIcon, Star, Zap, AlertTriangle, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useUIStore } from '@/stores/useUIStore'
import { currentMastery, countDecayedNodes, countForgottenNodes } from '@/utils/memoryDecay'
import { decayTuning } from '@/config/tuning'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { nodes, initNodes } = useKnowledgeStore()
  const pushToast = useUIStore((s) => s.pushToast)

  useEffect(() => {
    initNodes()
  }, [initNodes])

  const stats = useMemo(() => {
    const now = Date.now()
    const userNodes = nodes.filter((n) => n.source === 'user')
    const masteryValues = nodes.map((n) => currentMastery(n, now))
    const avg = masteryValues.length
      ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
      : 0
    const decayed = countDecayedNodes(nodes, now)
    const forgotten = countForgottenNodes(nodes, now)
    const mastered = nodes.filter((n) => currentMastery(n, now) >= decayTuning.masteryFull).length
    return { userNodes, avg, decayed, forgotten, mastered }
  }, [nodes])

  const showDecayBanner = stats.decayed >= decayTuning.decayBannerThreshold

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* User header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
            {user?.avatar ?? '🧙‍♂️'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user?.username ?? '旅行者'}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span><Star size={10} className="inline text-yellow-400" /> Lv.{user?.level ?? 1}</span>
              <span><Zap size={10} className="inline text-blue-400" /> {user?.exp ?? 0} EXP</span>
              <span>💰 {user?.gold ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Decay banner */}
        {showDecayBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer"
            onClick={() => navigate('/graph')}
          >
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-amber-200 font-medium">{stats.decayed} 个知识节点正在衰退</span>
              {stats.forgotten > 0 && (
                <span className="text-rose-300 ml-2">({stats.forgotten} 已遗忘)</span>
              )}
              <span className="text-white/60 ml-2">→ 点击进入知识图谱复习</span>
            </div>
          </motion.div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: '知识节点', value: nodes.length, icon: '🧠' },
            { label: '平均掌握度', value: `${stats.avg}%`, icon: '📊' },
            { label: '自创秘技', value: stats.userNodes.length, icon: '✨' },
            { label: '已精通', value: stats.mastered, icon: '💪' },
          ].map((s) => (
            <motion.div
              key={s.label}
              className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.button
            onClick={() => navigate('/graph')}
            className="group bg-gradient-to-br from-indigo-600/15 to-purple-600/15 border border-indigo-500/20 rounded-2xl p-6 text-left hover:border-indigo-500/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Network size={28} className="text-indigo-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">知识图谱</h3>
            <p className="text-sm text-gray-400">浏览、创建、链接你的知识网络</p>
          </motion.button>

          <motion.button
            onClick={() => {
              if (nodes.filter((n) => currentMastery(n) >= decayTuning.masteryFragile).length < 5) {
                pushToast('需要至少 5 个掌握度 ≥ 30 的节点才能对战，请先学习', 'warning')
                navigate('/graph')
                return
              }
              navigate('/battle')
            }}
            className="group bg-gradient-to-br from-red-600/15 to-orange-600/15 border border-red-500/20 rounded-2xl p-6 text-left hover:border-red-500/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Swords size={28} className="text-red-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">卡牌对战</h3>
            <p className="text-sm text-gray-400">炉石风格 PvE，挑战知识域 Boss</p>
          </motion.button>

          <motion.button
            onClick={() => navigate('/decks')}
            className="group bg-gradient-to-br from-amber-600/15 to-yellow-600/15 border border-amber-500/20 rounded-2xl p-6 text-left hover:border-amber-500/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Layers size={28} className="text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">我的卡组</h3>
            <p className="text-sm text-gray-400">手工构筑专属于你的 30 张卡组</p>
          </motion.button>

          <motion.button
            onClick={() => navigate('/settings')}
            className="group bg-gradient-to-br from-emerald-600/15 to-teal-600/15 border border-emerald-500/20 rounded-2xl p-6 text-left hover:border-emerald-500/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SettingsIcon size={28} className="text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">设置</h3>
            <p className="text-sm text-gray-400">主题、数据导出、账号管理</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
