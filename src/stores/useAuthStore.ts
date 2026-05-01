import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  users: Record<string, { passwordHash: string; user: User }>
  isLoggedIn: boolean

  login: (username: string, password: string) => boolean
  register: (username: string, password: string, avatar?: string) => boolean
  loginAsGuest: () => void
  logout: () => void
  updateStats: (partial: Partial<User['stats']>) => void
  addExp: (amount: number) => void
  addGold: (amount: number) => void
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'kq-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function hashPasswordSync(password: string): string {
  let hash = 0
  const str = password + 'kq-salt-2024'
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function createNewUser(username: string, avatar: string): User {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    username,
    avatar,
    level: 1,
    exp: 0,
    gold: 100,
    createdAt: Date.now(),
    stats: {
      battlesWon: 0,
      battlesLost: 0,
      knowledgeNodes: 0,
      customKnowledge: 0,
      totalCards: 0,
    },
  }
}

function calcLevel(exp: number): number {
  return Math.floor(exp / 200) + 1
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: {},
      isLoggedIn: false,

      register: (username, password, avatar = '🧙‍♂️') => {
        const state = get()
        if (state.users[username]) return false
        const passwordHash = hashPasswordSync(password)
        const user = createNewUser(username, avatar)
        set({
          users: {
            ...state.users,
            [username]: { passwordHash, user },
          },
          user,
          isLoggedIn: true,
        })
        return true
      },

      login: (username, password) => {
        const state = get()
        const record = state.users[username]
        if (!record) return false
        const passwordHash = hashPasswordSync(password)
        if (record.passwordHash !== passwordHash) return false
        set({ user: record.user, isLoggedIn: true })
        return true
      },

      loginAsGuest: () => {
        const guestId = `guest_${Date.now()}`
        const user = createNewUser(guestId, '👤')
        user.username = '旅行者'
        set({ user, isLoggedIn: true })
      },

      logout: () => {
        const state = get()
        if (state.user && state.users[state.user.username]) {
          set({
            users: {
              ...state.users,
              [state.user.username]: {
                ...state.users[state.user.username],
                user: state.user,
              },
            },
            user: null,
            isLoggedIn: false,
          })
        } else {
          set({ user: null, isLoggedIn: false })
        }
      },

      updateStats: (partial) => {
        set((state) => {
          if (!state.user) return state
          return {
            user: {
              ...state.user,
              stats: { ...state.user.stats, ...partial },
            },
          }
        })
      },

      addExp: (amount) => {
        set((state) => {
          if (!state.user) return state
          const newExp = state.user.exp + amount
          return {
            user: {
              ...state.user,
              exp: newExp,
              level: calcLevel(newExp),
            },
          }
        })
      },

      addGold: (amount) => {
        set((state) => {
          if (!state.user) return state
          return {
            user: { ...state.user, gold: state.user.gold + amount },
          }
        })
      },
    }),
    {
      name: 'kq-auth',
    }
  )
)
