import type { KnowledgeCard } from '@/types'

export const crossDisciplineCards: KnowledgeCard[] = [
  {
    id: 'cross-psychology',
    title: '认知偏误与行为心理',
    domain: '跨学科',
    level: 1,
    summary: '人类决策中系统性的非理性模式',
    keyPoints: [
      '锚定效应、确认偏误、损失厌恶',
      '可得性启发式 vs 代表性启发式',
      '系统1（快思考）vs 系统2（慢思考）',
    ],
    limitations: [
      '了解偏误不等于能避免偏误',
      '过度归因于偏误忽视理性分析',
      '文化差异影响偏误表现',
    ],
    counterScenarios: [
      '完全理性的算法决策场景',
      '数据充分的定量分析',
    ],
    crossLinks: ['think-bayesian', 'prod-user-research', 'biz-growth'],
    bossCard: { name: '心智陷阱', hp: 120, attack: '激活你的认知偏误让你自相矛盾' },
  },
  {
    id: 'cross-economics',
    title: '微观经济学思维',
    domain: '跨学科',
    level: 2,
    summary: '供需、激励、边际分析——理解市场行为的基本工具',
    keyPoints: [
      '边际思维：关注增量而非总量',
      '激励设计：人们对激励做出反应',
      '机会成本：选择的真实代价',
    ],
    limitations: [
      '"理性经济人"假设过于简化',
      '市场并非总是有效',
      '忽视公平、道德等非经济因素',
    ],
    counterScenarios: [
      '非市场领域（公共服务、公益）',
      '强情感驱动的消费决策',
    ],
    crossLinks: ['biz-model', 'biz-growth', 'cross-game-theory'],
    bossCard: { name: '市场风暴', hp: 140, attack: '用供需失衡打乱你的定价策略' },
  },
  {
    id: 'cross-game-theory',
    title: '博弈论基础',
    domain: '跨学科',
    level: 2,
    summary: '分析多方策略互动的数学框架',
    keyPoints: [
      '纳什均衡：各方都无法单方面获益的状态',
      '囚徒困境 → 合作与背叛的博弈',
      '重复博弈中的信任与报复策略',
    ],
    limitations: [
      '完全信息假设常不成立',
      '参与者并非总是理性',
      '多人博弈分析复杂度爆炸',
    ],
    counterScenarios: [
      '单方决策场景（无对手互动）',
      '信息完全不对称的情报战',
    ],
    crossLinks: ['cross-economics', 'think-inversion', 'biz-growth'],
    bossCard: { name: '博弈大师', hp: 150, attack: '预判你的每一步行动' },
  },
  {
    id: 'cross-complexity',
    title: '复杂系统与涌现',
    domain: '跨学科',
    level: 3,
    summary: '简单规则产生复杂行为——理解不可预测性',
    keyPoints: [
      '涌现：整体大于部分之和',
      '幂律分布 vs 正态分布',
      '自组织临界：沙堆模型',
    ],
    limitations: [
      '几乎无法精确预测',
      '事后解释容易，事前预测难',
      '复杂≠复杂系统',
    ],
    counterScenarios: [
      '可以精确建模的线性系统',
      '需要确定性输出的工程场景',
    ],
    crossLinks: ['think-systems', 'ai-multi-agent', 'cross-economics'],
    bossCard: { name: '涌现之主', hp: 200, attack: '让简单的规则产生不可预测的后果' },
  },
]
