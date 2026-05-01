import { motion } from 'framer-motion'
import { X, Link2, BookOpen } from 'lucide-react'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useUIStore } from '@/stores/useUIStore'
import { getDomainColor, getDomainIcon } from '@/data/domains'
import { currentMastery, decayState } from '@/utils/memoryDecay'
import type { KnowledgeNode } from '@/types'

const STATE_COLOR: Record<string, string> = {
  full: '#10b981',
  weak: '#f59e0b',
  fragile: '#ef4444',
  forgotten: '#6b7280',
}

const STATE_LABEL: Record<string, string> = {
  full: '💪 全力',
  weak: '⚡ 衰退中',
  fragile: '⚠️ 虚弱',
  forgotten: '💀 遗忘',
}

export function NodeDetailPanel({
  node,
  onClose,
  onEdit,
}: {
  node: KnowledgeNode
  onClose: () => void
  onEdit: () => void
}) {
  const { reinforceNode, nodes } = useKnowledgeStore()
  const pushToast = useUIStore((s) => s.pushToast)
  const color = getDomainColor(node.domain)
  const icon = getDomainIcon(node.domain)

  const live = Math.round(currentMastery(node))
  const state = decayState(live)
  const stateColor = STATE_COLOR[state]

  const handleReview = () => {
    const gained = reinforceNode(node.id, 'reread')
    if (gained > 0) pushToast(`+${gained} 掌握度`, 'success')
    else pushToast('今日复习次数已用完', 'info')
  }

  return (
    <motion.div
      className="absolute right-4 top-4 bottom-4 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 overflow-y-auto z-20"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{node.source === 'user' ? '✨' : icon}</span>
          <div>
            <h3 className="font-bold text-white text-sm">{node.title}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: color + '20', color }}
            >
              {node.domain}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">实时掌握度</span>
          <span style={{ color: stateColor }}>
            {live}% · {STATE_LABEL[state]}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${live}%`, backgroundColor: stateColor }}
          />
        </div>
        {node.lastReview && (
          <div className="text-[10px] text-gray-500 mt-1">
            上次复习：{new Date(node.lastReview).toLocaleString()}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-300 leading-relaxed">{node.content}</p>
      </div>

      {node.tags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 mb-1.5">标签</h4>
          <div className="flex flex-wrap gap-1.5">
            {node.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.links.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 mb-1.5">
            <Link2 size={10} className="inline mr-1" />
            关联知识（{node.links.length}）
          </h4>
          <div className="space-y-1">
            {node.links.map((lid) => {
              const ln = nodes.find((n) => n.id === lid)
              return ln ? (
                <div key={lid} className="text-xs text-gray-300 flex items-center gap-1.5">
                  <span>{getDomainIcon(ln.domain)}</span> {ln.title}
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      {node.source === 'user' && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300">✨ 这是你的自定义知识，已生成专属秘技卡！</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleReview}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1"
        >
          <BookOpen size={12} /> 复习（+20 掌握度）
        </button>
        <button
          onClick={onEdit}
          className="py-2 px-3 rounded-lg text-xs font-medium bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-all"
        >
          编辑
        </button>
      </div>
    </motion.div>
  )
}
