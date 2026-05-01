import type { KnowledgeNode } from '@/types'
import { decayTuning, cardTuning } from '@/config/tuning'

// ============================================================
// Memory Decay — pure functions per design/gdd/memory-decay.md
// ============================================================

const HOUR_MS = 3600_000
const DAY_MS = 24 * HOUR_MS

/**
 * Compute mastery loss given effective hours since last review.
 * Piecewise linear curve: 24h→30, 48h→50, 7d→80, 14d→100.
 */
export function masteryLoss(effectiveHours: number): number {
  const { loss24h, loss48h, loss7d, loss14d } = decayTuning
  if (effectiveHours <= 0) return 0
  if (effectiveHours < 24) return (effectiveHours / 24) * loss24h
  if (effectiveHours < 48) return loss24h + ((effectiveHours - 24) / 24) * (loss48h - loss24h)
  if (effectiveHours < 168) return loss48h + ((effectiveHours - 48) / 120) * (loss7d - loss48h)
  if (effectiveHours < 336) return loss7d + ((effectiveHours - 168) / 168) * (loss14d - loss7d)
  return loss14d
}

/**
 * Compute current effective mastery (0-100) of a node at time `now`.
 * User nodes decay slower (multiplier 0.7).
 * Treats `lastReview = null`:
 *   - system node: counts as never reviewed → mastery follows raw value (probably 0)
 *   - user node: counts as fully retained until first decay tick (uses createdAt as anchor)
 */
export function currentMastery(node: KnowledgeNode, now: number = Date.now()): number {
  const peak = node.mastery
  const anchor = node.lastReview ?? (node.source === 'user' ? node.createdAt : now)
  const hours = Math.max(0, (now - anchor) / HOUR_MS)
  const factor = node.source === 'user' ? decayTuning.userDecayMultiplier : 1.0
  const loss = masteryLoss(hours * factor)
  return Math.max(0, peak - loss)
}

/**
 * Multiplier applied to card stats based on current mastery.
 */
export function masteryMultiplier(mastery: number): number {
  const { masteryFull, masteryWeak, masteryFragile } = decayTuning
  if (mastery >= masteryFull) return cardTuning.multFull
  if (mastery >= masteryWeak) return cardTuning.multWeak
  if (mastery >= masteryFragile) return cardTuning.multFragile
  return cardTuning.multDisabled
}

/**
 * Whether the corresponding card is currently usable.
 */
export function isCardActive(node: KnowledgeNode, now: number = Date.now()): boolean {
  return currentMastery(node, now) >= decayTuning.masteryFragile
}

export type DecayState = 'full' | 'weak' | 'fragile' | 'forgotten'

export function decayState(mastery: number): DecayState {
  const { masteryFull, masteryWeak, masteryFragile } = decayTuning
  if (mastery >= masteryFull) return 'full'
  if (mastery >= masteryWeak) return 'weak'
  if (mastery >= masteryFragile) return 'fragile'
  return 'forgotten'
}

// ============================================================
// Reinforce — applies a learning action to a node, returns new node.
// Respects daily cap. Does NOT mutate input.
// ============================================================
export type ReinforceAction = 'reread' | 'quiz' | 'battleWin' | 'newLink'

const ACTION_GAIN: Record<ReinforceAction, number> = {
  reread: decayTuning.gainReread,
  quiz: decayTuning.gainQuiz,
  battleWin: decayTuning.gainBattleWin,
  newLink: decayTuning.gainNewLink,
}

/**
 * Reinforcement log per node (kept on the node itself for persistence simplicity).
 * { 'YYYY-MM-DD': totalGainToday }
 */
export type ReinforceLog = Record<string, number>

function todayKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Apply a reinforce action; returns updated node + actual gain (0 if capped).
 */
export function reinforce(
  node: KnowledgeNode & { reinforceLog?: ReinforceLog },
  action: ReinforceAction,
  now: number = Date.now(),
): { node: KnowledgeNode & { reinforceLog: ReinforceLog }; gained: number } {
  const log: ReinforceLog = { ...(node.reinforceLog ?? {}) }
  const key = todayKey(now)
  const dailyTotal = log[key] ?? 0
  const desired = ACTION_GAIN[action]
  const gained = Math.max(0, Math.min(desired, decayTuning.dailyCap - dailyTotal))
  const newPeak = Math.min(100, node.mastery + gained)
  log[key] = dailyTotal + gained

  return {
    node: {
      ...node,
      mastery: newPeak,
      lastReview: now,
      reinforceLog: log,
    },
    gained,
  }
}

/**
 * Count nodes that were once learned but are now decaying (below full).
 * Never-studied nodes are not counted — they are "未学" rather than "衰退中".
 */
export function countDecayedNodes(nodes: KnowledgeNode[], now: number = Date.now()): number {
  return nodes.filter(n => {
    if (n.lastReview === null) return false
    return currentMastery(n, now) < decayTuning.masteryFull
  }).length
}

/**
 * Count forgotten (disabled) nodes — once learned but now below the disabled threshold.
 */
export function countForgottenNodes(nodes: KnowledgeNode[], now: number = Date.now()): number {
  return nodes.filter(n => {
    if (n.lastReview === null) return false
    return currentMastery(n, now) < decayTuning.masteryFragile
  }).length
}

export const _internal = { masteryLoss, todayKey, ACTION_GAIN, HOUR_MS, DAY_MS }
