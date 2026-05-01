import type { BossData } from '@/types'

export const BOSSES: BossData[] = [
  {
    id: 'boss-ai-basic', name: '算法守卫', domain: 'AI技术', difficulty: 'normal', hp: 25,
    heroPower: '智能分析', heroPowerText: '对一个随从造成1点伤害',
    deckCardIds: ['k-ai-llm', 'k-ai-prompt', 'k-ai-agent', 'k-ai-rag', 'k-ai-embedding'],
    portrait: '🤖',
  },
  {
    id: 'boss-ai-elite', name: '深度幻影', domain: 'AI技术', difficulty: 'elite', hp: 35,
    heroPower: '幻觉释放', heroPowerText: '召唤一个2/1幻觉随从',
    deckCardIds: ['k-ai-llm', 'k-ai-transformer', 'k-ai-attention', 'k-ai-fine-tuning', 'k-ai-reasoning', 'k-ai-multi-agent'],
    portrait: '👾',
  },
  {
    id: 'boss-prod-basic', name: '需求魔王', domain: '产品设计', difficulty: 'normal', hp: 25,
    heroPower: '需求变更', heroPowerText: '使一个敌方随从-1攻击力',
    deckCardIds: ['k-prod-mvp', 'k-prod-ux', 'k-prod-persona', 'k-prod-prd', 'k-prod-metrics'],
    portrait: '📋',
  },
  {
    id: 'boss-biz-basic', name: '资本寒冬', domain: '商业洞察', difficulty: 'normal', hp: 25,
    heroPower: '资金冻结', heroPowerText: '对敌方英雄造成2点伤害',
    deckCardIds: ['k-biz-model', 'k-biz-pricing', 'k-biz-growth', 'k-biz-lean', 'k-biz-moat'],
    portrait: '🏦',
  },
  {
    id: 'boss-think-basic', name: '思维定式', domain: '思维框架', difficulty: 'normal', hp: 25,
    heroPower: '惯性思维', heroPowerText: '使一个随从无法攻击一回合',
    deckCardIds: ['k-think-first', 'k-think-inversion', 'k-think-systems', 'k-think-bayesian', 'k-think-mental'],
    portrait: '🧩',
  },
  {
    id: 'boss-cross-basic', name: '知识孤岛', domain: '跨学科', difficulty: 'normal', hp: 30,
    heroPower: '隔离屏障', heroPowerText: '召唤一个1/3嘲讽屏障',
    deckCardIds: ['k-cross-psych', 'k-cross-econ', 'k-cross-game', 'k-cross-complexity', 'k-cross-behavior'],
    portrait: '🏝️',
  },
  {
    id: 'boss-prog-basic', name: 'Bug之王', domain: '编程技术', difficulty: 'normal', hp: 25,
    heroPower: '注入Bug', heroPowerText: '对所有敌方随从造成1点伤害',
    deckCardIds: ['k-prog-react', 'k-prog-ts', 'k-prog-api', 'k-prog-db', 'k-prog-arch'],
    portrait: '🐛',
  },
  {
    id: 'boss-ds-basic', name: '数据噪声', domain: '数据科学', difficulty: 'normal', hp: 25,
    heroPower: '数据污染', heroPowerText: '使一个随机敌方随从-2生命值',
    deckCardIds: ['k-ds-stats', 'k-ds-ml', 'k-ds-neural', 'k-ds-viz', 'k-ds-dimreduce'],
    portrait: '📊',
  },
  {
    id: 'boss-final', name: '无知深渊', domain: '跨学科', difficulty: 'legendary', hp: 50,
    heroPower: '遗忘风暴', heroPowerText: '对敌方英雄造成3点伤害并抽一张卡',
    deckCardIds: ['k-ai-llm', 'k-think-mental', 'k-cross-complexity', 'k-biz-moat', 'k-prog-arch', 'k-ds-neural'],
    portrait: '🌀',
  },
]

export function getBossById(id: string): BossData | undefined {
  return BOSSES.find(b => b.id === id)
}

export function getBossesByDomain(domain: string): BossData[] {
  return BOSSES.filter(b => b.domain === domain)
}
