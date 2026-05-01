import type { DomainInfo, Domain } from '@/types'

export const DOMAINS: DomainInfo[] = [
  {
    name: 'AI技术',
    icon: '🧠',
    color: '#6366f1',
    description: 'LLM、Agent、RAG、Transformer、训练、推理',
  },
  {
    name: '产品设计',
    icon: '🎯',
    color: '#f59e0b',
    description: '需求分析、UX、PRD、MVP、增长',
  },
  {
    name: '商业洞察',
    icon: '📊',
    color: '#10b981',
    description: '商业模式、定价、市场、增长飞轮',
  },
  {
    name: '思维框架',
    icon: '💡',
    color: '#8b5cf6',
    description: '第一性原理、逆向思维、系统思维、贝叶斯思维',
  },
  {
    name: '跨学科',
    icon: '🔗',
    color: '#ec4899',
    description: '心理学、经济学、博弈论、复杂系统、认知科学',
  },
  {
    name: '编程技术',
    icon: '⚙️',
    color: '#06b6d4',
    description: '前端、后端、数据库、架构、DevOps',
  },
  {
    name: '数据科学',
    icon: '📈',
    color: '#f97316',
    description: '统计、机器学习、数据分析、可视化',
  },
  {
    name: '用户自定义',
    icon: '✨',
    color: '#fbbf24',
    description: '用户创建的任何领域知识',
  },
]

export function getDomainInfo(name: string): DomainInfo | undefined {
  return DOMAINS.find(d => d.name === name)
}

export function getDomainColor(domain: Domain): string {
  return getDomainInfo(domain)?.color ?? '#6b7280'
}

export function getDomainIcon(domain: Domain): string {
  return getDomainInfo(domain)?.icon ?? '📌'
}
