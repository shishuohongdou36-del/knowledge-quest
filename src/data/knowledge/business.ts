import type { KnowledgeCard } from '@/types'

export const businessCards: KnowledgeCard[] = [
  {
    id: 'biz-model',
    title: '商业模式画布',
    domain: '商业洞察',
    level: 1,
    summary: '9大模块系统化描述企业如何创造、传递和捕获价值',
    keyPoints: [
      '价值主张 → 客户细分 → 渠道 → 客户关系',
      '收入流 → 核心资源 → 关键活动 → 合作伙伴 → 成本结构',
      'SaaS常见模式：订阅制、Freemium、Usage-based',
    ],
    limitations: [
      '静态快照，难以反映动态竞争',
      '忽略执行细节和时间维度',
      '可能过度简化复杂生态系统',
    ],
    counterScenarios: [
      '需要详细财务建模的融资场景',
      '多边平台的复杂网络效应分析',
    ],
    crossLinks: ['biz-growth', 'biz-data-driven', 'think-first-principles'],
    bossCard: { name: '商业迷雾', hp: 110, attack: '用模糊的价值主张混淆你' },
  },
  {
    id: 'biz-growth',
    title: '增长策略',
    domain: '商业洞察',
    level: 2,
    summary: '系统化驱动用户和收入增长的方法论',
    keyPoints: [
      'AARRR海盗指标：获客→激活→留存→收入→推荐',
      '增长飞轮 vs 增长漏斗思维',
      'PMF（产品市场匹配）是增长前提',
    ],
    limitations: [
      '过度关注增长忽视产品质量',
      '增长黑客手段可能损害长期品牌',
      '不同阶段增长引擎不同',
    ],
    counterScenarios: [
      '还没找到PMF的早期产品',
      '高客单价低频次的企业服务',
    ],
    crossLinks: ['biz-model', 'prod-ab-testing', 'cross-economics'],
    bossCard: { name: '增长幻象', hp: 140, attack: '用虚荣指标迷惑你的判断' },
  },
  {
    id: 'biz-data-driven',
    title: '数据驱动决策',
    domain: '商业洞察',
    level: 2,
    summary: '基于数据分析而非直觉来制定产品和商业决策',
    keyPoints: [
      '指标体系设计：北极星指标 + 辅助指标',
      '数据埋点 → 分析 → 洞察 → 行动闭环',
      '避免数据偏见：幸存者偏差、辛普森悖论',
    ],
    limitations: [
      '数据只能反映过去，不能预测突变',
      '过度依赖数据忽视定性洞察',
      '数据质量差则决策更差',
    ],
    counterScenarios: [
      '颠覆式创新（没有历史数据参考）',
      '涉及伦理/价值观的决策',
    ],
    crossLinks: ['prod-ab-testing', 'biz-growth', 'think-bayesian'],
    bossCard: { name: '数据幽灵', hp: 130, attack: '用错误关联迷惑你的分析' },
  },
]
