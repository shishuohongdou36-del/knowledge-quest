import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { AppHeader } from '@/components/layout/AppHeader'
import { BackgroundFX } from '@/components/shell/BackgroundFX'

/**
 * Authenticated shell: enforces login, mounts header, and renders the active route.
 * Toast/Modal/Confirm overlays live in App.tsx so they cover all routes.
 */
export function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuthStore()
  const initNodes = useKnowledgeStore((s) => s.initNodes)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isLoggedIn, navigate, location])

  useEffect(() => {
    if (isLoggedIn) initNodes()
  }, [isLoggedIn, initNodes])

  // Achievement evaluation: run on boot + whenever core state mutates.
  // Subscribing to all three sources keeps the predicate pure & cheap.
  const nodes = useKnowledgeStore((s) => s.nodes)
  const decks = useDeckStore((s) => s.decks)
  const battlesWon = useAuthStore((s) => s.user?.stats.battlesWon ?? 0)
  const evaluateAch = useAchievementStore((s) => s.evaluate)

  useEffect(() => {
    if (!isLoggedIn) return
    evaluateAch()
  }, [isLoggedIn, nodes, decks, battlesWon, evaluateAch])

  if (!isLoggedIn) return null

  // Battle page wants full-screen, no header
  const isBattlePage = /^\/battle\/[^/]+/.test(location.pathname)

  if (isBattlePage) {
    return (
      <div className="min-h-screen text-white relative">
        <BackgroundFX />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white relative">
      <BackgroundFX />
      <AppHeader />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
