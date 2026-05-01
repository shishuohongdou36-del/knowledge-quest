import type { KnowledgeCard } from '@/types'

export const aiTechCards: KnowledgeCard[] = [
  {
    id: 'ai-single-agent',
    title: '单Agent架构',
    domain: 'AI技术',
    level: 1,
    summary: '单个AI Agent独立完成任务的架构模式',
    keyPoints: [
      '一个LLM + 工具调用 + 记忆',
      '适合明确、单步骤任务',
      'ReAct / Function Calling 范式',
    ],
    limitations: [
      '复杂多步骤任务容易出错',
      '上下文窗口限制',
      '缺乏自我纠错能力',
    ],
    counterScenarios: [
      '需要多角色协作的客服系统',
      '需要长期规划的项目管理',
    ],
    crossLinks: ['ai-multi-agent', 'ai-prompt-engineering', 'think-systems'],
    bossCard: { name: 'Agent独行者', hp: 100, attack: '打出概念牌，每回合施加压力' },
  },
  {
    id: 'ai-multi-agent',
    title: 'Multi-Agent系统',
    domain: 'AI技术',
    level: 2,
    summary: '多个AI Agent协作完成复杂任务的系统架构',
    keyPoints: [
      '多Agent分工协作，各司其职',
      '支持角色分配、任务拆解、结果聚合',
      '代表框架：AutoGen、CrewAI、LangGraph',
    ],
    limitations: [
      '协调成本高，通信开销大',
      '一致性难保证',
      'Debug困难，黑盒行为多',
    ],
    counterScenarios: [
      '简单查询任务不需要多Agent',
      '延迟敏感场景不适合',
    ],
    crossLinks: ['ai-single-agent', 'ai-rag', 'think-systems'],
    bossCard: { name: '混沌军团', hp: 150, attack: '召唤分身，多线施压' },
  },
  {
    id: 'ai-rag',
    title: 'RAG检索增强生成',
    domain: 'AI技术',
    level: 2,
    summary: '通过检索外部知识库增强LLM生成质量的技术',
    keyPoints: [
      '检索 → 增强 → 生成 三步流程',
      '解决LLM知识截止和幻觉问题',
      '向量数据库 + Embedding + 相似度搜索',
    ],
    limitations: [
      '检索质量直接影响生成质量',
      '幻觉问题未完全消除',
      '文档切分策略影响效果',
    ],
    counterScenarios: [
      '需要实时推理的数学证明',
      '知识库本身有错误或过时',
    ],
    crossLinks: ['ai-single-agent', 'ai-prompt-engineering', 'prod-user-research'],
    bossCard: { name: '知识漩涡', hp: 120, attack: '用碎片化信息迷惑你' },
  },
  {
    id: 'ai-prompt-engineering',
    title: 'Prompt Engineering',
    domain: 'AI技术',
    level: 1,
    summary: '通过精心设计提示词来优化LLM输出的工程实践',
    keyPoints: [
      'Few-shot / Zero-shot / Chain-of-Thought',
      '系统提示词 + 用户提示词分层设计',
      '提示词模板化、版本化管理',
    ],
    limitations: [
      '提示词脆弱，微小改动导致巨大差异',
      '不同模型对同一提示词反应不同',
      '难以系统化评估效果',
    ],
    counterScenarios: [
      '需要确定性输出的金融计算',
      '需要持久记忆的长对话',
    ],
    crossLinks: ['ai-single-agent', 'ai-fine-tuning', 'cross-psychology'],
    bossCard: { name: '语义迷宫', hp: 90, attack: '扭曲你的指令意图' },
  },
  {
    id: 'ai-fine-tuning',
    title: '模型微调',
    domain: 'AI技术',
    level: 3,
    summary: '在预训练模型基础上用特定数据进一步训练以适应特定任务',
    keyPoints: [
      'LoRA / QLoRA 高效微调方法',
      'SFT（监督微调）+ RLHF 对齐',
      '适合领域专有知识内化',
    ],
    limitations: [
      '高质量标注数据需求大',
      '灾难性遗忘风险',
      '计算资源消耗高',
    ],
    counterScenarios: [
      '知识频繁更新的场景（用RAG更合适）',
      '数据量不足的冷启动阶段',
    ],
    crossLinks: ['ai-rag', 'ai-prompt-engineering', 'biz-data-driven'],
    bossCard: { name: '遗忘深渊', hp: 180, attack: '让你的知识逐渐模糊' },
  },
]
