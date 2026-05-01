import type { BattleCard, BattleHero } from '@/types'
import { bossTuning, battleTuning } from '@/config/tuning'

// ============================================================
// Boss AI — heuristic action scoring per design/gdd/boss-ai.md
// Pure functions. The store calls these to derive a turn plan.
// ============================================================

export interface BossView {
  hero: BattleHero
  hand: BattleCard[]
  board: BattleCard[]
}

export interface PlayerView {
  hero: BattleHero
  board: BattleCard[]
}

export type BossAction =
  | { kind: 'playMinion'; handIndex: number; card: BattleCard }
  | { kind: 'playSpell'; handIndex: number; card: BattleCard; targetFace: true }
  | { kind: 'attackFace'; attackerIndex: number }
  | { kind: 'attackMinion'; attackerIndex: number; targetIndex: number }
  | { kind: 'endTurn' }

const FACE = bossTuning

/**
 * Returns mana cost-effectiveness ratio: higher is better.
 */
function manaValueRatio(card: BattleCard): number {
  return (card.attack + card.health) / Math.max(1, card.manaCost)
}

/**
 * Returns true if this action could finish the player.
 */
function isLethal(action: BossAction, _boss: BossView, player: PlayerView): boolean {
  if (action.kind === 'attackFace') {
    const attacker = _boss.board[action.attackerIndex]
    return !!attacker && attacker.attack >= player.hero.hp
  }
  if (action.kind === 'playSpell') {
    return action.card.manaCost + 2 >= player.hero.hp
  }
  return false
}

/**
 * Score a single legal action under a given board view.
 */
export function scoreAction(action: BossAction, boss: BossView, player: PlayerView): number {
  if (action.kind === 'endTurn') {
    // End turn baseline; lower than any productive action
    return -10
  }

  let score = 0

  if (isLethal(action, boss, player)) {
    score += FACE.wLethal
  }

  if (action.kind === 'playMinion') {
    score += FACE.wValue * manaValueRatio(action.card)
    score += FACE.wTempo * Math.min(action.card.attack, 4)
    if (action.card.effects.includes('taunt')) score += FACE.wThreat
    if (action.card.effects.includes('charge')) score += 4
  }

  if (action.kind === 'playSpell') {
    // Spells go face by default in this MVP.
    score += FACE.wValue * 2
    score += FACE.wTempo * 2
  }

  if (action.kind === 'attackMinion') {
    const attacker = boss.board[action.attackerIndex]
    const target = player.board[action.targetIndex]
    if (!attacker || !target) return -100
    // Prefer trading where we kill them and survive
    const weDie = attacker.health <= target.attack
    const theyDie = target.health <= attacker.attack
    if (theyDie && !weDie) score += FACE.wThreat * 2
    else if (theyDie && weDie) score += FACE.wThreat * 0.6
    else if (!theyDie && weDie) score -= 5
    // Always prefer breaking taunts
    if (target.effects.includes('taunt')) score += FACE.wThreat
  }

  if (action.kind === 'attackFace') {
    const attacker = boss.board[action.attackerIndex]
    if (!attacker) return -100
    score += FACE.wTempo * 2
    score += attacker.attack * 2
  }

  return score
}

// ============================================================
// Action enumeration — all currently-legal actions in the BossView.
// ============================================================
export function enumerateActions(boss: BossView, player: PlayerView): BossAction[] {
  const out: BossAction[] = []
  const taunts = player.board.filter((c) => c.effects.includes('taunt') && !c.isDead)
  const tauntActive = taunts.length > 0

  // Play cards from hand
  for (let i = 0; i < boss.hand.length; i++) {
    const card = boss.hand[i]
    if (card.manaCost > boss.hero.mana) continue
    if (card.type === 'minion') {
      if (boss.board.length >= battleTuning.boardLimit) continue
      out.push({ kind: 'playMinion', handIndex: i, card })
    } else if (card.type === 'spell') {
      out.push({ kind: 'playSpell', handIndex: i, card, targetFace: true })
    }
  }

  // Attacks
  for (let i = 0; i < boss.board.length; i++) {
    const m = boss.board[i]
    if (!m.canAttack || m.hasAttacked || m.isDead) continue
    if (tauntActive) {
      for (let t = 0; t < player.board.length; t++) {
        if (player.board[t].effects.includes('taunt') && !player.board[t].isDead) {
          out.push({ kind: 'attackMinion', attackerIndex: i, targetIndex: t })
        }
      }
    } else {
      out.push({ kind: 'attackFace', attackerIndex: i })
      for (let t = 0; t < player.board.length; t++) {
        out.push({ kind: 'attackMinion', attackerIndex: i, targetIndex: t })
      }
    }
  }

  out.push({ kind: 'endTurn' })
  return out
}

/**
 * Greedy planner: selects the highest-scoring action, simulates it locally,
 * and continues until "endTurn" wins. Returns ordered action list.
 *
 * `apply` is a pure local mutation of the BossView/PlayerView snapshots.
 * The caller (battle store) is responsible for applying actual side effects
 * to the real game state.
 */
export function planTurn(boss: BossView, player: PlayerView): BossAction[] {
  const plan: BossAction[] = []
  const b: BossView = {
    hero: { ...boss.hero },
    hand: [...boss.hand],
    board: boss.board.map((c) => ({ ...c })),
  }
  const p: PlayerView = {
    hero: { ...player.hero },
    board: player.board.map((c) => ({ ...c })),
  }

  for (let safety = 0; safety < 32; safety++) {
    const actions = enumerateActions(b, p)
    let best: { a: BossAction; s: number } | null = null
    for (const a of actions) {
      const s = scoreAction(a, b, p)
      if (!best || s > best.s) best = { a, s }
    }
    if (!best || best.a.kind === 'endTurn') break
    plan.push(best.a)
    applyLocal(best.a, b, p)
    if (p.hero.hp <= 0) break
  }

  return plan
}

function applyLocal(action: BossAction, b: BossView, p: PlayerView): void {
  switch (action.kind) {
    case 'playMinion': {
      b.hero.mana -= action.card.manaCost
      b.hand.splice(action.handIndex, 1)
      b.board.push({
        ...action.card,
        canAttack: action.card.effects.includes('charge'),
        hasAttacked: false,
      })
      // adjust subsequent handIndex references is the caller's job; we re-enumerate each loop
      break
    }
    case 'playSpell': {
      b.hero.mana -= action.card.manaCost
      b.hand.splice(action.handIndex, 1)
      const dmg = action.card.manaCost + 2
      p.hero.hp -= dmg
      break
    }
    case 'attackFace': {
      const a = b.board[action.attackerIndex]
      if (!a) return
      a.hasAttacked = true
      a.canAttack = false
      p.hero.hp -= a.attack
      break
    }
    case 'attackMinion': {
      const a = b.board[action.attackerIndex]
      const t = p.board[action.targetIndex]
      if (!a || !t) return
      a.hasAttacked = true
      a.canAttack = false
      a.health -= t.attack
      t.health -= a.attack
      if (a.health <= 0) a.isDead = true
      if (t.health <= 0) t.isDead = true
      b.board = b.board.filter((c) => !c.isDead)
      p.board = p.board.filter((c) => !c.isDead)
      break
    }
  }
}
