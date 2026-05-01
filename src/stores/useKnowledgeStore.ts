import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KnowledgeNode, Domain } from '@/types'
import { systemKnowledgeNodes } from '@/data/knowledgeGraph'
import { reinforce, type ReinforceAction } from '@/utils/memoryDecay'

interface KnowledgeStore {
  nodes: KnowledgeNode[]
  selectedNodeId: string | null
  searchQuery: string
  filterDomain: Domain | null

  // Actions
  initNodes: () => void
  selectNode: (id: string | null) => void
  setSearch: (q: string) => void
  setFilterDomain: (d: Domain | null) => void
  addNode: (node: KnowledgeNode) => void
  updateNode: (id: string, updates: Partial<KnowledgeNode>) => void
  deleteNode: (id: string) => void
  linkNodes: (fromId: string, toId: string) => void
  unlinkNodes: (fromId: string, toId: string) => void
  updateMastery: (id: string, mastery: number) => void
  /** Apply a reinforcement action; returns gained mastery (0 if daily-capped). */
  reinforceNode: (id: string, action: ReinforceAction) => number
  /** @deprecated use reinforceNode('reread'). Kept for legacy callers. */
  reviewNode: (id: string) => void
  getNode: (id: string) => KnowledgeNode | undefined
  getFilteredNodes: () => KnowledgeNode[]
  getUserNodes: () => KnowledgeNode[]
}

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      selectedNodeId: null,
      searchQuery: '',
      filterDomain: null,

      initNodes: () => {
        const state = get()
        if (state.nodes.length === 0) {
          set({ nodes: systemKnowledgeNodes.map(n => ({ ...n, createdAt: Date.now() })) })
        } else {
          // Merge new system nodes that don't exist yet
          const existingIds = new Set(state.nodes.map(n => n.id))
          const newNodes = systemKnowledgeNodes.filter(n => !existingIds.has(n.id))
          if (newNodes.length > 0) {
            set({ nodes: [...state.nodes, ...newNodes.map(n => ({ ...n, createdAt: Date.now() }))] })
          }
        }
      },

      selectNode: (id) => set({ selectedNodeId: id }),
      setSearch: (q) => set({ searchQuery: q }),
      setFilterDomain: (d) => set({ filterDomain: d }),

      addNode: (node) => {
        set((state) => {
          // Also add backlinks to linked nodes
          const updatedNodes = state.nodes.map(n => {
            if (node.links.includes(n.id) && !n.links.includes(node.id)) {
              return { ...n, links: [...n.links, node.id] }
            }
            return n
          })
          return { nodes: [...updatedNodes, node] }
        })
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
        }))
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes
            .filter(n => n.id !== id)
            .map(n => ({
              ...n,
              links: n.links.filter(l => l !== id),
            })),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        }))
        // Cascade: remove from any saved deck blueprints. Late-imported to avoid circular dep.
        import('@/stores/useDeckStore').then(({ useDeckStore }) => {
          useDeckStore.getState().purgeKnowledgeId(id)
        })
      },

      linkNodes: (fromId, toId) => {
        set((state) => ({
          nodes: state.nodes.map(n => {
            if (n.id === fromId && !n.links.includes(toId)) {
              return { ...n, links: [...n.links, toId] }
            }
            if (n.id === toId && !n.links.includes(fromId)) {
              return { ...n, links: [...n.links, fromId] }
            }
            return n
          }),
        }))
      },

      unlinkNodes: (fromId, toId) => {
        set((state) => ({
          nodes: state.nodes.map(n => {
            if (n.id === fromId) return { ...n, links: n.links.filter(l => l !== toId) }
            if (n.id === toId) return { ...n, links: n.links.filter(l => l !== fromId) }
            return n
          }),
        }))
      },

      updateMastery: (id, mastery) => {
        set((state) => ({
          nodes: state.nodes.map(n =>
            n.id === id ? { ...n, mastery: Math.max(0, Math.min(100, mastery)) } : n
          ),
        }))
      },

      reinforceNode: (id, action) => {
        let gainedOut = 0
        set((state) => {
          const target = state.nodes.find(n => n.id === id)
          if (!target) return state
          const { node: updated, gained } = reinforce(target, action)
          gainedOut = gained
          return {
            nodes: state.nodes.map(n => (n.id === id ? updated : n)),
          }
        })
        return gainedOut
      },

      reviewNode: (id) => {
        get().reinforceNode(id, 'reread')
      },

      getNode: (id) => get().nodes.find(n => n.id === id),

      getFilteredNodes: () => {
        const { nodes, searchQuery, filterDomain } = get()
        let result = nodes
        if (filterDomain) {
          result = result.filter(n => n.domain === filterDomain)
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          result = result.filter(n =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some(t => t.toLowerCase().includes(q))
          )
        }
        return result
      },

      getUserNodes: () => get().nodes.filter(n => n.source === 'user'),
    }),
    {
      name: 'kq-knowledge',
      partialize: (state) => ({ nodes: state.nodes }),
    }
  )
)
