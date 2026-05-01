// ============================================================
// Centralized tuning knobs — single source of truth
// All values are derived from design/gdd/*.md "Tuning Knobs" sections.
// Modifying values here MUST be reflected in the corresponding GDD.
// ============================================================

// ---------- Memory Decay (memory-decay.md) ----------
export const decayTuning = {
  // hours -> mastery loss curve breakpoints
  loss24h: 30,     // 24h 累计损失
  loss48h: 50,     // 48h 累计损失
  loss7d: 80,      // 7d 累计损失
  loss14d: 100,    // 14d 上限
  // user nodes decay slower
  userDecayMultiplier: 0.7,
  // mastery thresholds for card multiplier
  masteryFull: 80,
  masteryWeak: 50,
  masteryFragile: 30, // below = disabled
  // reinforce action gains
  gainReread: 20,
  gainQuiz: 30,
  gainBattleWin: 10,
  gainNewLink: 5,
  // daily cap on reinforce per node
  dailyCap: 50,
  // notification threshold (decayed nodes count)
  decayBannerThreshold: 5,
} as const

// ---------- Card Generation (card-system.md) ----------
export const cardTuning = {
  // mana
  manaTagCoeff: 0.7,        // base_mana = round(tags * 0.7 + 1)
  manaMin: 1,
  manaMax: 10,
  userManaDiscount: 1,      // secret cards cost -1 mana (min 1)
  // attack
  attackMasteryDivisor: 20, // mastery / 20 base attack
  attackLinksCoeff: 0.5,
  attackMax: 12,            // hard clamp
  // hp
  hpBase: 3,
  hpLinksCoeff: 0.8,
  hpTagsCoeff: 0.5,
  hpMax: 15,
  // user (secret) bonus
  userBonusMultiplier: 1.3,
  // mastery multipliers (mirror decayTuning thresholds)
  multFull: 1.0,
  multWeak: 0.8,
  multFragile: 0.6,
  multDisabled: 0,
} as const

// ---------- Battle (battle.md) ----------
export const battleTuning = {
  heroStartHp: 30,
  deckSize: 30,
  initialHandPlayer: 3,
  initialHandEnemy: 4,
  handLimit: 10,
  boardLimit: 7,
  manaLimit: 10,
  manaStart: 1,
  heroPowerCost: 2,
  // post-battle reinforcement
  winMasteryGain: 5,
  // animation timing (ms)
  hitStopMs: 100,
  attackAnimationMs: 600,
  cardPlayAnimationMs: 500,
  bossThinkingMs: 800,
} as const

// ---------- Boss & PvE AI (boss-ai.md) ----------
export const bossTuning = {
  hpNormal: 30,
  hpElite: 35,
  hpLegendary: 40,
  // AI scoring weights
  wLethal: 100,
  wValue: 10,
  wTempo: 5,
  wThreat: 8,
  wManaWaste: 3,
  // decision time budget
  decisionTimeoutMs: 500,
  // unlock reward
  defeatNodeUnlockCount: 1,
} as const

// ---------- Auth (auth.md) ----------
export const authTuning = {
  usernameMinLen: 3,
  usernameMaxLen: 20,
  passwordMinLen: 6,
  appSalt: 'kq-salt-2024',
} as const

// ---------- UI Shell (ui-shell.md) ----------
export const uiTuning = {
  toastDurationMs: 4000,
  toastMaxStack: 3,
  routeTransitionMs: 200,
  modalAnimationMs: 250,
  desktopBreakpoint: 1280,
  tabletBreakpoint: 768,
} as const

// ---------- Deck Builder (deck-builder.md) ----------
export const deckTuning = {
  size: 30,
  copiesPerCardLimit: 3,
  decksPerUserLimit: 12,
} as const

// ---------- Knowledge Graph (knowledge-graph.md) ----------
export const graphTuning = {
  kRepel: 800,
  kSpring: 0.05,
  restLength: 120,
  damping: 0.85,
  centerStrength: 0.01,
  maxNodes: 500, // soft cap; beyond = downgraded rendering
} as const
