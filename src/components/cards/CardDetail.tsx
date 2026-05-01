import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, AlertTriangle, Target, Swords, Heart } from 'lucide-react'
import type { KnowledgeCard } from '@/types'
import { getDomainInfo } from '@/data/domains'
import { getCardById } from '@/data/knowledge'

interface Props {
  card: KnowledgeCard | null
  onClose: () => void
  onNavigate: (card: KnowledgeCard) => void
}

export function CardDetail({ card, onClose, onNavigate }: Props) {
  if (!card) return null
  const domain = getDomainInfo(card.domain)

  const handleLinkClick = (linkId: string) => {
    const linked = getCardById(linkId)
    if (linked) onNavigate(linked)
  }

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-700/50 bg-gray-900/95 backdrop-blur-xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-6 py-4 border-b border-gray-700/50 flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${domain?.color}15, transparent)`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{domain?.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{card.title}</h2>
                  <p className="text-sm text-gray-400">
                    {card.domain} · Lv.{card.level}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Summary */}
              <p className="text-gray-300 leading-relaxed">{card.summary}</p>

              {/* Key Points */}
              <Section title="🔑 核心知识点" color={domain?.color}>
                {card.keyPoints.map((p, i) => (
                  <li key={i} className="text-sm text-gray-300">{p}</li>
                ))}
              </Section>

              {/* Limitations */}
              <Section title="⚠️ 局限与边界" color="#f59e0b" icon={<AlertTriangle size={16} />}>
                {card.limitations.map((l, i) => (
                  <li key={i} className="text-sm text-gray-300">{l}</li>
                ))}
              </Section>

              {/* Counter Scenarios */}
              <Section title="🎯 反制场景" color="#ef4444" icon={<Target size={16} />}>
                {card.counterScenarios.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300">{s}</li>
                ))}
              </Section>

              {/* Boss Card */}
              <div
                className="rounded-xl p-4 border"
                style={{
                  background: `linear-gradient(135deg, #dc262610, #dc262605)`,
                  borderColor: '#dc262630',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Swords size={16} className="text-red-400" />
                  <h4 className="text-sm font-bold text-red-400">Boss: {card.bossCard.name}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart size={14} className="text-red-500" />
                    HP {card.bossCard.hp}
                  </span>
                  <span>攻击方式: {card.bossCard.attack}</span>
                </div>
              </div>

              {/* Cross Links */}
              {card.crossLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-blue-400">关联知识</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {card.crossLinks.map((linkId) => {
                      const linked = getCardById(linkId)
                      const linkedDomain = linked ? getDomainInfo(linked.domain) : null
                      return (
                        <button
                          key={linkId}
                          onClick={() => handleLinkClick(linkId)}
                          className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                          style={{
                            borderColor: linkedDomain ? `${linkedDomain.color}40` : '#4b556340',
                            color: linkedDomain?.color ?? '#9ca3af',
                            backgroundColor: linkedDomain ? `${linkedDomain.color}10` : '#4b556310',
                          }}
                        >
                          {linked ? `${linkedDomain?.icon} ${linked.title}` : linkId}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Section({
  title,
  color,
  icon,
  children,
}: {
  title: string
  color?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-bold" style={{ color: color ?? '#fff' }}>
          {title}
        </h4>
      </div>
      <ul className="space-y-1.5 list-disc list-inside ml-1">{children}</ul>
    </div>
  )
}
