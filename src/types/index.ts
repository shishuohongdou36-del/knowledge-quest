// ============================================================
// Domain types
// ============================================================
export type Domain =
  | 'AI技术'
  | '产品设计'
  | '商业洞察'
  | '思维框架'
  | '跨学科'
  | '编程技术'
  | '数据科学'
  | '用户自定义'

export interface DomainInfo {
  name: Domain
  icon: string
  color: string
  description: string
}

// ============================================================
// Auth types
// ============================================================
export interface User {
  id: string
  username: string
  avatar: string
  level: number
  exp: number
  gold: number
  createdAt: number
  stats: UserStats
}

export interface UserStats {
  battlesWon: number
  battlesLost: number
  knowledgeNodes: number
  customKnowledge: number
  totalCards: number
}

// ============================================================
// Knowledge Graph types (Obsidian-style)
// ============================================================
export interface KnowledgeNode {
  id: string
  title: string
  domain: Domain
  content: string
  tags: string[]
  links: string[]           // IDs of linked knowledge nodes
  source: 'system' | 'user'
  mastery: number           // 0-100, "peak" — actual current mastery is via memoryDecay.currentMastery()
  lastReview: number | null
  createdBy: string         // user id or 'system'
  createdAt: number
  reinforceLog?: Record<string, number> // 'YYYY-MM-DD' -> mastery gained that day (cap enforcement)
}

// ============================================================
// Battle Card types (Hearthstone-style)
// ============================================================
export type CardType = 'minion' | 'spell' | 'weapon' | 'secret'

export type CardEffect =
  | 'battlecry'   // 战吼
  | 'deathrattle' // 亡语
  | 'taunt'       // 嘲讽
  | 'charge'      // 冲锋
  | 'combo'       // 连击
  | 'resonance'   // 跨域共鸣
  | 'secret_tech' // 秘技

export interface BattleCard {
  id: string
  knowledgeId: string       // linked knowledge node
  name: string
  domain: Domain
  type: CardType
  manaCost: number
  attack: number
  health: number
  maxHealth: number
  description: string
  effects: CardEffect[]
  effectText: string        // human-readable effect description
  isSecret: boolean         // user-created knowledge = secret card
  artIcon: string           // emoji or icon
  // runtime state
  canAttack: boolean
  hasAttacked: boolean
  isDead: boolean
}

// ============================================================
// Battle types (Hearthstone-style)
// ============================================================
export type BattlePhase =
  | 'mulligan'      // 换牌阶段
  | 'playerTurn'    // 玩家回合
  | 'enemyTurn'     // 敌方回合
  | 'animating'     // 动画播放中
  | 'victory'       // 胜利
  | 'defeat'        // 失败

export interface BattleHero {
  hp: number
  maxHp: number
  armor: number
  attack: number        // from weapons
  mana: number
  maxMana: number
  heroPowerUsed: boolean
  fatigueDamage: number // increases when deck is empty
}

export interface BoardState {
  playerHero: BattleHero
  enemyHero: BattleHero
  playerBoard: BattleCard[]   // max 7
  enemyBoard: BattleCard[]    // max 7
  playerHand: BattleCard[]    // max 10
  enemyHand: BattleCard[]
  playerDeck: BattleCard[]
  enemyDeck: BattleCard[]
  currentTurn: 'player' | 'enemy'
  turnNumber: number
  phase: BattlePhase
}

// ============================================================
// Boss types
// ============================================================
export interface BossData {
  id: string
  name: string
  domain: Domain
  difficulty: 'normal' | 'elite' | 'legendary'
  hp: number
  heroPower: string
  heroPowerText: string
  deckCardIds: string[]     // knowledge IDs for deck generation
  portrait: string          // emoji
}

// ============================================================
// Deck types
// ============================================================
export interface Deck {
  id: string
  name: string
  domain: Domain            // primary domain
  cardIds: string[]         // battle card IDs (30 cards)
  createdAt: number
}

/**
 * Player-curated deck blueprint. References KnowledgeNode IDs (allowing duplicates
 * up to deckTuning.copiesPerCardLimit). Cards are materialized at battle-start time
 * with current mastery values via cardGenerator.
 */
export interface DeckBlueprint {
  id: string
  name: string
  primaryDomain: Domain | null
  knowledgeIds: string[]     // up to deckTuning.size, duplicates allowed
  createdAt: number
  updatedAt: number
}

// ============================================================
// Achievements (achievements.md)
// ============================================================
export type AchievementCategory =
  | 'knowledge'
  | 'original'
  | 'mastery'
  | 'battle'
  | 'deck'
  | 'meta'

export interface AchievementContext {
  nodes: KnowledgeNode[]
  decks: DeckBlueprint[]
  user: User | null
  battlesWon: number
}

export interface AchievementEvaluation {
  unlocked: boolean
  progress?: number
  target?: number
}

export interface AchievementDef {
  id: string
  category: AchievementCategory
  title: string
  description: string
  icon: string
  hidden?: boolean
  evaluate: (ctx: AchievementContext) => AchievementEvaluation
}

// ============================================================
// Legacy compatibility (world map)
// ============================================================
export type NodeStatus = 'locked' | 'available' | 'cleared' | 'invaded' | 'reclaim'

export interface MapNode {
  id: string
  cardId: string
  x: number
  y: number
  status: NodeStatus
  memoryValue: number
  lastReviewTime: number | null
  connections: string[]
}

// Legacy card type for backward compatibility
export interface KnowledgeCard {
  id: string
  title: string
  domain: Domain
  level: number
  summary: string
  keyPoints: string[]
  limitations: string[]
  counterScenarios: string[]
  crossLinks: string[]
  bossCard: { name: string; hp: number; attack: string }
}
