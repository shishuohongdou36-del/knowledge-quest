import type { AchievementDef, AchievementContext, Domain } from '@/types'
import { currentMastery, masteryMultiplier } from '@/utils/memoryDecay'
import { decayTuning } from '@/config/tuning'

// ============================================================
// Achievement catalog. Pure predicates over game state.
// 20 entries across 6 categories. See design/gdd/achievements.md.
// ============================================================

const linear = (current: number, target: number) => ({
  unlocked: current >= target,
  progress: Math.min(current, target),
  target,
})

const SYSTEM_DOMAINS: Domain[] = [
  'AI技术',
  '产品设计',
  '商业洞察',
  '思维框架',
  '跨学科',
  '编程技术',
  '数据科学',
]

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---------- Knowledge ----------
  {
    id: 'know-1',
    category: 'knowledge',
    title: '初识',
    description: '创建第 1 个自定义知识节点',
    icon: '🌱',
    evaluate: (c) => ({ unlocked: c.nodes.some((n) => n.source === 'user') }),
  },
  {
    id: 'know-10',
    category: 'knowledge',
    title: '编织者',
    description: '拥有 10 个自定义节点',
    icon: '🧵',
    evaluate: (c) => linear(c.nodes.filter((n) => n.source === 'user').length, 10),
  },
  {
    id: 'know-50',
    category: 'knowledge',
    title: '图谱大师',
    description: '拥有 50 个自定义节点',
    icon: '🕸️',
    evaluate: (c) => linear(c.nodes.filter((n) => n.source === 'user').length, 50),
  },
  {
    id: 'know-link-100',
    category: 'knowledge',
    title: '连结者',
    description: '图谱中累计 100 条连接',
    icon: '🔗',
    evaluate: (c) => {
      const total = c.nodes.reduce((s, n) => s + n.links.length, 0) / 2
      return linear(Math.floor(total), 100)
    },
  },

  // ---------- Original (秘技) ----------
  {
    id: 'secret-1',
    category: 'original',
    title: '初秘技',
    description: '创建你的第一张秘技卡',
    icon: '✨',
    evaluate: (c) => ({ unlocked: c.nodes.some((n) => n.source === 'user') }),
  },
  {
    id: 'secret-10',
    category: 'original',
    title: '秘典传人',
    description: '累计创建 10 张秘技卡',
    icon: '📖',
    evaluate: (c) => linear(c.nodes.filter((n) => n.source === 'user').length, 10),
  },
  {
    id: 'secret-resonance',
    category: 'original',
    title: '跨域共鸣',
    description: '一张秘技节点关联 ≥ 5 个不同域的节点',
    icon: '🌈',
    hidden: true,
    evaluate: (c) => {
      const triggered = c.nodes.some((n) => {
        if (n.source !== 'user') return false
        const domains = new Set<Domain>()
        for (const lid of n.links) {
          const t = c.nodes.find((x) => x.id === lid)
          if (t) domains.add(t.domain)
        }
        return domains.size >= 5
      })
      return { unlocked: triggered }
    },
  },

  // ---------- Mastery ----------
  {
    id: 'master-5',
    category: 'mastery',
    title: '熟手',
    description: '5 个节点达到 80%+ 掌握度',
    icon: '💪',
    evaluate: (c) => {
      const mastered = c.nodes.filter((n) => currentMastery(n) >= decayTuning.masteryFull).length
      return linear(mastered, 5)
    },
  },
  {
    id: 'master-20',
    category: 'mastery',
    title: '专精',
    description: '20 个节点达到 80%+ 掌握度',
    icon: '🏆',
    evaluate: (c) => {
      const mastered = c.nodes.filter((n) => currentMastery(n) >= decayTuning.masteryFull).length
      return linear(mastered, 20)
    },
  },
  {
    id: 'review-100',
    category: 'mastery',
    title: '勤勉记诵',
    description: '累计复习增益达到 100 点掌握度',
    icon: '🩹',
    evaluate: (c) => {
      let total = 0
      for (const n of c.nodes) {
        if (n.reinforceLog) {
          for (const v of Object.values(n.reinforceLog)) total += v
        }
      }
      return linear(total, 100)
    },
  },
  {
    id: 'no-decay-7d',
    category: 'mastery',
    title: '勤勉学者',
    description: '7 天内全部学过的节点 0 张衰退到 < 30%',
    icon: '📅',
    hidden: true,
    evaluate: (c) => {
      const reviewed = c.nodes.filter((n) => n.lastReview !== null)
      if (reviewed.length < 5) return { unlocked: false }
      const anyDecayed = reviewed.some((n) => masteryMultiplier(currentMastery(n)) <= 0)
      return { unlocked: !anyDecayed }
    },
  },

  // ---------- Battle ----------
  {
    id: 'battle-1',
    category: 'battle',
    title: '初战告捷',
    description: '赢得第 1 场战斗',
    icon: '⚔️',
    evaluate: (c) => ({ unlocked: c.battlesWon >= 1 }),
  },
  {
    id: 'battle-10',
    category: 'battle',
    title: '常胜将军',
    description: '累计赢得 10 场战斗',
    icon: '🛡️',
    evaluate: (c) => linear(c.battlesWon, 10),
  },
  {
    id: 'battle-50',
    category: 'battle',
    title: '战神',
    description: '累计赢得 50 场战斗',
    icon: '👑',
    evaluate: (c) => linear(c.battlesWon, 50),
  },

  // ---------- Deck ----------
  {
    id: 'deck-1',
    category: 'deck',
    title: '建筑师',
    description: '创建你的第一个卡组',
    icon: '🎴',
    evaluate: (c) => ({ unlocked: c.decks.length >= 1 }),
  },
  {
    id: 'deck-curated',
    category: 'deck',
    title: '满构精选',
    description: '一个卡组装满 30 张',
    icon: '📦',
    evaluate: (c) => ({ unlocked: c.decks.some((d) => d.knowledgeIds.length >= 30) }),
  },
  {
    id: 'deck-multi',
    category: 'deck',
    title: '多面手',
    description: '同时维护 3 个不同主域的卡组',
    icon: '🎭',
    hidden: true,
    evaluate: (c) => {
      const domains = new Set(c.decks.map((d) => d.primaryDomain).filter((d) => d !== null))
      return { unlocked: domains.size >= 3 }
    },
  },

  // ---------- Meta ----------
  {
    id: 'polymath',
    category: 'meta',
    title: '通才',
    description: '5 个不同知识域各拥有 ≥ 5 个节点',
    icon: '🧙',
    evaluate: (c) => {
      const counts: Partial<Record<Domain, number>> = {}
      for (const n of c.nodes) {
        counts[n.domain] = (counts[n.domain] ?? 0) + 1
      }
      const qualified = SYSTEM_DOMAINS.filter((d) => (counts[d] ?? 0) >= 5).length
      return linear(qualified, 5)
    },
  },
  {
    id: 'level-10',
    category: 'meta',
    title: '十段进阶',
    description: '角色达到 Lv.10',
    icon: '⭐',
    evaluate: (c) => linear(c.user?.level ?? 0, 10),
  },
]

export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

export function evaluateAll(ctx: AchievementContext) {
  return ACHIEVEMENTS.map((def) => ({ def, ...def.evaluate(ctx) }))
}
