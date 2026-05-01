import type { KnowledgeNode, BattleCard, CardType, CardEffect, Domain } from '@/types'
import { getDomainIcon } from '@/data/domains'
import { cardTuning } from '@/config/tuning'
import { currentMastery, masteryMultiplier } from '@/utils/memoryDecay'

// ============================================================
// Knowledge Node → Battle Card conversion engine
// Pure functions per design/gdd/card-system.md
// ============================================================

const EFFECT_POOL: Record<string, { effects: CardEffect[]; text: string }[]> = {
  'AI技术': [
    { effects: ['battlecry'], text: '战吼：抽一张AI技术卡牌' },
    { effects: ['battlecry'], text: '战吼：对一个随从造成2点伤害' },
    { effects: ['deathrattle'], text: '亡语：将一张AI技术卡牌置入手牌' },
    { effects: ['combo'], text: '连击：获得+2攻击力' },
  ],
  '产品设计': [
    { effects: ['battlecry'], text: '战吼：抽一张卡牌' },
    { effects: ['taunt'], text: '嘲讽' },
    { effects: ['battlecry'], text: '战吼：恢复3点生命值' },
    { effects: ['deathrattle'], text: '亡语：召唤一个1/1用户反馈' },
  ],
  '商业洞察': [
    { effects: ['battlecry'], text: '战吼：获得一个法力水晶(本回合)' },
    { effects: ['combo'], text: '连击：获得+1/+1' },
    { effects: ['battlecry'], text: '战吼：使一个友方随从获得+2生命值' },
    { effects: ['deathrattle'], text: '亡语：获得2金币' },
  ],
  '思维框架': [
    { effects: ['battlecry'], text: '战吼：使所有友方随从获得+1攻击力' },
    { effects: ['battlecry'], text: '战吼：沉默一个敌方随从' },
    { effects: ['charge'], text: '冲锋' },
    { effects: ['combo'], text: '连击：抽两张卡' },
  ],
  '跨学科': [
    { effects: ['resonance'], text: '跨域共鸣：场上每有一个不同知识域的随从，获得+1/+1' },
    { effects: ['battlecry'], text: '战吼：发现一张其他知识域的卡牌' },
    { effects: ['battlecry', 'resonance'], text: '战吼+共鸣：对所有敌方随从造成1点伤害' },
    { effects: ['taunt', 'resonance'], text: '嘲讽+共鸣：获得等同于不同域数量的护甲' },
  ],
  '编程技术': [
    { effects: ['battlecry'], text: '战吼：复制一个友方随从的效果' },
    { effects: ['deathrattle'], text: '亡语：对所有敌方随从造成1点伤害' },
    { effects: ['taunt'], text: '嘲讽' },
    { effects: ['combo'], text: '连击：获得+3攻击力' },
  ],
  '数据科学': [
    { effects: ['battlecry'], text: '战吼：查看对手下一张牌' },
    { effects: ['battlecry'], text: '战吼：随机消灭一个敌方随从' },
    { effects: ['deathrattle'], text: '亡语：抽一张卡' },
    { effects: ['combo'], text: '连击：获得+2/+2' },
  ],
  '用户自定义': [
    { effects: ['secret_tech'], text: '秘技：造成等同于你自定义知识数量的伤害' },
    { effects: ['secret_tech', 'battlecry'], text: '秘技·战吼：使所有友方随从获得+2/+2' },
    { effects: ['secret_tech', 'charge'], text: '秘技·冲锋：打出当回合立即攻击' },
    { effects: ['secret_tech', 'resonance'], text: '秘技·共鸣：获得等同于关联知识数量的攻击力' },
  ],
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function seededIndex(seed: string, mod: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash) % Math.max(1, mod)
}

/**
 * Pure: Generate a BattleCard deterministically from a KnowledgeNode + current mastery context.
 * Implements card-system.md formulas.
 */
export function generateCardFromKnowledge(node: KnowledgeNode, now: number = Date.now()): BattleCard {
  const linkCount = node.links.length
  const tagCount = node.tags.length
  const isUser = node.source === 'user'
  const liveMastery = currentMastery(node, now)
  const mult = masteryMultiplier(liveMastery)
  const userMult = isUser ? cardTuning.userBonusMultiplier : 1.0

  // Mana cost: tags-driven, secret cards get -1 discount
  const baseMana = clamp(
    Math.round(tagCount * cardTuning.manaTagCoeff + 1),
    cardTuning.manaMin,
    cardTuning.manaMax,
  )
  const mana = isUser ? Math.max(cardTuning.manaMin, baseMana - cardTuning.userManaDiscount) : baseMana

  // Determine card type
  let type: CardType = 'minion'
  if (linkCount >= 5 && !isUser) {
    type = 'spell'
  }

  // Stats (only for minions; spells = 0/0)
  const attackRaw = (liveMastery / cardTuning.attackMasteryDivisor) + (linkCount * cardTuning.attackLinksCoeff)
  const hpRaw = cardTuning.hpBase + (linkCount * cardTuning.hpLinksCoeff) + (tagCount * cardTuning.hpTagsCoeff)

  const attack = type === 'spell' ? 0 : clamp(Math.round(attackRaw * mult * userMult), 0, cardTuning.attackMax)
  const health = type === 'spell' ? 0 : clamp(Math.round(hpRaw * mult * userMult), 1, cardTuning.hpMax)

  // Pick effect deterministically by node.id
  const pool = EFFECT_POOL[node.domain] || EFFECT_POOL['用户自定义']
  const chosen = pool[seededIndex(node.id, pool.length)]

  // User cards get secret_tech tag appended
  const finalEffects: CardEffect[] = isUser
    ? Array.from(new Set([...chosen.effects, 'secret_tech' as CardEffect]))
    : chosen.effects

  const effectText = isUser
    ? `✨ ${chosen.text}`
    : (tagCount >= 3 && liveMastery >= cardTuning.multFull * 100 - 20)
      ? `${chosen.text} (强化)`
      : chosen.text

  return {
    id: `card-${node.id}`,
    knowledgeId: node.id,
    name: node.title,
    domain: node.domain,
    type,
    manaCost: mana,
    attack,
    health,
    maxHealth: health,
    description: node.content.slice(0, 60) + (node.content.length > 60 ? '...' : ''),
    effects: finalEffects,
    effectText,
    isSecret: isUser,
    artIcon: isUser ? '✨' : getDomainIcon(node.domain),
    canAttack: false,
    hasAttacked: false,
    isDead: false,
  }
}

export function generateDeckForDomain(
  nodes: KnowledgeNode[],
  primaryDomain: Domain,
  deckSize = 30,
  now: number = Date.now(),
): BattleCard[] {
  // Only include active (non-disabled) cards
  const active = nodes.filter(n => masteryMultiplier(currentMastery(n, now)) > 0)
  const domainNodes = active.filter(n => n.domain === primaryDomain)
  const otherNodes = active.filter(n => n.domain !== primaryDomain)

  const cards: BattleCard[] = []
  const domainCards = domainNodes.map(n => generateCardFromKnowledge(n, now))
  const targetDomain = Math.floor(deckSize * 0.7)

  let i = 0
  while (cards.length < targetDomain && domainCards.length > 0) {
    const c = domainCards[i % domainCards.length]
    cards.push({ ...c, id: `${c.id}-${cards.length}` })
    i++
  }

  const crossCards = otherNodes.map(n => generateCardFromKnowledge(n, now))
  let j = 0
  while (cards.length < deckSize && crossCards.length > 0) {
    const c = crossCards[j % crossCards.length]
    cards.push({ ...c, id: `${c.id}-${cards.length}` })
    j++
  }

  // Pad with token if still short
  while (cards.length < deckSize) {
    cards.push({
      id: `token-${cards.length}`,
      knowledgeId: '',
      name: '知识碎片',
      domain: primaryDomain,
      type: 'minion',
      manaCost: 1,
      attack: 1,
      health: 1,
      maxHealth: 1,
      description: '基础知识碎片',
      effects: [],
      effectText: '',
      isSecret: false,
      artIcon: '📄',
      canAttack: false,
      hasAttacked: false,
      isDead: false,
    })
  }

  return shuffleDeck(cards.slice(0, deckSize))
}

export function shuffleDeck<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
