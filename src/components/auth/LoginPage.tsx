import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, User, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

const AVATARS = ['🧙‍♂️', '⚔️', '🧠', '🎯', '🚀', '🔮', '🦊', '🐉', '👑', '💎', '🌟', '🎭']

export function LoginPage() {
  const { login, register, loginAsGuest } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [avatar, setAvatar] = useState('🧙‍♂️')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码')
      return
    }
    if (mode === 'login') {
      const ok = login(username.trim(), password)
      if (!ok) setError('用户名或密码错误')
    } else {
      if (password.length < 4) { setError('密码至少4个字符'); return }
      const ok = register(username.trim(), password, avatar)
      if (!ok) setError('用户名已存在')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-500 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ⚔️
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Knowledge Quest</h1>
          <p className="text-gray-400 text-sm mt-2">知识即力量，你的知识就是你的武器</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={14} className="inline mr-1.5" />登录
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={14} className="inline mr-1.5" />注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar picker (register only) */}
            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block">选择头像</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        avatar === a
                          ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110'
                          : 'bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Username */}
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
            >
              {mode === 'login' ? '🚀 进入知识征途' : '✨ 开始冒险'}
            </button>
          </form>

          {/* Guest */}
          <div className="mt-4 text-center">
            <button
              onClick={loginAsGuest}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              👤 以旅行者身份体验
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: '🧠', label: '知识图谱' },
            { icon: '⚔️', label: '卡牌对战' },
            { icon: '✨', label: '秘技系统' },
          ].map(({ icon, label }) => (
            <div key={label} className="text-center bg-gray-900/40 rounded-xl py-3 border border-gray-800/30">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
