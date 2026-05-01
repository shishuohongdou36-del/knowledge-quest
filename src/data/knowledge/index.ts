import { aiTechCards } from './ai-tech'
import { productDesignCards } from './product-design'
import { businessCards } from './business'
import { thinkingCards } from './thinking'
import { crossDisciplineCards } from './cross-discipline'
import type { KnowledgeCard } from '@/types'

export const allCards: KnowledgeCard[] = [
  ...aiTechCards,
  ...productDesignCards,
  ...businessCards,
  ...thinkingCards,
  ...crossDisciplineCards,
]

export function getCardById(id: string): KnowledgeCard | undefined {
  return allCards.find(c => c.id === id)
}

export function getCardsByDomain(domain: string): KnowledgeCard[] {
  return allCards.filter(c => c.domain === domain)
}

export { aiTechCards, productDesignCards, businessCards, thinkingCards, crossDisciplineCards }
