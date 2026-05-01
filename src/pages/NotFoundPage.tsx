import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="text-6xl mb-4">🌫️</div>
      <h1 className="text-2xl font-bold text-white mb-2">这条路径在你的图谱里不存在</h1>
      <p className="text-sm text-gray-400 mb-6">404 — 该页面已遗忘或从未存在。</p>
      <Link to="/" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
        返回首页
      </Link>
    </div>
  )
}
