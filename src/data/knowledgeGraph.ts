import type { KnowledgeNode, Domain } from '@/types'

// ============================================================
// System Knowledge Nodes (50+ nodes across all domains)
// ============================================================

const ai: KnowledgeNode[] = [
  {
    id: 'k-ai-llm', title: 'LLM大语言模型', domain: 'AI技术',
    content: '基于Transformer架构的大规模预训练语言模型，通过海量文本数据学习语言理解和生成能力。代表模型包括GPT系列、Claude、Llama等。核心能力包括文本生成、问答、翻译、代码生成等。',
    tags: ['深度学习', 'NLP', 'Transformer'], links: ['k-ai-transformer', 'k-ai-prompt', 'k-ai-fine-tuning', 'k-ai-agent'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-transformer', title: 'Transformer架构', domain: 'AI技术',
    content: '2017年Google提出的自注意力机制架构，彻底改变了NLP领域。核心组件：Multi-Head Attention、Position Encoding、Feed-Forward Network。是所有现代LLM的基础。',
    tags: ['深度学习', '注意力机制', '架构'], links: ['k-ai-llm', 'k-ai-attention', 'k-ds-neural'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-attention', title: '注意力机制', domain: 'AI技术',
    content: '让模型在处理序列数据时能够"关注"输入中最相关的部分。自注意力(Self-Attention)让每个token都能与序列中所有其他token交互，捕捉长距离依赖。Q/K/V机制是核心。',
    tags: ['深度学习', '注意力', 'QKV'], links: ['k-ai-transformer', 'k-ai-llm'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-prompt', title: 'Prompt Engineering', domain: 'AI技术',
    content: '通过精心设计提示词来优化LLM输出的工程实践。关键技术：Few-shot、Zero-shot、Chain-of-Thought、System Prompt、模板化管理。提示词工程是使用LLM的基本功。',
    tags: ['提示词', 'Few-shot', 'CoT'], links: ['k-ai-llm', 'k-ai-agent', 'k-ai-rag'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-agent', title: 'AI Agent智能体', domain: 'AI技术',
    content: '具有自主决策能力的AI系统，能感知环境、制定计划、使用工具、执行任务。核心组件：LLM大脑+工具调用+记忆系统+规划能力。代表框架：LangChain、AutoGen。',
    tags: ['Agent', '工具调用', '自主决策'], links: ['k-ai-llm', 'k-ai-multi-agent', 'k-ai-prompt', 'k-ai-rag'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-multi-agent', title: 'Multi-Agent系统', domain: 'AI技术',
    content: '多个AI Agent协作完成复杂任务。各Agent分工明确（研究者、编码者、审核者等），通过消息传递协调。挑战：协调成本、一致性、Debug困难。代表：CrewAI、AutoGen。',
    tags: ['多Agent', '协作', '分布式'], links: ['k-ai-agent', 'k-ai-llm', 'k-cross-game'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-rag', title: 'RAG检索增强生成', domain: 'AI技术',
    content: '通过检索外部知识库增强LLM生成质量。流程：用户查询→向量检索→上下文增强→LLM生成。解决知识截止和幻觉问题，是企业级AI应用的核心架构。',
    tags: ['检索', '向量数据库', 'Embedding'], links: ['k-ai-llm', 'k-ai-prompt', 'k-ai-embedding', 'k-ai-agent'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-embedding', title: 'Embedding向量化', domain: 'AI技术',
    content: '将文本、图像等数据转换为高维向量表示，使语义相似的内容在向量空间中距离接近。是RAG、推荐系统、语义搜索的基础技术。常用模型：text-embedding-ada、BGE。',
    tags: ['向量', '语义', '相似度'], links: ['k-ai-rag', 'k-ai-llm', 'k-ds-dimreduce'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-fine-tuning', title: '模型微调', domain: 'AI技术',
    content: '在预训练模型基础上用特定数据进一步训练。LoRA/QLoRA实现高效微调，SFT监督微调+RLHF对齐。适合领域知识内化，但面临灾难性遗忘和数据需求挑战。',
    tags: ['LoRA', 'SFT', 'RLHF'], links: ['k-ai-llm', 'k-ai-transformer', 'k-ds-ml'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ai-reasoning', title: 'AI推理能力', domain: 'AI技术',
    content: 'LLM的逻辑推理和复杂问题解决能力。Chain-of-Thought提升推理质量，o1/o3系列模型展示了强推理能力。推理时计算(Inference-time Compute)是前沿方向。',
    tags: ['推理', 'CoT', '逻辑'], links: ['k-ai-llm', 'k-ai-prompt', 'k-think-first'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

const product: KnowledgeNode[] = [
  {
    id: 'k-prod-mvp', title: 'MVP最小可行产品', domain: '产品设计',
    content: '用最小资源验证核心假设的产品开发方法。核心：找到最关键的用户价值假设，用最快速度构建可测试的产品原型。避免过度工程，快速迭代验证。',
    tags: ['精益', '验证', '迭代'], links: ['k-prod-ux', 'k-prod-roadmap', 'k-biz-lean'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prod-ux', title: '用户体验设计', domain: '产品设计',
    content: '以用户为中心的设计方法论。涵盖用户研究、信息架构、交互设计、视觉设计、可用性测试。关键指标：任务完成率、满意度、NPS。',
    tags: ['UX', '用户研究', '交互'], links: ['k-prod-mvp', 'k-prod-persona', 'k-cross-psych'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prod-persona', title: '用户画像', domain: '产品设计',
    content: '基于真实数据构建的典型用户模型。包含人口统计、行为模式、痛点、目标、使用场景。注意避免拍脑袋，要基于数据和访谈。动态更新比静态画像更有价值。',
    tags: ['用户研究', '画像', '数据驱动'], links: ['k-prod-ux', 'k-prod-ab', 'k-biz-data'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prod-roadmap', title: '产品路线图', domain: '产品设计',
    content: '产品发展的战略规划工具。Now-Next-Later框架、OKR驱动的优先级排序。需要平衡用户需求、商业目标、技术可行性。路线图不是固定计划而是沟通工具。',
    tags: ['规划', '优先级', 'OKR'], links: ['k-prod-mvp', 'k-prod-prd', 'k-biz-growth'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prod-prd', title: 'PRD产品需求文档', domain: '产品设计',
    content: '定义产品功能和规格的核心文档。包含背景、目标、用户故事、功能需求、非功能需求、验收标准。好的PRD应该是开发团队的唯一真实来源。',
    tags: ['文档', '需求', '规格'], links: ['k-prod-roadmap', 'k-prod-ux', 'k-prog-arch'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prod-ab', title: 'A/B测试', domain: '产品设计',
    content: '通过随机分组对比实验验证产品改动效果。关键：统计显著性、样本量、指标选择、避免偷看结果。是数据驱动决策的核心工具。',
    tags: ['实验', '数据', '统计'], links: ['k-prod-persona', 'k-biz-data', 'k-ds-stats'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prod-metrics', title: '产品指标体系', domain: '产品设计',
    content: 'AARRR海盗指标：获取→激活→留存→收入→推荐。北极星指标作为核心度量。指标之间的因果关系和领先/滞后关系至关重要。',
    tags: ['指标', 'AARRR', '北极星'], links: ['k-prod-ab', 'k-biz-growth', 'k-biz-data'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

const business: KnowledgeNode[] = [
  {
    id: 'k-biz-model', title: '商业模式画布', domain: '商业洞察',
    content: '九要素商业模式分析框架：价值主张、客户细分、渠道通路、客户关系、收入来源、核心资源、关键活动、重要伙伴、成本结构。快速梳理商业逻辑的最佳工具。',
    tags: ['商业模式', '画布', '九要素'], links: ['k-biz-pricing', 'k-biz-growth', 'k-biz-lean'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-biz-pricing', title: '定价策略', domain: '商业洞察',
    content: '产品定价的核心方法：成本加成、竞品对标、价值定价、渗透定价、撇脂定价。AI产品常用：按量计费(token)、订阅制、阶梯定价。定价直接决定商业模式可行性。',
    tags: ['定价', '商业化', '盈利'], links: ['k-biz-model', 'k-cross-econ', 'k-biz-data'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-biz-growth', title: '增长飞轮', domain: '商业洞察',
    content: 'Jeff Bezos的增长飞轮理论：找到正向循环的增长引擎。产品改进→用户增长→数据增多→模型更好→产品更好。网络效应、规模经济、品牌效应是核心飞轮。',
    tags: ['增长', '飞轮', '网络效应'], links: ['k-biz-model', 'k-prod-metrics', 'k-prod-roadmap'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-biz-data', title: '数据驱动决策', domain: '商业洞察',
    content: '基于数据而非直觉做业务决策。数据采集→清洗→分析→洞察→行动→复盘闭环。关键：区分相关性和因果性，避免数据偏见，建立数据文化。',
    tags: ['数据', '决策', '分析'], links: ['k-biz-pricing', 'k-prod-ab', 'k-ds-stats'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-biz-lean', title: '精益创业', domain: '商业洞察',
    content: 'Eric Ries的精益创业方法论：构建→测量→学习循环。核心：快速实验验证假设，减少浪费。MVP不是简陋产品而是最小学习单元。产品-市场匹配(PMF)是终极目标。',
    tags: ['精益', 'PMF', '实验'], links: ['k-biz-model', 'k-prod-mvp', 'k-think-first'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-biz-moat', title: '竞争护城河', domain: '商业洞察',
    content: 'Warren Buffett的护城河理论：品牌、网络效应、转换成本、规模经济、无形资产。AI时代的新护城河：独有数据、模型能力、生态系统、用户习惯。',
    tags: ['护城河', '竞争', '壁垒'], links: ['k-biz-model', 'k-biz-growth', 'k-cross-econ'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

const thinking: KnowledgeNode[] = [
  {
    id: 'k-think-first', title: '第一性原理', domain: '思维框架',
    content: 'Elon Musk推崇的思维方法：回归事物最基本的真理，从底层重新推导。不是类比思维(别人怎么做)而是本质思维(物理原理是什么)。打破常规假设的利器。',
    tags: ['本质', '推导', '创新'], links: ['k-think-inversion', 'k-think-systems', 'k-biz-lean'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-think-inversion', title: '逆向思维', domain: '思维框架',
    content: 'Charlie Munger的核心思维工具："反过来想，总是反过来想。"不是想如何成功，而是想如何避免失败。预检验(Pre-mortem)、反面论证、排除法思维。',
    tags: ['逆向', '避免失败', '反面'], links: ['k-think-first', 'k-think-bayesian', 'k-cross-psych'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-think-systems', title: '系统思维', domain: '思维框架',
    content: '将问题看作互相关联的系统而非孤立事件。反馈回路(正/负)、涌现性、杠杆点、延迟效应。Peter Senge《第五项修炼》的核心思想。看见整体而非部分。',
    tags: ['系统', '反馈', '全局'], links: ['k-think-first', 'k-cross-complexity', 'k-ai-multi-agent'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-think-bayesian', title: '贝叶斯思维', domain: '思维框架',
    content: '基于新证据持续更新信念的概率思维。先验概率→新证据→后验概率。避免全有或全无的确定性思维，用概率替代确定性。在不确定性中做决策的最佳框架。',
    tags: ['概率', '更新', '不确定性'], links: ['k-think-inversion', 'k-ds-stats', 'k-cross-psych'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-think-mental', title: '多元思维模型', domain: '思维框架',
    content: 'Charlie Munger的核心理念：掌握多学科的关键模型，形成思维模型格栅。不同问题用不同模型，避免"手持锤子看什么都是钉子"。跨学科才能看清全貌。',
    tags: ['芒格', '跨学科', '格栅'], links: ['k-think-first', 'k-think-inversion', 'k-cross-psych', 'k-cross-econ'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-think-secondorder', title: '二阶思维', domain: '思维框架',
    content: '不仅思考行动的直接后果（一阶效应），更要思考后果的后果（二阶效应）。政策制定、产品设计中极其重要。"然后呢？"是二阶思维的核心问题。',
    tags: ['后果', '长远', '深度'], links: ['k-think-systems', 'k-think-inversion', 'k-cross-game'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

const cross: KnowledgeNode[] = [
  {
    id: 'k-cross-psych', title: '认知心理学', domain: '跨学科',
    content: '研究人类认知过程的学科：注意力、记忆、决策、学习。认知偏差(确认偏误、锚定效应、可得性偏差)影响产品设计和商业决策。Kahneman的系统1/系统2理论。',
    tags: ['认知', '偏差', 'Kahneman'], links: ['k-prod-ux', 'k-think-bayesian', 'k-cross-behavior'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-cross-econ', title: '微观经济学', domain: '跨学科',
    content: '供需关系、边际效用、价格弹性、机会成本。经济学思维帮助理解市场行为和资源分配。每个产品决策都有机会成本，每个定价都涉及供需博弈。',
    tags: ['经济', '供需', '边际'], links: ['k-biz-pricing', 'k-cross-game', 'k-biz-moat'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-cross-game', title: '博弈论', domain: '跨学科',
    content: '研究策略互动的数学理论。纳什均衡、囚徒困境、零和/正和博弈、信号博弈。帮助理解竞争策略、市场定价、用户行为。',
    tags: ['博弈', '策略', '均衡'], links: ['k-cross-econ', 'k-ai-multi-agent', 'k-think-secondorder'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-cross-complexity', title: '复杂系统', domain: '跨学科',
    content: '研究涌现现象的跨学科领域。蚁群算法、自组织、混沌理论、幂律分布。复杂系统的特征：非线性、涌现、适应性、自组织。理解互联网和AI生态的关键框架。',
    tags: ['涌现', '自组织', '非线性'], links: ['k-think-systems', 'k-cross-game', 'k-ai-multi-agent'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-cross-behavior', title: '行为经济学', domain: '跨学科',
    content: 'Daniel Kahneman和Richard Thaler的理论：人类决策不是理性的。损失厌恶、禀赋效应、框架效应、助推(Nudge)。产品设计中利用行为偏差提升转化。',
    tags: ['行为', '偏差', '助推'], links: ['k-cross-psych', 'k-cross-econ', 'k-prod-ux'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-cross-network', title: '网络科学', domain: '跨学科',
    content: '研究网络结构和动态的学科。六度分隔、无标度网络、小世界效应、网络中心性。理解社交网络、知识传播、病毒传播的数学基础。',
    tags: ['网络', '图论', '传播'], links: ['k-cross-complexity', 'k-biz-growth', 'k-ds-graph'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

const programming: KnowledgeNode[] = [
  {
    id: 'k-prog-react', title: 'React前端框架', domain: '编程技术',
    content: 'Meta开源的UI构建库。组件化、虚拟DOM、Hooks、状态管理。生态丰富：Next.js(SSR)、React Router、Zustand/Redux。2024年最流行的前端框架。',
    tags: ['前端', '组件化', 'Hooks'], links: ['k-prog-ts', 'k-prog-arch', 'k-prog-api'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prog-ts', title: 'TypeScript', domain: '编程技术',
    content: 'JavaScript的超集，增加了静态类型系统。类型推断、接口、泛型、联合类型。在大型项目中显著提升代码质量和开发效率。已成为现代前端开发的标配。',
    tags: ['类型', 'JavaScript', '静态'], links: ['k-prog-react', 'k-prog-api', 'k-prog-arch'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prog-api', title: 'API设计', domain: '编程技术',
    content: 'RESTful API、GraphQL、gRPC。API是系统间通信的桥梁。好的API设计：一致性、版本管理、错误处理、文档化。OpenAPI/Swagger规范。',
    tags: ['REST', 'GraphQL', '接口'], links: ['k-prog-react', 'k-prog-db', 'k-prog-arch'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prog-db', title: '数据库设计', domain: '编程技术',
    content: '关系型(PostgreSQL, MySQL)vs NoSQL(MongoDB, Redis)。数据建模、索引优化、事务ACID、CAP理论。向量数据库(Pinecone, Weaviate)是AI时代新宠。',
    tags: ['数据库', 'SQL', 'NoSQL'], links: ['k-prog-api', 'k-prog-arch', 'k-ai-embedding'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prog-arch', title: '系统架构', domain: '编程技术',
    content: '微服务vs单体、事件驱动、CQRS、领域驱动设计(DDD)。架构决策需要权衡：性能、可维护性、团队规模、业务复杂度。没有银弹，只有权衡。',
    tags: ['架构', '微服务', 'DDD'], links: ['k-prog-api', 'k-prog-db', 'k-think-systems'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-prog-devops', title: 'DevOps实践', domain: '编程技术',
    content: 'CI/CD持续集成部署、容器化(Docker)、编排(K8s)、监控(Prometheus)、日志(ELK)。DevOps是文化+工具+实践的结合，打破开发和运维的壁垒。',
    tags: ['CI/CD', 'Docker', '部署'], links: ['k-prog-arch', 'k-prog-api'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

const dataScience: KnowledgeNode[] = [
  {
    id: 'k-ds-stats', title: '统计学基础', domain: '数据科学',
    content: '描述统计、推断统计、假设检验、置信区间、P值。A/B测试的数学基础。贝叶斯统计vs频率统计。辛普森悖论、幸存者偏差等常见陷阱。',
    tags: ['统计', '假设检验', 'P值'], links: ['k-prod-ab', 'k-think-bayesian', 'k-ds-ml'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ds-ml', title: '机器学习', domain: '数据科学',
    content: '监督学习(分类/回归)、无监督学习(聚类/降维)、强化学习。核心概念：过拟合/欠拟合、交叉验证、偏差-方差权衡。经典算法：随机森林、SVM、XGBoost。',
    tags: ['ML', '监督学习', '模型'], links: ['k-ds-stats', 'k-ai-fine-tuning', 'k-ds-neural'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ds-neural', title: '神经网络', domain: '数据科学',
    content: '深度学习的基础：多层感知机、反向传播、激活函数、梯度下降。CNN(图像)、RNN/LSTM(序列)、Transformer(一切)。深度学习是现代AI的驱动力。',
    tags: ['深度学习', 'CNN', '反向传播'], links: ['k-ds-ml', 'k-ai-transformer', 'k-ai-llm'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ds-viz', title: '数据可视化', domain: '数据科学',
    content: '将数据转化为视觉洞察。Edward Tufte的信息设计原则。图表选择：柱状图、散点图、热力图、桑基图。工具：D3.js、ECharts、Matplotlib。数据故事讲述。',
    tags: ['可视化', '图表', 'D3'], links: ['k-ds-stats', 'k-prod-ux', 'k-prog-react'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ds-dimreduce', title: '降维技术', domain: '数据科学',
    content: 'PCA主成分分析、t-SNE、UMAP。将高维数据投影到低维空间，保留关键信息。在Embedding可视化、特征工程、数据探索中广泛应用。',
    tags: ['PCA', 't-SNE', '降维'], links: ['k-ds-ml', 'k-ai-embedding', 'k-ds-stats'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
  {
    id: 'k-ds-graph', title: '图分析', domain: '数据科学',
    content: '图数据结构和算法：PageRank、社区发现、最短路径、中心性分析。知识图谱、社交网络分析、推荐系统的基础。Neo4j、NetworkX是常用工具。',
    tags: ['图', 'PageRank', '网络'], links: ['k-cross-network', 'k-ds-ml', 'k-prog-db'],
    source: 'system', mastery: 0, lastReview: null, createdBy: 'system', createdAt: 0,
  },
]

export const systemKnowledgeNodes: KnowledgeNode[] = [
  ...ai,
  ...product,
  ...business,
  ...thinking,
  ...cross,
  ...programming,
  ...dataScience,
]

export function getNodeById(id: string, allNodes: KnowledgeNode[]): KnowledgeNode | undefined {
  return allNodes.find(n => n.id === id)
}

export function getNodesByDomain(domain: Domain, allNodes: KnowledgeNode[]): KnowledgeNode[] {
  return allNodes.filter(n => n.domain === domain)
}
