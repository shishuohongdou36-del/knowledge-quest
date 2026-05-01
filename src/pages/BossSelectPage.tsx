import { motion } from 'framer-motion'
import { Swords, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BOSSES } from '@/data/bosses'
import { getDomainColor } from '@/data/domains'
import type { BossData, Domain } from '@/types'

const DIFFICULTY_LABEL: Record<BossData['difficulty'], string> = {
  normal: '普通',
  elite: '精英',
  legendary: '传说',
}

const DIFFICULTY_STYLE: Record<BossData['difficulty'], string> = {
  normal: 'bg-gray-700/50 text-gray-300',
  elite: 'bg-purple-500/15 text-purple-300',
  legendary: 'bg-amber-500/15 text-amber-300',
}

export function BossSelectPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords size={20} className="text-red-400" />
            选择对手
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOSSES.map((boss) => {
            const color = getDomainColor(boss.domain as Domain)
            return (
              <motion.button
                key={boss.id}
                className="text-left bg-gray-900/60 border border-gray-800/50 rounded-xl p-5 hover:border-gray-600/60 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/battle/${boss.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-3xl"
                    style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}
                  >
                    {boss.portrait}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{boss.name}</h3>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span style={{ color }}>{boss.domain}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_STYLE[boss.difficulty]}`}>
                        {DIFFICULTY_LABEL[boss.difficulty]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>❤️ 生命值：{boss.hp}</div>
                  <div className="text-gray-500 truncate">⚡ {boss.heroPowerText}</div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
