import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { LoginPageRoute } from '@/pages/LoginPageRoute'
import { DashboardPage } from '@/pages/DashboardPage'
import { BossSelectPage } from '@/pages/BossSelectPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AchievementsPage } from '@/pages/AchievementsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RootLayout } from '@/components/shell/RootLayout'
import { ToastContainer } from '@/components/shell/ToastContainer'
import { ModalRoot } from '@/components/shell/ModalRoot'
import { ConfirmDialog } from '@/components/shell/ConfirmDialog'
import { useUIStore } from '@/stores/useUIStore'

// Heavy 3D / battle modules are split out for faster initial load.
const KnowledgeGraph = lazy(() =>
  import('@/components/graph/KnowledgeGraph').then((m) => ({ default: m.KnowledgeGraph })),
)
const BattlePage = lazy(() =>
  import('@/pages/BattlePage').then((m) => ({ default: m.BattlePage })),
)
const DeckBuilderPage = lazy(() =>
  import('@/pages/DeckBuilderPage').then((m) => ({ default: m.DeckBuilderPage })),
)

function PageFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-950">
      <div className="flex items-center gap-3 text-white/60 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500/40 border-t-indigo-500 animate-spin" />
        加载中...
      </div>
    </div>
  )
}

export default function App() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPageRoute />} />
          <Route element={<RootLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/graph/:nodeId" element={<KnowledgeGraph />} />
            <Route path="/decks" element={<DeckBuilderPage />} />
            <Route path="/decks/:deckId" element={<DeckBuilderPage />} />
            <Route path="/battle" element={<BossSelectPage />} />
            <Route path="/battle/:bossId" element={<BattlePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer />
      <ModalRoot />
      <ConfirmDialog />
    </BrowserRouter>
  )
}
