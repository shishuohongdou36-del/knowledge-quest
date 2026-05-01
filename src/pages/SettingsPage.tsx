import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Moon, LogOut, Download, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useUIStore } from '@/stores/useUIStore'

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { nodes } = useKnowledgeStore()
  const { theme, toggleTheme, openConfirm, pushToast } = useUIStore()

  const isGuest = user?.username === '旅行者' && user?.id.startsWith('guest_')

  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: Date.now(),
      user,
      nodes,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `knowledge-quest-${user?.username ?? 'guest'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    pushToast('数据已导出', 'success')
  }

  const handleClearAll = () => {
    openConfirm({
      title: '确认清空所有数据？',
      message: '这会清空你的知识图谱、卡牌、对战记录。本操作不可恢复。',
      confirmText: '确认清空',
      destructive: true,
      onConfirm: () => {
        localStorage.clear()
        location.reload()
      },
    })
  }

  const handleLogout = () => {
    openConfirm({
      title: '确认登出？',
      message: isGuest ? '访客数据保留在本机，登出后下次仍可继续。' : '你的数据已保存。',
      confirmText: '登出',
      onConfirm: () => {
        logout()
        navigate('/login')
      },
    })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-white">设置</h1>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <section className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">外观</h2>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5"
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span className="text-sm text-white">主题：{theme === 'dark' ? '深色' : '浅色'}</span>
              <span className="ml-auto text-xs text-white/40">点击切换</span>
            </button>
          </section>

          {/* Data */}
          <section className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">数据</h2>
            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white"
              >
                <Download size={16} />
                导出全部数据（JSON）
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-rose-500/10 text-sm text-rose-400"
              >
                <Trash2 size={16} />
                清空所有数据
              </button>
            </div>
          </section>

          {/* Account */}
          <section className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">账号</h2>
            <div className="text-xs text-white/60 mb-3">
              用户名：{user?.username ?? '—'} · 等级 {user?.level ?? 1} · {user?.exp ?? 0} EXP
            </div>
            {isGuest && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2 mb-3">
                ⚠️ 你正以访客模式登录。数据仅保存在当前浏览器，更换设备会丢失。
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-white/80"
            >
              <LogOut size={16} />
              登出
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
