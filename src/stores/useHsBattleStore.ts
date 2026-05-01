import { create } from 'zustand'
import type { BattleCard, BattleHero, BattlePhase, BossData, Domain } from '@/types'
import { shuffleDeck } from '@/utils/cardGenerator'

// ============================================================
// Hearthstone-style Battle Store
// ============================================================

export interface BattleLogEntry {
  id: number
  message: string
  type: 'play' | 'attack' | 'damage' | 'heal' | 'death' | 'draw' | 'info' | 'effect' | 'hero_power'
}

interface HsBattleStore {
  // State
  phase: BattlePhase
  turnNumber: number
  currentTurn: 'player' | 'enemy'

  playerHero: BattleHero
  enemyHero: BattleHero

  playerBoard: BattleCard[]
  enemyBoard: BattleCard[]
  playerHand: BattleCard[]
  enemyHand: BattleCard[]
  playerDeck: BattleCard[]
  enemyDeck: BattleCard[]

  selectedCardIndex: number | null
  selectedBoardIndex: number | null
  attackingIndex: number | null
  targetMode: boolean

  battleLog: BattleLogEntry[]
  logIdCounter: number
  animatingCard: string | null
  bossDomain: Domain

  // Actions
  startBattle: (playerDeck: BattleCard[], enemyDeck: BattleCard[], bossDomain: Domain, bossHp?: number) => void
  playCard: (handIndex: number) => void
  attackMinion: (attackerIdx: number, targetIdx: number) => void
  attackHero: (attackerIdx: number) => void
  useHeroPower: () => void
  endTurn: () => void
  selectHandCard: (index: number | null) => void
  selectBoardMinion: (index: number | null) => void
  setAttacking: (index: number | null) => void
  setTargetMode: (mode: boolean) => void

  // Internal
  drawCard: (side: 'player' | 'enemy') => void
  executeBossTurn: () => void
  checkGameEnd: () => void
}

function makeHero(hp = 30): BattleHero {
  return { hp, maxHp: hp, armor: 0, attack: 0, mana: 0, maxMana: 0, heroPowerUsed: false, fatigueDamage: 0 }
}

function addLog(state: Pick<HsBattleStore, 'battleLog' | 'logIdCounter'>, msg: string, type: BattleLogEntry['type']): { battleLog: BattleLogEntry[]; logIdCounter: number } {
  return {
    battleLog: [...state.battleLog, { id: state.logIdCounter, message: msg, type }],
    logIdCounter: state.logIdCounter + 1,
  }
}

export const useHsBattleStore = create<HsBattleStore>((set, get) => ({
  phase: 'playerTurn',
  turnNumber: 1,
  currentTurn: 'player',

  playerHero: makeHero(),
  enemyHero: makeHero(),

  playerBoard: [],
  enemyBoard: [],
  playerHand: [],
  enemyHand: [],
  playerDeck: [],
  enemyDeck: [],

  selectedCardIndex: null,
  selectedBoardIndex: null,
  attackingIndex: null,
  targetMode: false,

  battleLog: [],
  logIdCounter: 0,
  animatingCard: null,
  bossDomain: 'AI技术',

  // ==================== START BATTLE ====================
  startBattle: (playerDeck, enemyDeck, bossDomain, bossHp = 30) => {
    const pDeck = shuffleDeck([...playerDeck])
    const eDeck = shuffleDeck([...enemyDeck])

    // Draw initial hands (3 for player, 4 for enemy since enemy goes second... well in this PvE player goes first)
    const pHand = pDeck.splice(0, 3)
    const eHand = eDeck.splice(0, 4)

    set({
      phase: 'playerTurn',
      turnNumber: 1,
      currentTurn: 'player',
      playerHero: { ...makeHero(30), mana: 1, maxMana: 1 },
      enemyHero: makeHero(bossHp),
      playerBoard: [],
      enemyBoard: [],
      playerHand: pHand,
      enemyHand: eHand,
      playerDeck: pDeck,
      enemyDeck: eDeck,
      selectedCardIndex: null,
      selectedBoardIndex: null,
      attackingIndex: null,
      targetMode: false,
      battleLog: [{ id: 0, message: '⚔️ 战斗开始！', type: 'info' }],
      logIdCounter: 1,
      animatingCard: null,
      bossDomain,
    })
  },

  // ==================== PLAY CARD ====================
  playCard: (handIndex) => {
    const state = get()
    if (state.phase !== 'playerTurn' || state.currentTurn !== 'player') return
    const card = state.playerHand[handIndex]
    if (!card) return
    if (card.manaCost > state.playerHero.mana) return
    if (card.type === 'minion' && state.playerBoard.length >= 7) return

    const newHand = [...state.playerHand]
    newHand.splice(handIndex, 1)
    const newHero = { ...state.playerHero, mana: state.playerHero.mana - card.manaCost }
    const log = addLog(state, `🃏 打出 ${card.isSecret ? '✨' : ''}${card.name} (${card.manaCost}费)`, 'play')

    if (card.type === 'minion') {
      const boardCard: BattleCard = {
        ...card,
        canAttack: card.effects.includes('charge'),
        hasAttacked: false,
        isDead: false,
      }
      const newBoard = [...state.playerBoard, boardCard]

      // Battlecry effects
      let extraLog = log
      if (card.effects.includes('battlecry')) {
        if (card.effectText.includes('抽一张')) {
          setTimeout(() => get().drawCard('player'), 300)
          extraLog = addLog(extraLog, `💫 ${card.name} 的战吼：抽一张卡`, 'effect')
        } else if (card.effectText.includes('造成') && card.effectText.includes('伤害')) {
          // Deal damage to random enemy minion
          const eb = [...state.enemyBoard]
          if (eb.length > 0) {
            const target = Math.floor(Math.random() * eb.length)
            eb[target] = { ...eb[target], health: eb[target].health - 2 }
            if (eb[target].health <= 0) eb[target].isDead = true
            set({ enemyBoard: eb.filter(c => !c.isDead) })
            extraLog = addLog(extraLog, `💫 ${card.name} 的战吼：对 ${eb[target].name} 造成2点伤害`, 'effect')
          }
        } else if (card.effectText.includes('+1攻击力') && card.effectText.includes('所有')) {
          const boosted = newBoard.map(c => c.id !== boardCard.id ? { ...c, attack: c.attack + 1 } : c)
          set({ playerBoard: boosted })
          extraLog = addLog(extraLog, `💫 ${card.name} 的战吼：所有友方随从+1攻击力`, 'effect')
        }
      }

      set({
        playerHand: newHand,
        playerBoard: newBoard,
        playerHero: newHero,
        selectedCardIndex: null,
        animatingCard: card.id,
        ...extraLog,
      })
    } else if (card.type === 'spell') {
      // Spell effects: deal damage to enemy hero
      const dmg = card.manaCost + Math.floor(Math.random() * 3) + 1
      const newEnemyHero = { ...state.enemyHero, hp: state.enemyHero.hp - dmg }
      const spellLog = addLog(log, `🔮 ${card.name} 对敌方英雄造成 ${dmg} 点伤害`, 'damage')

      set({
        playerHand: newHand,
        playerHero: newHero,
        enemyHero: newEnemyHero,
        selectedCardIndex: null,
        ...spellLog,
      })
      setTimeout(() => get().checkGameEnd(), 200)
    }

    setTimeout(() => set({ animatingCard: null }), 500)
  },

  // ==================== ATTACK MINION ====================
  attackMinion: (attackerIdx, targetIdx) => {
    const state = get()
    if (state.phase !== 'playerTurn') return

    const attacker = state.playerBoard[attackerIdx]
    const target = state.enemyBoard[targetIdx]
    if (!attacker || !target || attacker.hasAttacked || !attacker.canAttack) return

    // Check taunt
    const hasTaunt = state.enemyBoard.some(c => c.effects.includes('taunt') && !c.isDead)
    if (hasTaunt && !target.effects.includes('taunt')) return

    const newPlayerBoard = [...state.playerBoard]
    const newEnemyBoard = [...state.enemyBoard]

    newPlayerBoard[attackerIdx] = {
      ...attacker,
      health: attacker.health - target.attack,
      hasAttacked: true,
      canAttack: false,
      isDead: attacker.health - target.attack <= 0,
    }
    newEnemyBoard[targetIdx] = {
      ...target,
      health: target.health - attacker.attack,
      isDead: target.health - attacker.attack <= 0,
    }

    const log = addLog(state, `⚔️ ${attacker.name}(${attacker.attack}) 攻击 ${target.name}(${target.attack}/${target.health})`, 'attack')

    set({
      playerBoard: newPlayerBoard.filter(c => !c.isDead),
      enemyBoard: newEnemyBoard.filter(c => !c.isDead),
      attackingIndex: null,
      targetMode: false,
      ...log,
    })
    get().checkGameEnd()
  },

  // ==================== ATTACK HERO ====================
  attackHero: (attackerIdx) => {
    const state = get()
    if (state.phase !== 'playerTurn') return

    const attacker = state.playerBoard[attackerIdx]
    if (!attacker || attacker.hasAttacked || !attacker.canAttack) return

    // Check taunt
    const hasTaunt = state.enemyBoard.some(c => c.effects.includes('taunt') && !c.isDead)
    if (hasTaunt) return

    const newPlayerBoard = [...state.playerBoard]
    newPlayerBoard[attackerIdx] = { ...attacker, hasAttacked: true, canAttack: false }

    const newEnemyHero = {
      ...state.enemyHero,
      hp: state.enemyHero.hp - attacker.attack,
    }

    const log = addLog(state, `⚔️ ${attacker.name} 攻击敌方英雄，造成 ${attacker.attack} 点伤害！`, 'attack')

    set({
      playerBoard: newPlayerBoard,
      enemyHero: newEnemyHero,
      attackingIndex: null,
      targetMode: false,
      ...log,
    })
    get().checkGameEnd()
  },

  // ==================== HERO POWER ====================
  useHeroPower: () => {
    const state = get()
    if (state.phase !== 'playerTurn' || state.playerHero.heroPowerUsed || state.playerHero.mana < 2) return

    const newHero = { ...state.playerHero, mana: state.playerHero.mana - 2, heroPowerUsed: true }
    let log: ReturnType<typeof addLog>

    // Domain-based hero power
    switch (state.bossDomain) {
      case 'AI技术': {
        // Deal 1 damage to random enemy minion
        const eb = [...state.enemyBoard]
        if (eb.length > 0) {
          const idx = Math.floor(Math.random() * eb.length)
          eb[idx] = { ...eb[idx], health: eb[idx].health - 1, isDead: eb[idx].health - 1 <= 0 }
          set({ enemyBoard: eb.filter(c => !c.isDead) })
          log = addLog(state, `🧠 智能分析：对 ${eb[idx].name} 造成1点伤害`, 'hero_power')
        } else {
          const eHero = { ...state.enemyHero, hp: state.enemyHero.hp - 1 }
          set({ enemyHero: eHero })
          log = addLog(state, '🧠 智能分析：对敌方英雄造成1点伤害', 'hero_power')
        }
        break
      }
      default: {
        // Draw a card (default)
        get().drawCard('player')
        log = addLog(state, '💡 英雄技能：抽一张卡', 'hero_power')
        break
      }
    }

    set({ playerHero: newHero, ...log })
    get().checkGameEnd()
  },

  // ==================== END TURN ====================
  endTurn: () => {
    const state = get()
    if (state.phase !== 'playerTurn') return

    set({
      phase: 'enemyTurn',
      currentTurn: 'enemy',
      selectedCardIndex: null,
      selectedBoardIndex: null,
      attackingIndex: null,
      targetMode: false,
    })

    // Enemy turn executes after a short delay
    setTimeout(() => get().executeBossTurn(), 800)
  },

  // ==================== DRAW CARD ====================
  drawCard: (side) => {
    set((state) => {
      if (side === 'player') {
        if (state.playerDeck.length === 0) {
          const fatigue = state.playerHero.fatigueDamage + 1
          return {
            playerHero: {
              ...state.playerHero,
              hp: state.playerHero.hp - fatigue,
              fatigueDamage: fatigue,
            },
            ...addLog(state, `💀 牌库已空！疲劳伤害 ${fatigue}`, 'damage'),
          }
        }
        if (state.playerHand.length >= 10) {
          const burned = state.playerDeck[0]
          return {
            playerDeck: state.playerDeck.slice(1),
            ...addLog(state, `🔥 手牌已满！${burned.name} 被烧毁`, 'info'),
          }
        }
        const drawn = state.playerDeck[0]
        return {
          playerHand: [...state.playerHand, drawn],
          playerDeck: state.playerDeck.slice(1),
          ...addLog(state, `📥 抽到 ${drawn.name}`, 'draw'),
        }
      } else {
        if (state.enemyDeck.length === 0) {
          const fatigue = state.enemyHero.fatigueDamage + 1
          return {
            enemyHero: {
              ...state.enemyHero,
              hp: state.enemyHero.hp - fatigue,
              fatigueDamage: fatigue,
            },
          }
        }
        if (state.enemyHand.length >= 10) {
          return { enemyDeck: state.enemyDeck.slice(1) }
        }
        return {
          enemyHand: [...state.enemyHand, state.enemyDeck[0]],
          enemyDeck: state.enemyDeck.slice(1),
        }
      }
    })
  },

  // ==================== BOSS AI TURN ====================
  executeBossTurn: () => {
    const state = get()

    // Increase mana
    const newMaxMana = Math.min(10, state.enemyHero.maxMana + 1)
    const newEnemyHero = {
      ...state.enemyHero,
      maxMana: newMaxMana,
      mana: newMaxMana,
      heroPowerUsed: false,
    }
    set({ enemyHero: newEnemyHero })

    // Draw a card
    get().drawCard('enemy')

    // Simple AI: play cards and attack
    setTimeout(() => {
      const s = get()
      let mana = s.enemyHero.mana
      const newHand = [...s.enemyHand]
      const newBoard = [...s.enemyBoard]
      const logs: { msg: string; type: BattleLogEntry['type'] }[] = []

      // Play affordable cards
      const playable = newHand
        .map((c, i) => ({ card: c, idx: i }))
        .filter(({ card }) => card.manaCost <= mana && (card.type !== 'minion' || newBoard.length < 7))
        .sort((a, b) => b.card.manaCost - a.card.manaCost)

      for (const { card, idx } of playable) {
        if (card.manaCost > mana) continue
        if (card.type === 'minion' && newBoard.length >= 7) continue

        mana -= card.manaCost
        const handIdx = newHand.indexOf(card)
        if (handIdx !== -1) newHand.splice(handIdx, 1)

        if (card.type === 'minion') {
          newBoard.push({ ...card, canAttack: card.effects.includes('charge'), hasAttacked: false, isDead: false })
          logs.push({ msg: `👹 Boss打出 ${card.name} (${card.manaCost}费)`, type: 'play' })
        } else if (card.type === 'spell') {
          const dmg = card.manaCost + Math.floor(Math.random() * 2) + 1
          set(st => ({ playerHero: { ...st.playerHero, hp: st.playerHero.hp - dmg } }))
          logs.push({ msg: `👹 Boss使用 ${card.name}，造成 ${dmg} 点伤害`, type: 'damage' })
        }
      }

      set(st => ({
        enemyHand: newHand,
        enemyBoard: newBoard,
        enemyHero: { ...st.enemyHero, mana },
      }))

      // Attack with minions
      setTimeout(() => {
        const s2 = get()
        const atkBoard = [...s2.enemyBoard]
        let pBoard = [...s2.playerBoard]
        let pHero = { ...s2.playerHero }
        const atkLogs: { msg: string; type: BattleLogEntry['type'] }[] = []

        for (let i = 0; i < atkBoard.length; i++) {
          const minion = atkBoard[i]
          if (!minion.canAttack || minion.hasAttacked || minion.isDead) continue

          // Prioritize taunt, then face
          const tauntTarget = pBoard.findIndex(c => c.effects.includes('taunt') && !c.isDead)
          if (tauntTarget !== -1) {
            // Attack taunt
            pBoard[tauntTarget] = { ...pBoard[tauntTarget], health: pBoard[tauntTarget].health - minion.attack }
            atkBoard[i] = { ...minion, health: minion.health - pBoard[tauntTarget].attack, hasAttacked: true, canAttack: false }
            if (pBoard[tauntTarget].health <= 0) pBoard[tauntTarget].isDead = true
            if (atkBoard[i].health <= 0) atkBoard[i].isDead = true
            atkLogs.push({ msg: `👹 ${minion.name} 攻击 ${pBoard[tauntTarget].name}`, type: 'attack' })
          } else if (pBoard.length > 0 && Math.random() > 0.4) {
            // Attack a random minion
            const target = Math.floor(Math.random() * pBoard.length)
            pBoard[target] = { ...pBoard[target], health: pBoard[target].health - minion.attack }
            atkBoard[i] = { ...minion, health: minion.health - pBoard[target].attack, hasAttacked: true, canAttack: false }
            if (pBoard[target].health <= 0) pBoard[target].isDead = true
            if (atkBoard[i].health <= 0) atkBoard[i].isDead = true
            atkLogs.push({ msg: `👹 ${minion.name} 攻击 ${pBoard[target].name}`, type: 'attack' })
          } else {
            // Go face
            pHero = { ...pHero, hp: pHero.hp - minion.attack }
            atkBoard[i] = { ...minion, hasAttacked: true, canAttack: false }
            atkLogs.push({ msg: `👹 ${minion.name} 攻击你的英雄，造成 ${minion.attack} 点伤害`, type: 'attack' })
          }
        }

        // Apply all logs
        let logState = { battleLog: get().battleLog, logIdCounter: get().logIdCounter }
        for (const l of [...logs, ...atkLogs]) {
          logState = addLog(logState, l.msg, l.type)
        }

        // Start player turn
        const nextTurn = s2.turnNumber + 1
        const nextMaxMana = Math.min(10, s2.playerHero.maxMana + 1)

        set({
          enemyBoard: atkBoard.filter(c => !c.isDead),
          playerBoard: pBoard.filter(c => !c.isDead),
          playerHero: {
            ...pHero,
            maxMana: nextMaxMana,
            mana: nextMaxMana,
            heroPowerUsed: false,
          },
          phase: 'playerTurn',
          currentTurn: 'player',
          turnNumber: nextTurn,
          ...logState,
        })

        // Refresh player minion attacks
        set(st => ({
          playerBoard: st.playerBoard.map(c => ({ ...c, canAttack: true, hasAttacked: false })),
        }))

        // Draw card for player
        get().drawCard('player')
        get().checkGameEnd()
      }, 1200)
    }, 600)
  },

  // ==================== CHECK GAME END ====================
  checkGameEnd: () => {
    const state = get()
    if (state.enemyHero.hp <= 0) {
      set({
        phase: 'victory',
        ...addLog(state, '🎉 胜利！敌方英雄被击败！', 'info'),
      })
    } else if (state.playerHero.hp <= 0) {
      set({
        phase: 'defeat',
        ...addLog(state, '💀 失败...你的英雄被击败了', 'info'),
      })
    }
  },

  // ==================== SELECTION ====================
  selectHandCard: (index) => set({ selectedCardIndex: index, attackingIndex: null, targetMode: false }),
  selectBoardMinion: (index) => set({ selectedBoardIndex: index }),
  setAttacking: (index) => set({ attackingIndex: index, selectedCardIndex: null, targetMode: index !== null }),
  setTargetMode: (mode) => set({ targetMode: mode }),
}))
