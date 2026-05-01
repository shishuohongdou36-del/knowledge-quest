import { motion } from 'framer-motion'
import type { KnowledgeNode } from '@/types'
import { generateCardFromKnowledge } from '@/utils/cardGenerator'
import { currentMastery, masteryMultiplier } from '@/utils/memoryDecay'
import { getDomainColor, getDomainIcon } from '@/data/domains'
import { Droplets, Swords, Heart } from 'lucide-react'

// ============================================================
// Compact card preview tile used by the deck builder + battle picker.
// Shows mana / atk / hp from live mastery, plus disabled state when forgotten.
// ============================================================

export interface CardPreviewProps {
  node: KnowledgeNode
  /** number of times this card already appears in the active deck */
  copies?: number
  onClick?: () => void
  size?: 'sm' | 'md'
  selected?: boolean
}

export function CardPreview({ node, copies = 0, onClick, size = 'md', selected = false }: CardPreviewProps) {
  const live = currentMastery(node)
  const mult = masteryMultiplier(live)
  const disabled = mult <= 0
  const card = generateCardFromKnowledge(node)
  const color = node.source === 'user' ? '#fbbf24' : getDomainColor(node.domain)
  const icon = node.source === 'user' ? '✨' : getDomainIcon(node.domain)

  const dim = size === 'sm'

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`relative text-left w-full rounded-lg overflow-hidden transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'
      } ${selected ? 'ring-2 ring-indigo-400' : 'ring-1 ring-white/10'}`}
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}08)`,
        borderColor: color,
      }}
    >
      <div className={`flex items-center gap-2 ${dim ? 'p-1.5' : 'p-2.5'}`}>
        {/* Mana */}
        <div
          className={`shrink-0 ${dim ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow`}
        >
          {card.manaCost}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-1 ${dim ? 'text-[11px]' : 'text-xs'} font-semibold text-white truncate`}>
            <span>{icon}</span>
            <span className="truncate">{card.name}</span>
          </div>
          <div className={`flex items-center gap-2 ${dim ? 'text-[9px]' : 'text-[10px]'} text-white/60 mt-0.5`}>
            {card.type === 'minion' ? (
              <>
                <span className="flex items-center gap-0.5 text-amber-300">
                  <Swords size={dim ? 8 : 10} />
                  {card.attack}
                </span>
                <span className="flex items-center gap-0.5 text-rose-300">
                  <Heart size={dim ? 8 : 10} />
                  {card.health}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-0.5 text-violet-300">
                <Droplets size={dim ? 8 : 10} /> 法术
              </span>
            )}
            <span className="ml-auto text-white/40">{Math.round(live)}%</span>
          </div>
        </div>
      </div>

      {copies > 0 && (
        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white">
          ×{copies}
        </div>
      )}

      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] px-2 py-0.5 bg-rose-900/80 text-rose-200 rounded">已遗忘</span>
        </div>
      )}
    </motion.button>
  )
}
