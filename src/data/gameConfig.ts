// Config-Driven design (inspired by OpenGame)
// All gameplay numeric values centralized here

export const gameConfig = {
  battle: {
    playerMaxHp: 100,
    timerSeconds: 30,

    // Damage by question type
    damage: {
      choice:    { min: 10, max: 15, label: '选择题' },
      trueFalse: { min: 8,  max: 12, label: '判断题' },
      fillBlank: { min: 20, max: 25, label: '填空题 暴击!' },
      match:     { min: 28, max: 32, label: '配对题 范围伤害!' },
    },

    // Combo tiers (borrowed from OpenGame's 4-tier system)
    comboTiers: [
      { streak: 0, multiplier: 1.0, label: '' },
      { streak: 2, multiplier: 1.2, label: '🔥 连击 GOOD' },
      { streak: 4, multiplier: 1.5, label: '✨ 知识共鸣 GREAT' },
      { streak: 6, multiplier: 2.0, label: '💡 顿悟 PERFECT' },
    ],

    // Player damage on wrong/timeout
    wrongAnswerDamage: 15,
    timeoutDamage: 10,
    healOnPerfectStreak: 15,

    // Boss counter-attack (NEW: boss fights back each round)
    bossAttack: {
      minDamage: 5,
      maxDamage: 12,
      messages: [
        '发动概念冲击!',
        '释放知识迷雾!',
        '施加认知压力!',
        '用混淆逻辑攻击!',
        '打出谬误牌!',
      ],
    },
  },

  // Card types the player can earn/use (NEW: inspired by OpenGame card system)
  cardTypes: {
    attack:       { label: '⚔️ 攻击', color: '#ef4444', description: '答对题目造成伤害' },
    heavy_attack: { label: '💥 重击', color: '#dc2626', description: '填空/配对题造成暴击伤害' },
    defend:       { label: '🛡️ 防御', color: '#3b82f6', description: '连击2+时减少Boss反击伤害' },
    heal:         { label: '💚 治疗', color: '#10b981', description: '连击6+时恢复生命值' },
  },

  memory: {
    decay: {
      hours24: 0.7,   // 24h后保留70%
      hours48: 0.5,   // 48h后保留50%
      days7: 0.2,     // 7天后保留20%
    },
    invasionThreshold: 30, // 记忆值低于30被侵占
  },
}

export function getComboTier(streak: number) {
  const tiers = gameConfig.battle.comboTiers
  let tier = tiers[0]
  for (const t of tiers) {
    if (streak >= t.streak) tier = t
  }
  return tier
}

export function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
