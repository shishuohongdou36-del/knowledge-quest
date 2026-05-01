import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeckBlueprint, Domain, KnowledgeNode, BattleCard } from '@/types'
import { deckTuning } from '@/config/tuning'
import { generateCardFromKnowledge, shuffleDeck } from '@/utils/cardGenerator'
import { currentMastery, masteryMultiplier } from '@/utils/memoryDecay'

interface DeckStore {
  decks: DeckBlueprint[]

  createDeck: (name: string, primaryDomain: Domain | null) => string
  updateDeck: (id: string, updates: Partial<Omit<DeckBlueprint, 'id' | 'createdAt'>>) => void
  deleteDeck: (id: string) => void
  duplicateDeck: (id: string) => string | null
  getDeck: (id: string) => DeckBlueprint | undefined

  /** Add a knowledge node id to a deck (respecting size + per-card copy limit). Returns true if added. */
  addCard: (deckId: string, knowledgeId: string) => { ok: boolean; reason?: string }
  /** Remove a single copy at the given index. */
  removeCardAt: (deckId: string, index: number) => void
  /** Remove ALL references to a deleted KnowledgeNode across every deck (cascade). */
  purgeKnowledgeId: (knowledgeId: string) => void

  /**
   * Materialize a saved deck into BattleCards using the live KnowledgeNode list.
   * Skips knowledge nodes that no longer exist or are below the disabled mastery threshold.
   * Returns null if the deck has < 5 valid cards (cannot start a battle).
   */
  buildBattleCards: (deckId: string, nodes: KnowledgeNode[], now?: number) => BattleCard[] | null
}

const newId = () => `deck-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      decks: [],

      createDeck: (name, primaryDomain) => {
        const id = newId()
        set((state) => {
          if (state.decks.length >= deckTuning.decksPerUserLimit) return state
          const blueprint: DeckBlueprint = {
            id,
            name: name.trim() || '未命名卡组',
            primaryDomain,
            knowledgeIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          return { decks: [...state.decks, blueprint] }
        })
        return id
      },

      updateDeck: (id, updates) => {
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d,
          ),
        }))
      },

      deleteDeck: (id) => {
        set((state) => ({ decks: state.decks.filter((d) => d.id !== id) }))
      },

      duplicateDeck: (id) => {
        const src = get().decks.find((d) => d.id === id)
        if (!src) return null
        const newDeckId = newId()
        set((state) => {
          if (state.decks.length >= deckTuning.decksPerUserLimit) return state
          return {
            decks: [
              ...state.decks,
              {
                ...src,
                id: newDeckId,
                name: `${src.name} 副本`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          }
        })
        return newDeckId
      },

      getDeck: (id) => get().decks.find((d) => d.id === id),

      addCard: (deckId, knowledgeId) => {
        const deck = get().decks.find((d) => d.id === deckId)
        if (!deck) return { ok: false, reason: 'Deck not found' }
        if (deck.knowledgeIds.length >= deckTuning.size) {
          return { ok: false, reason: `卡组已满（${deckTuning.size}/${deckTuning.size}）` }
        }
        const copies = deck.knowledgeIds.filter((id) => id === knowledgeId).length
        if (copies >= deckTuning.copiesPerCardLimit) {
          return { ok: false, reason: `单卡上限 ${deckTuning.copiesPerCardLimit} 张` }
        }
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? { ...d, knowledgeIds: [...d.knowledgeIds, knowledgeId], updatedAt: Date.now() }
              : d,
          ),
        }))
        return { ok: true }
      },

      removeCardAt: (deckId, index) => {
        set((state) => ({
          decks: state.decks.map((d) => {
            if (d.id !== deckId) return d
            const next = [...d.knowledgeIds]
            next.splice(index, 1)
            return { ...d, knowledgeIds: next, updatedAt: Date.now() }
          }),
        }))
      },

      purgeKnowledgeId: (knowledgeId) => {
        set((state) => ({
          decks: state.decks.map((d) => {
            if (!d.knowledgeIds.includes(knowledgeId)) return d
            return {
              ...d,
              knowledgeIds: d.knowledgeIds.filter((id) => id !== knowledgeId),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      buildBattleCards: (deckId, nodes, now = Date.now()) => {
        const deck = get().decks.find((d) => d.id === deckId)
        if (!deck) return null
        const nodeMap = new Map(nodes.map((n) => [n.id, n]))
        const cards: BattleCard[] = []
        let serial = 0
        for (const knowledgeId of deck.knowledgeIds) {
          const node = nodeMap.get(knowledgeId)
          if (!node) continue
          // Skip cards that are currently disabled by decay
          if (masteryMultiplier(currentMastery(node, now)) <= 0) continue
          const card = generateCardFromKnowledge(node, now)
          cards.push({ ...card, id: `${card.id}-deck-${serial++}` })
        }
        if (cards.length < 5) return null
        return shuffleDeck(cards)
      },
    }),
    {
      name: 'kq-decks',
      partialize: (state) => ({ decks: state.decks }),
    },
  ),
)
