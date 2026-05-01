import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Zap } from 'lucide-react'
import type { KnowledgeCard } from '@/types'
import { getDomainInfo } from '@/data/domains'

interface Props {
  card: KnowledgeCard
  onClick: (card: KnowledgeCard) => void
}

export function KnowledgeCardItem({ card, onClick }: Props) {
  const [isFlipped, setIsFlipped] = useState(false)
  const domain = getDomainInfo(card.domain)

  const handleClick = () => {
    if (isFlipped) {
      onClick(card)
    } else {
      setIsFlipped(true)
    }
  }

  const handleMouseLeave = () => {
    setIsFlipped(false)
  }

  return (
    <div
      className="perspective-1000 w-full h-[320px] cursor-pointer"
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, ${domain?.color}15, ${domain?.color}08)`,
            border: `1px solid ${domain?.color}30`,
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{domain?.icon}</span>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: `${domain?.color}20`, color: domain?.color }}
              >
                Lv.{card.level}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{card.summary}</p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Swords size={14} />
              <span>{card.bossCard.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: domain?.color }}>
              <Zap size={14} />
              <span>HP {card.bossCard.hp}</span>
            </div>
          </div>

          {/* Glow effect */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: domain?.color }}
          />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${domain?.color}20, ${domain?.color}10)`,
            border: `1px solid ${domain?.color}40`,
          }}
        >
          <h4 className="text-sm font-bold text-white mb-3">🔑 核心知识点</h4>
          <ul className="space-y-2 flex-1">
            {card.keyPoints.map((point, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-2">
                <span style={{ color: domain?.color }}>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 italic">点击查看完整详情 →</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
