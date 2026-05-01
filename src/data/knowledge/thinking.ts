import type { KnowledgeCard } from '@/types'

export const thinkingCards: KnowledgeCard[] = [
  {
    id: 'think-first-principles',
    title: '第一性原理',
    domain: '思维框架',
    level: 1,
    summary: '剥离表面假设，从最基本的事实出发进行推理',
    keyPoints: [
      '区分"事实"和"假设/类比"',
      '马斯克电池成本案例：从材料成本重新推算',
      '适合颠覆性创新和成本重构',
    ],
    limitations: [
      '极其耗时耗力',
      '有些领域第一性原理难以确定',
      '可能忽视经验和直觉的价值',
    ],
    counterScenarios: [
      '需要快速决策的紧急场景',
      '成熟行业的渐进式改进',
    ],
    crossLinks: ['think-inversion', 'think-systems', 'biz-model'],
    bossCard: { name: '表象迷宫', hp: 100, attack: '用看似合理的类比误导你' },
  },
  {
    id: 'think-inversion',
    title: '逆向思维',
    domain: '思维框架',
    level: 1,
    summary: '反过来想：不是"如何成功"，而是"如何避免失败"',
    keyPoints: [
      '芒格名言："告诉我会死在哪里，我就不去那里"',
      'Pre-mortem分析：假设项目已失败，反推原因',
      '避免清单 > 行动清单',
    ],
    limitations: [
      '过度使用导致保守和悲观',
      '某些问题逆向思考更复杂',
      '不适合需要创造性突破的场景',
    ],
    counterScenarios: [
      '需要大胆探索的蓝海市场',
      '需要正面激励团队士气的时刻',
    ],
    crossLinks: ['think-first-principles', 'think-bayesian', 'prod-roadmap'],
    bossCard: { name: '镜像守卫', hp: 95, attack: '把你的逻辑反转过来攻击你' },
  },
  {
    id: 'think-systems',
    title: '系统思维',
    domain: '思维框架',
    level: 2,
    summary: '将事物视为相互关联的系统，关注反馈回路和涌现',
    keyPoints: [
      '正反馈回路（增强回路）vs 负反馈回路（平衡回路）',
      '延迟效应：今天的决策影响未来',
      '杠杆点：系统中最有效的干预位置',
    ],
    limitations: [
      '系统边界难以界定',
      '过度复杂化简单问题',
      '难以量化非线性关系',
    ],
    counterScenarios: [
      '单一因果关系明确的问题',
      '需要快速行动而非分析的危机',
    ],
    crossLinks: ['think-first-principles', 'ai-multi-agent', 'cross-complexity'],
    bossCard: { name: '混沌之网', hp: 160, attack: '在系统中制造意想不到的蝴蝶效应' },
  },
  {
    id: 'think-bayesian',
    title: '贝叶斯思维',
    domain: '思维框架',
    level: 3,
    summary: '根据新证据持续更新信念的概率思维方式',
    keyPoints: [
      '先验概率 → 新证据 → 后验概率',
      '避免"基率忽略"谬误',
      '适合不确定性决策和假设验证',
    ],
    limitations: [
      '先验概率往往难以确定',
      '人类直觉天然反贝叶斯',
      '多变量联合概率计算复杂',
    ],
    counterScenarios: [
      '一次性决策（无法更新先验）',
      '证据不可靠或被操纵的场景',
    ],
    crossLinks: ['think-inversion', 'biz-data-driven', 'cross-psychology'],
    bossCard: { name: '概率风暴', hp: 170, attack: '用基率谬误让你做出错误判断' },
  },
]
