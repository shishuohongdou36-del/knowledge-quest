import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Shuffle, ArrowLeft, Sparkles } from 'lucide-react'
import { useHsBattleStore } from '@/stores/useHsBattleStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { getBossById } from '@/data/bosses'
import { generateDeckForDomain } from '@/utils/cardGenerator'
import { currentMastery, masteryMultiplier } from '@/utils/memoryDecay'
import { decayTuning, battleTuning, deckTuning } from '@/config/tuning'
import { HsBattleArena } from '@/components/battle/HsBattleArena'
import { ManaCurve } from '@/components/deck/ManaCurve'
import type { Domain, BattleCard, KnowledgeNode } from '@/types'

// ============================================================
// /battle/:bossId
//
// Flow:
// 1. Validate boss + minimum active knowledge nodes
// 2. If user has saved decks, show picker overlay (or auto-generate option)
// 3. Start battle with chosen deck
// ============================================================

type PickerChoice =
  | { kind: 'deckId'; id: string }
  | { kind: 'auto' }

export function BattlePage() {
  const { bossId } = useParams<{ bossId: string }>()
  const navigate = useNavigate()
  const { nodes } = useKnowledgeStore()
  const { startBattle, phase } = useHsBattleStore()
  const { updateStats, addExp, addGold } = useAuthStore()
  const reinforceNode = useKnowledgeStore((s) => s.reinforceNode)
  const { decks, buildBattleCards } = useDeckStore()
  const openConfirm = useUIStore((s) => s.openConfirm)
  const pushToast = useUIStore((s) => s.pushToast)

  const boss = bossId ? getBossById(bossId) : undefined
  const activeCount = useMemo(
    () => nodes.filter((n) => currentMastery(n) >= decayTuning.masteryFragile).length,
    [nodes],
  )

  const [picked, setPicked] = useState(false)

  // Preflight validation
  useEffect(() => {
    if (!bossId) {
      navigate('/battle', { replace: true })
      return
    }
    if (!boss) {
      pushToast('找不到这个 Boss', 'error')
      navigate('/battle', { replace: true })
      return
    }
    if (activeCount < 5) {
      pushToast('需要至少 5 个可用知识节点才能对战', 'warning')
      navigate('/graph', { replace: true })
      return
    }
    // If no saved decks, auto-start
    if (decks.length === 0) {
      startWithAuto()
      setPicked(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bossId])

  function startWithAuto() {
    if (!boss) return
    const active = nodes.filter((n) => currentMastery(n) >= decayTuning.masteryFragile)
    const playerDeck = generateDeckForDomain(active, boss.domain as Domain, battleTuning.deckSize)
    startBossBattle(playerDeck)
  }

  function startWithDeck(deckId: string) {
    if (!boss) return
    const cards = buildBattleCards(deckId, nodes)
    if (!cards || cards.length < 5) {
      pushToast('该卡组中可用卡牌不足，改用自动生成', 'warning')
      startWithAuto()
      return
    }
    startBossBattle(cards)
  }

  function startBossBattle(playerDeck: BattleCard[]) {
    if (!boss) return
    const enemyKnowledge = boss.deckCardIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is KnowledgeNode => Boolean(n))
      .map((n) => ({ ...n, mastery: 90 }))
    while (enemyKnowledge.length < 8) {
      const random = nodes[Math.floor(Math.random() * nodes.length)]
      if (random) enemyKnowledge.push({ ...random, mastery: 80 })
    }
    const enemyDeck = generateDeckForDomain(enemyKnowledge, boss.domain as Domain, battleTuning.deckSize)
    startBattle(playerDeck, enemyDeck, boss.domain as Domain, boss.hp)
    setPicked(true)
  }

  const handlePicked = (choice: PickerChoice) => {
    if (choice.kind === 'auto') startWithAuto()
    else startWithDeck(choice.id)
  }

  // Victory / Defeat side effects
  useEffect(() => {
    if (phase === 'victory') {
      const reinforcedIds = new Set<string>()
      const s = useHsBattleStore.getState()
      const allCards = [...s.playerHand, ...s.playerBoard, ...s.playerDeck]
      for (const c of allCards) {
        if (c.knowledgeId && !reinforcedIds.has(c.knowledgeId)) {
          reinforcedIds.add(c.knowledgeId)
          reinforceNode(c.knowledgeId, 'battleWin')
        }
      }
      updateStats({ battlesWon: 1 })
      addExp(50)
      addGold(20)
      pushToast(`胜利！+50 EXP, +20 金币，${reinforcedIds.size} 张卡牌的知识得到强化`, 'success')
    } else if (phase === 'defeat') {
      updateStats({ battlesLost: 1 })
      addExp(10)
      pushToast('败北。记录已保存，再接再厉。', 'info')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handleBack = () => {
    if (phase !== 'victory' && phase !== 'defeat' && picked) {
      openConfirm({
        title: '确认离开战斗？',
        message: '当前对战将被放弃，进度无法恢复。',
        confirmText: '放弃战斗',
        destructive: true,
        onConfirm: () => navigate('/battle'),
      })
    } else {
      navigate('/battle')
    }
  }

  // Show picker if not picked yet and user has decks
  if (!picked && boss && activeCount >= 5 && decks.length > 0) {
    return <DeckPicker boss={boss} onChoose={handlePicked} onBack={() => navigate('/battle')} />
  }

  return <HsBattleArena onBack={handleBack} />
}

// ============================================================
// Deck picker overlay (shown pre-battle)
// ============================================================
function DeckPicker({
  boss,
  onChoose,
  onBack,
}: {
  boss: ReturnType<typeof getBossById>
  onChoose: (choice: PickerChoice) => void
  onBack: () => void
}) {
  const { decks } = useDeckStore()
  const { nodes } = useKnowledgeStore()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-xs text-white/50">即将挑战</div>
            <h1 className="text-lg font-bold text-white">
              {boss?.name}{' '}
              <span className="text-white/40 text-sm font-normal">· {boss?.domain}</span>
            </h1>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-white/80 mb-3">选择出战卡组</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Auto-generate option */}
          <motion.button
            onClick={() => onChoose({ kind: 'auto' })}
            whileHover={{ y: -2 }}
            className="text-left bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/40 rounded-2xl p-4 hover:border-indigo-400 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shuffle size={18} className="text-indigo-300" />
              <span className="font-semibold text-white">自动生成</span>
            </div>
            <p className="text-xs text-white/60">
              根据 Boss 的知识域 ({boss?.domain}) 自动挑选 {battleTuning.deckSize} 张可用卡牌。
              新手推荐。
            </p>
          </motion.button>

          {decks.map((d) => {
            const cardNodes = d.knowledgeIds
              .map((id) => nodes.find((n) => n.id === id))
              .filter((n): n is KnowledgeNode => Boolean(n))
            const playable = cardNodes.filter((n) => masteryMultiplier(currentMastery(n)) > 0).length
            const isComplete = d.knowledgeIds.length === deckTuning.size
            const canPlay = playable >= 5
            return (
              <motion.button
                key={d.id}
                onClick={() => canPlay && onChoose({ kind: 'deckId', id: d.id })}
                disabled={!canPlay}
                whileHover={canPlay ? { y: -2 } : undefined}
                className={`text-left bg-gray-900/60 border rounded-2xl p-4 transition-all ${
                  canPlay
                    ? 'border-white/10 hover:border-indigo-400/60 cursor-pointer'
                    : 'border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={16} className="text-white/60" />
                  <span className="font-semibold text-white truncate">{d.name}</span>
                  {d.primaryDomain === boss?.domain && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-300">
                      <Sparkles size={10} /> 匹配域
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/50 mb-2">
                  {d.primaryDomain ?? '混合'} ·{' '}
                  <span className={isComplete ? 'text-emerald-300' : 'text-amber-300'}>
                    {d.knowledgeIds.length} / {deckTuning.size}
                  </span>
                  {' · '}
                  <span className={playable >= 5 ? 'text-emerald-300' : 'text-rose-300'}>
                    {playable} 可用
                  </span>
                </div>
                <ManaCurve nodes={cardNodes} />
                {!canPlay && (
                  <div className="mt-2 text-[10px] text-rose-300">
                    可用卡牌不足 5 张，无法出战
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
