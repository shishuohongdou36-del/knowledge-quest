import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AchievementContext } from '@/types'
import { evaluateAll } from '@/data/achievements'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'

// ============================================================
// Achievement progress store. Pure recorder; never grants stat rewards
// (would violate Pillar 1/3). Only tracks unlocks + acknowledgement.
// ============================================================

interface AchievementStore {
  /** id -> unlockedAt timestamp */
  unlockedIds: Record<string, number>
  /** ids the user has seen on /achievements page (no header dot) */
  seenIds: Record<string, true>

  /** Newly unlocked but unseen — drives the header badge dot */
  hasUnseen: () => boolean

  /** Sweep all achievements; toast each newly unlocked one. */
  evaluate: () => void

  /** Mark all currently unlocked as seen (called when user visits /achievements). */
  markAllSeen: () => void
}

function buildContext(): AchievementContext {
  const { nodes } = useKnowledgeStore.getState()
  const { decks } = useDeckStore.getState()
  const { user } = useAuthStore.getState()
  return {
    nodes,
    decks,
    user,
    battlesWon: user?.stats.battlesWon ?? 0,
  }
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlockedIds: {},
      seenIds: {},

      hasUnseen: () => {
        const { unlockedIds, seenIds } = get()
        return Object.keys(unlockedIds).some((id) => !seenIds[id])
      },

      evaluate: () => {
        const ctx = buildContext()
        const results = evaluateAll(ctx)
        const { unlockedIds } = get()
        const now = Date.now()
        const newlyUnlocked: typeof results = []
        const next = { ...unlockedIds }

        for (const r of results) {
          if (r.unlocked && !next[r.def.id]) {
            next[r.def.id] = now
            newlyUnlocked.push(r)
          }
        }

        if (newlyUnlocked.length > 0) {
          set({ unlockedIds: next })
          const pushToast = useUIStore.getState().pushToast
          for (const r of newlyUnlocked) {
            pushToast(`🏆 成就解锁：${r.def.icon} ${r.def.title}`, 'success')
          }
        }
      },

      markAllSeen: () => {
        const { unlockedIds } = get()
        const seenIds: Record<string, true> = {}
        for (const id of Object.keys(unlockedIds)) seenIds[id] = true
        set({ seenIds })
      },
    }),
    {
      name: 'kq-achievements',
      partialize: (s) => ({ unlockedIds: s.unlockedIds, seenIds: s.seenIds }),
    },
  ),
)
