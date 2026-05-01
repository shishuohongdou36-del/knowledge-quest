import type { KnowledgeCard } from '@/types'

export const productDesignCards: KnowledgeCard[] = [
  {
    id: 'prod-mvp',
    title: 'MVP方法论',
    domain: '产品设计',
    level: 1,
    summary: '最小可行产品——用最低成本验证核心假设',
    keyPoints: [
      '核心：用最少资源验证最大风险假设',
      'Build → Measure → Learn 循环',
      '区分MVP与Demo/Prototype',
    ],
    limitations: [
      '过度精简可能丢失核心价值',
      '用户对粗糙产品容忍度低',
      'B端产品MVP门槛更高',
    ],
    counterScenarios: [
      '安全/合规要求极高的医疗产品',
      '用户期望完整体验的消费品',
    ],
    crossLinks: ['prod-user-research', 'biz-growth', 'think-first-principles'],
    bossCard: { name: '完美主义者', hp: 100, attack: '不断提出新需求拖延上线' },
  },
  {
    id: 'prod-user-research',
    title: '用户画像与调研',
    domain: '产品设计',
    level: 1,
    summary: '通过系统化方法深入理解目标用户需求和行为',
    keyPoints: [
      'Persona 用户画像构建',
      '定性（访谈）+ 定量（问卷）方法',
      'Jobs to be Done 框架',
    ],
    limitations: [
      '静态画像难以捕捉行为变化',
      '用户说的≠用户做的',
      '样本偏差影响结论',
    ],
    counterScenarios: [
      '全新品类产品（没有现有用户可研究）',
      '快速变化的市场环境',
    ],
    crossLinks: ['prod-mvp', 'prod-ab-testing', 'cross-psychology'],
    bossCard: { name: '千面使者', hp: 110, attack: '不断变换用户需求' },
  },
  {
    id: 'prod-ab-testing',
    title: 'A/B测试',
    domain: '产品设计',
    level: 2,
    summary: '通过对照实验验证产品改动效果的方法',
    keyPoints: [
      '控制变量、随机分组、统计显著性',
      '常用指标：转化率、留存、ARPU',
      '避免 Peeking Problem 和 Simpson Paradox',
    ],
    limitations: [
      '需要足够流量才有统计意义',
      '只能测量短期可量化指标',
      '忽视长期用户体验影响',
    ],
    counterScenarios: [
      '用户量极少的早期产品',
      '涉及品牌/信任的根本性变更',
    ],
    crossLinks: ['prod-user-research', 'biz-data-driven', 'cross-economics'],
    bossCard: { name: '随机法师', hp: 130, attack: '让数据产生误导性结论' },
  },
  {
    id: 'prod-roadmap',
    title: '产品路线图',
    domain: '产品设计',
    level: 2,
    summary: '产品迭代的战略规划与优先级排序工具',
    keyPoints: [
      'Now / Next / Later 时间框架',
      'RICE 或 ICE 优先级评分',
      '对齐团队目标和利益相关方预期',
    ],
    limitations: [
      '容易变成许愿清单',
      '过于刚性的路线图阻碍灵活响应',
      '难以平衡短期收益与长期愿景',
    ],
    counterScenarios: [
      '市场剧变需要pivot的时刻',
      '探索型产品的早期阶段',
    ],
    crossLinks: ['prod-mvp', 'biz-growth', 'think-inversion'],
    bossCard: { name: '规划暴君', hp: 120, attack: '用无限需求淹没你的时间线' },
  },
]
