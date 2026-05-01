import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Heart, Droplets, Shield, Zap, ArrowLeft, SkipForward, BookOpen } from 'lucide-react'
import { useHsBattleStore } from '@/stores/useHsBattleStore'
import { getDomainColor, getDomainIcon } from '@/data/domains'
import type { BattleCard } from '@/types'

// ============================================================
// Single Card Component
// ============================================================
function MinionCard({
  card, onClick, onRightClick, isSelected, isEnemy, isInHand, compact,
}: {
  card: BattleCard
  onClick?: () => void
  onRightClick?: (e: React.MouseEvent) => void
  isSelected?: boolean
  isEnemy?: boolean
  isInHand?: boolean
  compact?: boolean
}) {
  const color = getDomainColor(card.domain)
  const isSecret = card.isSecret

  if (compact) {
    // Board minion (compact view)
    return (
      <motion.div
        className={`relative w-20 h-28 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer select-none transition-all ${
          isSelected ? 'ring-2 ring-yellow-400 scale-110' : ''
        } ${card.canAttack && !card.hasAttacked && !isEnemy ? 'ring-1 ring-green-400/50' : ''} ${
          card.effects.includes('taunt') ? 'ring-2 ring-amber-400/60' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${isSecret ? '#fbbf2410' : color + '10'}, ${isSecret ? '#fbbf2405' : color + '05'})`,
          borderColor: isSelected ? '#facc15' : isSecret ? '#fbbf24' : color + '60',
        }}
        onClick={onClick}
        onContextMenu={onRightClick}
        whileHover={{ y: -4, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0, y: -20 }}
      >
        {/* Mana cost */}
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
          {card.manaCost}
        </div>

        {/* Secret badge */}
        {isSecret && (
          <div className="absolute -top-2 -right-2 text-sm">✨</div>
        )}

        {/* Taunt visual */}
        {card.effects.includes('taunt') && (
          <div className="absolute inset-0 rounded-xl border-2 border-amber-400/40 pointer-events-none" />
        )}

        {/* Icon */}
        <span className="text-xl mb-0.5">{card.artIcon}</span>
        <span className="text-[9px] text-gray-300 font-medium text-center leading-tight px-1 truncate w-full">{card.name}</span>

        {/* Stats */}
        {card.type === 'minion' && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-yellow-400">⚔️{card.attack}</span>
            <span className="text-xs font-bold text-red-400">❤️{card.health}</span>
          </div>
        )}

        {/* Can attack indicator */}
        {card.canAttack && !card.hasAttacked && !isEnemy && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
      </motion.div>
    )
  }

  // Hand card (full view)
  return (
    <motion.div
      className={`relative w-24 h-36 rounded-xl border-2 flex flex-col items-center cursor-pointer select-none overflow-hidden ${
        isSelected ? 'ring-2 ring-yellow-400' : ''
      }`}
      style={{
        background: `linear-gradient(180deg, ${isSecret ? '#fbbf2418' : color + '18'}, #1a1a2e)`,
        borderColor: isSecret ? '#fbbf24' : color + '80',
      }}
      onClick={onClick}
      whileHover={{ y: -16, scale: 1.08, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {/* Mana */}
      <div className="absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
        {card.manaCost}
      </div>

      {/* Secret */}
      {isSecret && (
        <div className="absolute top-0.5 right-1 text-base">✨</div>
      )}

      {/* Art area */}
      <div className="w-full flex-1 flex items-center justify-center pt-2">
        <span className="text-3xl">{card.artIcon}</span>
      </div>

      {/* Name */}
      <div className="w-full px-1 text-center">
        <p className="text-[9px] font-bold text-white leading-tight truncate">{card.name}</p>
      </div>

      {/* Effect text */}
      <div className="w-full px-1 py-0.5">
        <p className="text-[7px] text-gray-400 leading-tight line-clamp-2 text-center">{card.effectText || card.description}</p>
      </div>

      {/* Stats */}
      {card.type === 'minion' && (
        <div className="w-full flex justify-between px-1.5 pb-1">
          <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1 rounded">⚔️{card.attack}</span>
          <span className="text-xs font-bold text-red-400 bg-red-400/10 px-1 rounded">❤️{card.health}</span>
        </div>
      )}
      {card.type === 'spell' && (
        <div className="w-full text-center pb-1">
          <span className="text-[8px] text-purple-400 font-medium">法术</span>
        </div>
      )}
    </motion.div>
  )
}

// ============================================================
// Hero Component
// ============================================================
function HeroPortrait({ hp, maxHp, mana, maxMana, armor, heroPowerUsed, isEnemy, portrait, onHeroPowerClick, onHeroClick }: {
  hp: number; maxHp: number; mana: number; maxMana: number; armor: number
  heroPowerUsed: boolean; isEnemy: boolean; portrait: string
  onHeroPowerClick?: () => void; onHeroClick?: () => void
}) {
  const hpPct = Math.max(0, hp / maxHp * 100)
  return (
    <div className="flex items-center gap-3">
      {/* Hero avatar */}
      <motion.div
        className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl cursor-pointer ${
          isEnemy ? 'border-red-500/50 bg-red-500/10' : 'border-indigo-500/50 bg-indigo-500/10'
        }`}
        onClick={onHeroClick}
        whileHover={onHeroClick ? { scale: 1.05 } : {}}
      >
        {portrait}
        {/* HP overlay */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900/90 rounded-full px-2 py-0.5">
          <Heart size={10} className="text-red-400" />
          <span className={`text-xs font-bold ${hp <= 10 ? 'text-red-400' : 'text-white'}`}>{hp}</span>
          {armor > 0 && <span className="text-xs text-gray-400">+{armor}</span>}
        </div>
      </motion.div>

      {/* Mana crystals */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxMana }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full border ${
              i < mana ? 'bg-blue-500 border-blue-400' : 'bg-gray-800 border-gray-700'
            }`} />
          ))}
        </div>
        <span className="text-[10px] text-blue-400 font-medium">{mana}/{maxMana}</span>
      </div>

      {/* Hero power */}
      {!isEnemy && onHeroPowerClick && (
        <button
          onClick={onHeroPowerClick}
          disabled={heroPowerUsed || mana < 2}
          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg transition-all ${
            heroPowerUsed || mana < 2
              ? 'opacity-40 border-gray-700 bg-gray-800 cursor-not-allowed'
              : 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 cursor-pointer'
          }`}
        >
          🧠
        </button>
      )}
    </div>
  )
}

// ============================================================
// Battle Log
// ============================================================
function BattleLog() {
  const { battleLog } = useHsBattleStore()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battleLog])

  return (
    <div ref={logRef} className="absolute left-3 bottom-3 w-64 max-h-48 overflow-y-auto bg-gray-900/90 backdrop-blur-sm border border-gray-800/50 rounded-xl p-3 z-10">
      <h4 className="text-[10px] text-gray-500 font-semibold mb-1">战斗日志</h4>
      {battleLog.slice(-15).map(entry => (
        <div key={entry.id} className={`text-[10px] leading-relaxed ${
          entry.type === 'damage' ? 'text-red-400' :
          entry.type === 'heal' ? 'text-green-400' :
          entry.type === 'play' ? 'text-blue-400' :
          entry.type === 'attack' ? 'text-yellow-400' :
          entry.type === 'effect' ? 'text-purple-400' :
          entry.type === 'hero_power' ? 'text-purple-300' :
          'text-gray-400'
        }`}>
          {entry.message}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Main Battle Arena
// ============================================================
export function HsBattleArena({ onBack }: { onBack: () => void }) {
  const store = useHsBattleStore()
  const {
    phase, turnNumber, playerHero, enemyHero,
    playerBoard, enemyBoard, playerHand, enemyHand,
    playerDeck, enemyDeck,
    selectedCardIndex, attackingIndex, targetMode,
    playCard, attackMinion, attackHero, useHeroPower, endTurn,
    selectHandCard, setAttacking, bossDomain,
  } = store

  const isPlayerTurn = phase === 'playerTurn'
  const isGameOver = phase === 'victory' || phase === 'defeat'

  // Handle board minion click
  const handleBoardMinionClick = (index: number, isEnemy: boolean) => {
    if (!isPlayerTurn) return

    if (isEnemy && attackingIndex !== null) {
      // Attack enemy minion
      attackMinion(attackingIndex, index)
    } else if (!isEnemy) {
      const minion = playerBoard[index]
      if (minion.canAttack && !minion.hasAttacked) {
        setAttacking(index)
      }
    }
  }

  // Handle enemy hero click
  const handleEnemyHeroClick = () => {
    if (!isPlayerTurn || attackingIndex === null) return
    attackHero(attackingIndex)
  }

  // Handle hand card click
  const handleHandCardClick = (index: number) => {
    if (!isPlayerTurn) return
    const card = playerHand[index]
    if (card.manaCost <= playerHero.mana) {
      playCard(index)
    }
  }

  return (
    <div className="w-full h-screen bg-gray-950 relative overflow-hidden select-none">
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-95 brightness-[1.18] saturate-[1.1]"
        style={{ backgroundImage: "url('/assets/backgrounds/knowledge-quest-bg.png')" }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,_rgba(3,5,15,0.48)_0%,_rgba(15,23,42,0.22)_45%,_rgba(3,5,15,0.68)_100%)]" />
      <div className="absolute inset-x-0 top-[45%] h-[18%] pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.18)_0%,_rgba(14,165,233,0.06)_42%,_transparent_72%)]" />

      {/* Board pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #6366f1 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-20 bg-gray-950/60 backdrop-blur-sm border-b border-gray-800/30">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} /> 返回
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">回合 {turnNumber}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPlayerTurn ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {isPlayerTurn ? '你的回合' : phase === 'enemyTurn' ? 'Boss回合' : ''}
          </span>
          <span className="text-xs text-gray-500">🃏 {playerDeck.length}</span>
        </div>
      </div>

      {/* ==================== ENEMY AREA ==================== */}
      <div className="absolute top-12 left-0 right-0 h-[40%] flex flex-col">
        {/* Enemy hero */}
        <div className="flex justify-center py-3">
          <HeroPortrait
            hp={enemyHero.hp} maxHp={enemyHero.maxHp} mana={enemyHero.mana} maxMana={enemyHero.maxMana}
            armor={enemyHero.armor} heroPowerUsed={enemyHero.heroPowerUsed} isEnemy={true}
            portrait={getDomainIcon(bossDomain)}
            onHeroClick={targetMode ? handleEnemyHeroClick : undefined}
          />
        </div>

        {/* Enemy hand (face down) */}
        <div className="flex justify-center gap-1 px-4">
          {enemyHand.map((_, i) => (
            <div key={i} className="w-8 h-12 rounded-lg bg-red-900/40 border border-red-800/30" />
          ))}
        </div>

        {/* Enemy board */}
        <div className="flex-1 flex items-end justify-center gap-2 pb-3 px-4">
          <AnimatePresence>
            {enemyBoard.map((card, i) => (
              <MinionCard key={card.id} card={card} compact isEnemy
                onClick={() => handleBoardMinionClick(i, true)}
                isSelected={targetMode && !card.isDead}
              />
            ))}
          </AnimatePresence>
          {enemyBoard.length === 0 && (
            <div className="text-gray-700 text-xs">敌方场地</div>
          )}
        </div>
      </div>

      {/* ==================== DIVIDER ==================== */}
      <div className="absolute top-[52%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

      {/* ==================== PLAYER AREA ==================== */}
      <div className="absolute bottom-0 left-0 right-0 h-[48%] flex flex-col">
        {/* Player board */}
        <div className="flex-1 flex items-start justify-center gap-2 pt-3 px-4">
          <AnimatePresence>
            {playerBoard.map((card, i) => (
              <MinionCard key={card.id} card={card} compact
                onClick={() => handleBoardMinionClick(i, false)}
                isSelected={attackingIndex === i}
              />
            ))}
          </AnimatePresence>
          {playerBoard.length === 0 && (
            <div className="text-gray-700 text-xs mt-4">你的场地</div>
          )}
        </div>

        {/* Player hero + end turn */}
        <div className="flex items-center justify-center gap-4 py-2">
          <HeroPortrait
            hp={playerHero.hp} maxHp={playerHero.maxHp} mana={playerHero.mana} maxMana={playerHero.maxMana}
            armor={playerHero.armor} heroPowerUsed={playerHero.heroPowerUsed} isEnemy={false}
            portrait="🧙‍♂️"
            onHeroPowerClick={useHeroPower}
          />
          {isPlayerTurn && (
            <motion.button
              onClick={endTurn}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SkipForward size={14} className="inline mr-1" />
              结束回合
            </motion.button>
          )}
        </div>

        {/* Player hand */}
        <div className="flex justify-center gap-1 px-8 pb-3 overflow-x-auto">
          <AnimatePresence>
            {playerHand.map((card, i) => {
              const canPlay = isPlayerTurn && card.manaCost <= playerHero.mana
              return (
                <motion.div key={card.id + '-' + i} className={`${!canPlay ? 'opacity-50' : ''}`}
                  initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                >
                  <MinionCard
                    card={card}
                    onClick={() => canPlay && handleHandCardClick(i)}
                    isSelected={selectedCardIndex === i}
                    isInHand
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Attack line indicator */}
      {targetMode && attackingIndex !== null && (
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 text-xs text-yellow-400 font-medium animate-pulse z-20">
          ⚔️ 选择攻击目标 (点击敌方随从或英雄)
        </div>
      )}

      {/* Battle Log */}
      <BattleLog />

      {/* ==================== GAME OVER OVERLAY ==================== */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="text-7xl mb-4">
                {phase === 'victory' ? '🎉' : '💀'}
              </div>
              <h2 className={`text-4xl font-bold mb-2 ${phase === 'victory' ? 'text-yellow-400' : 'text-red-400'}`}>
                {phase === 'victory' ? '胜利！' : '失败...'}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {phase === 'victory' ? '你的知识战胜了无知！' : '继续学习，下次一定能赢！'}
              </p>
              <button onClick={onBack}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                返回
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enemy turn overlay */}
      <AnimatePresence>
        {phase === 'enemyTurn' && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-2xl px-8 py-4 text-center">
              <p className="text-red-400 font-bold text-lg">👹 Boss 回合</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
