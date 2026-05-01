import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Link2, Trash2 } from 'lucide-react'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { DOMAINS, getDomainIcon } from '@/data/domains'
import type { KnowledgeNode, Domain } from '@/types'

export function NodeEditor({
  node,
  onClose,
  isNew,
}: {
  node?: KnowledgeNode
  onClose: () => void
  isNew: boolean
}) {
  const { addNode, updateNode, deleteNode, nodes } = useKnowledgeStore()
  const { user } = useAuthStore()
  const openConfirm = useUIStore((s) => s.openConfirm)
  const pushToast = useUIStore((s) => s.pushToast)

  const [title, setTitle] = useState(node?.title ?? '')
  const [domain, setDomain] = useState<Domain>(node?.domain ?? '用户自定义')
  const [content, setContent] = useState(node?.content ?? '')
  const [tags, setTags] = useState(node?.tags.join(', ') ?? '')
  const [selectedLinks, setSelectedLinks] = useState<string[]>(node?.links ?? [])
  const [linkSearch, setLinkSearch] = useState('')

  const filteredForLink = nodes
    .filter(
      (n) =>
        n.id !== node?.id &&
        !selectedLinks.includes(n.id) &&
        (linkSearch ? n.title.toLowerCase().includes(linkSearch.toLowerCase()) : true),
    )
    .slice(0, 8)

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      pushToast('标题与内容不能为空', 'warning')
      return
    }
    const tagArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (isNew) {
      const newNode: KnowledgeNode = {
        id: `k-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim(),
        domain,
        content: content.trim(),
        tags: tagArr,
        links: selectedLinks,
        source: 'user',
        mastery: 100,
        lastReview: Date.now(),
        createdBy: user?.id ?? 'guest',
        createdAt: Date.now(),
      }
      addNode(newNode)
      pushToast(`✨ 已创建秘技节点：${newNode.title}`, 'success')
    } else if (node) {
      updateNode(node.id, {
        title: title.trim(),
        domain,
        content: content.trim(),
        tags: tagArr,
        links: selectedLinks,
      })
      pushToast('节点已更新', 'success')
    }
    onClose()
  }

  const handleDelete = () => {
    if (!node) return
    openConfirm({
      title: '确认删除该节点？',
      message: '该操作会移除节点及所有反向链接，对应的秘技卡也将消失。',
      destructive: true,
      confirmText: '删除',
      onConfirm: () => {
        deleteNode(node.id)
        pushToast('节点已删除', 'info')
        onClose()
      },
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {isNew ? '✨ 创建知识节点' : `📝 编辑：${node?.title}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">标题 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
              placeholder="知识点标题"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">知识域</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d.name}
                  onClick={() => setDomain(d.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    domain === d.name ? 'ring-2 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                  style={domain === d.name ? { backgroundColor: d.color + '30', borderColor: d.color } : {}}
                >
                  {d.icon} {d.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">内容描述 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50 resize-none"
              placeholder="详细描述这个知识点..."
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">标签（逗号分隔）</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
              placeholder="标签1, 标签2, 标签3"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              <Link2 size={12} className="inline mr-1" />
              关联知识（{selectedLinks.length} 个 — 关联越多，生成的卡牌越强）
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedLinks.map((lid) => {
                const ln = nodes.find((n) => n.id === lid)
                return (
                  <span
                    key={lid}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs"
                  >
                    {ln?.title ?? lid}
                    <button onClick={() => setSelectedLinks(selectedLinks.filter((l) => l !== lid))}>
                      <X size={10} />
                    </button>
                  </span>
                )
              })}
            </div>
            <input
              value={linkSearch}
              onChange={(e) => setLinkSearch(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 mb-1"
              placeholder="搜索要关联的知识..."
            />
            <div className="flex flex-wrap gap-1.5">
              {filteredForLink.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedLinks([...selectedLinks, n.id])
                    setLinkSearch('')
                  }}
                  className="px-2 py-1 rounded-full text-xs bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  {getDomainIcon(n.domain)} {n.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(isNew || node?.source === 'user') && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            ✨ 自定义知识将自动生成「秘技卡」——你专属的隐藏战斗卡牌！关联的知识越多，秘技卡越强。
          </div>
        )}

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> {isNew ? '创建节点' : '保存修改'}
          </button>
          {!isNew && node?.source === 'user' && (
            <button
              onClick={handleDelete}
              className="py-2.5 px-4 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
