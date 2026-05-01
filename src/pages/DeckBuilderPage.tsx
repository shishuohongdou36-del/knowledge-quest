import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, ArrowLeft, Trash2, Copy, Edit3, Search, Save, Layers, Sparkles,
} from 'lucide-react'
import { useDeckStore } from '@/stores/useDeckStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { useUIStore } from '@/stores/useUIStore'
import { CardPreview } from '@/components/deck/CardPreview'
import { ManaCurve } from '@/components/deck/ManaCurve'
import { DOMAINS, getDomainColor } from '@/data/domains'
import { currentMastery, masteryMultiplier } from '@/utils/memoryDecay'
import { deckTuning, decayTuning } from '@/config/tuning'
import type { Domain, KnowledgeNode, DeckBlueprint } from '@/types'

// ============================================================
// /decks                 — list view
// /decks/:deckId         — editor view (left: card pool, right: deck slots)
// ============================================================

export function DeckBuilderPage() {
  const { deckId } = useParams<{ deckId: string }>()
  if (deckId) return <DeckEditor deckId={deckId} />
  return <DeckList />
}

// ============================================================
// LIST VIEW
// ============================================================
function DeckList() {
  const navigate = useNavigate()
  const { decks, createDeck, deleteDeck, duplicateDeck } = useDeckStore()
  const { nodes } = useKnowledgeStore()
  const openConfirm = useUIStore((s) => s.openConfirm)
  const pushToast = useUIStore((s) => s.pushToast)

  const handleCreate = () => {
    if (decks.length >= deckTuning.decksPerUserLimit) {
      pushToast(`卡组数量已达上限（${deckTuning.decksPerUserLimit}）`, 'warning')
      return
    }
    const id = createDeck('新卡组', null)
    navigate(`/decks/${id}`)
  }

  const handleDelete = (id: string, name: string) => {
    openConfirm({
      title: '确认删除该卡组？',
      message: `“${name}”将被永久删除（不影响知识节点本身）。`,
      destructive: true,
      confirmText: '删除',
      onConfirm: () => {
        deleteDeck(id)
        pushToast('卡组已删除', 'info')
      },
    })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers size={20} className="text-indigo-400" />
            我的卡组
          </h1>
          <span className="text-sm text-white/40 ml-2">
            {decks.length} / {deckTuning.decksPerUserLimit}
          </span>
          <button
            onClick={handleCreate}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30"
          >
            <Plus size={16} /> 创建卡组
          </button>
        </div>

        {decks.length === 0 ? (
          <EmptyDeckState onCreate={handleCreate} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((d) => (
              <DeckCard
                key={d.id}
                deck={d}
                nodes={nodes}
                onOpen={() => navigate(`/decks/${d.id}`)}
                onDuplicate={() => {
                  const newId = duplicateDeck(d.id)
                  if (newId) pushToast('已复制卡组', 'success')
                  else pushToast(`卡组数量已达上限`, 'warning')
                }}
                onDelete={() => handleDelete(d.id, d.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyDeckState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🎴</div>
      <h2 className="text-lg font-semibold text-white mb-2">还没有自定义卡组</h2>
      <p className="text-sm text-gray-400 max-w-md mb-6">
        手工挑选你最熟悉的知识，组成专属于你的 30 张战斗卡组。
        没有保存卡组时，对战会自动生成基于知识域的随机卡组。
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      >
        <Plus size={16} /> 创建第一个卡组
      </button>
    </div>
  )
}

function DeckCard({
  deck,
  nodes,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  deck: DeckBlueprint
  nodes: KnowledgeNode[]
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const cardNodes = useMemo(
    () => deck.knowledgeIds.map((id) => nodes.find((n) => n.id === id)).filter((n): n is KnowledgeNode => Boolean(n)),
    [deck.knowledgeIds, nodes],
  )
  const decayedCount = cardNodes.filter((n) => masteryMultiplier(currentMastery(n)) <= 0).length
  const avgMastery = cardNodes.length
    ? Math.round(cardNodes.reduce((s, n) => s + currentMastery(n), 0) / cardNodes.length)
    : 0
  const color = deck.primaryDomain ? getDomainColor(deck.primaryDomain) : '#6366f1'
  const isComplete = deck.knowledgeIds.length === deckTuning.size

  return (
    <motion.div
      className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{deck.name}</h3>
          <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
            <span style={{ color }}>{deck.primaryDomain ?? '混合'}</span>
            <span>·</span>
            <span className={isComplete ? 'text-emerald-300' : 'text-amber-300'}>
              {deck.knowledgeIds.length} / {deckTuning.size}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10"
            title="复制"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/15"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="my-3">
        <ManaCurve nodes={cardNodes} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-white/5 rounded-md px-2 py-1.5">
          <div className="text-white/40 text-[10px]">平均掌握度</div>
          <div className="text-white font-medium">{avgMastery}%</div>
        </div>
        <div className="bg-white/5 rounded-md px-2 py-1.5">
          <div className="text-white/40 text-[10px]">已遗忘</div>
          <div className={decayedCount > 0 ? 'text-rose-300 font-medium' : 'text-emerald-300 font-medium'}>
            {decayedCount} 张
          </div>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
      >
        <Edit3 size={12} /> 编辑卡组
      </button>
    </motion.div>
  )
}

// ============================================================
// EDITOR VIEW
// ============================================================
function DeckEditor({ deckId }: { deckId: string }) {
  const navigate = useNavigate()
  const { decks, updateDeck, addCard, removeCardAt, getDeck } = useDeckStore()
  const { nodes } = useKnowledgeStore()
  const pushToast = useUIStore((s) => s.pushToast)

  const deck = getDeck(deckId)

  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<Domain | null>(null)
  const [showSecretOnly, setShowSecretOnly] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(deck?.name ?? '')

  useEffect(() => {
    if (deck) setNameDraft(deck.name)
  }, [deck?.id, deck?.name, deck])

  if (!deck) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">找不到卡组</p>
          <button
            onClick={() => navigate('/decks')}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
          >
            返回卡组列表
          </button>
        </div>
      </div>
    )
  }

  const cardNodes = deck.knowledgeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is KnowledgeNode => Boolean(n))

  const copyMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const id of deck.knowledgeIds) m.set(id, (m.get(id) ?? 0) + 1)
    return m
  }, [deck.knowledgeIds])

  // Pool: filter + sort by mana cost
  const pool = useMemo(() => {
    const q = search.trim().toLowerCase()
    return nodes
      .filter((n) => {
        if (showSecretOnly && n.source !== 'user') return false
        if (domainFilter && n.domain !== domainFilter) return false
        if (q) {
          const hit =
            n.title.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
          if (!hit) return false
        }
        return true
      })
      .sort((a, b) => {
        // by mastery desc, then linkCount desc
        const ma = currentMastery(a)
        const mb = currentMastery(b)
        if (ma !== mb) return mb - ma
        return b.links.length - a.links.length
      })
  }, [nodes, search, domainFilter, showSecretOnly])

  const handleAdd = (knowledgeId: string) => {
    const result = addCard(deck.id, knowledgeId)
    if (!result.ok) pushToast(result.reason ?? '无法添加', 'warning')
  }

  const decayedInDeck = cardNodes.filter((n) => currentMastery(n) < decayTuning.masteryFragile).length
  const avgMastery = cardNodes.length
    ? Math.round(cardNodes.reduce((s, n) => s + currentMastery(n), 0) / cardNodes.length)
    : 0

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/decks')}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="返回卡组列表"
          >
            <ArrowLeft size={18} />
          </button>

          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                updateDeck(deck.id, { name: nameDraft.trim() || '未命名卡组' })
                setEditingName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setNameDraft(deck.name)
                  setEditingName(false)
                }
              }}
              className="text-xl font-bold bg-white/5 border border-white/20 rounded-md px-2 py-1 text-white outline-none focus:border-indigo-500"
            />
          ) : (
            <h1
              className="text-xl font-bold text-white cursor-text hover:underline decoration-dotted"
              onClick={() => setEditingName(true)}
            >
              {deck.name}
            </h1>
          )}

          <select
            value={deck.primaryDomain ?? ''}
            onChange={(e) =>
              updateDeck(deck.id, { primaryDomain: (e.target.value as Domain) || null })
            }
            className="bg-white/5 border border-white/20 rounded-md px-2 py-1 text-xs text-white outline-none"
          >
            <option value="">混合主域</option>
            {DOMAINS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.icon} {d.name}
              </option>
            ))}
          </select>

          <span className="ml-auto text-sm text-white/50">
            <span className={deck.knowledgeIds.length === deckTuning.size ? 'text-emerald-300' : 'text-amber-300'}>
              {deck.knowledgeIds.length}
            </span>
            <span> / {deckTuning.size}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* LEFT: card pool */}
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
                <Search size={14} className="text-white/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索知识 / 标签..."
                  className="bg-transparent outline-none text-sm text-white placeholder-white/40 w-full"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setDomainFilter(null)}
                  className={`px-2 py-1 rounded text-xs ${
                    !domainFilter ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  全部
                </button>
                {DOMAINS.filter((d) => d.name !== '用户自定义').map((d) => (
                  <button
                    key={d.name}
                    onClick={() => setDomainFilter(domainFilter === d.name ? null : d.name)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      domainFilter === d.name ? 'text-white' : 'text-white/50 hover:text-white'
                    }`}
                    style={domainFilter === d.name ? { backgroundColor: d.color + '40' } : {}}
                    title={d.name}
                  >
                    {d.icon}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSecretOnly((s) => !s)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  showSecretOnly
                    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                    : 'text-white/50 hover:text-white'
                }`}
                title="只显示秘技"
              >
                <Sparkles size={12} /> 秘技
              </button>
            </div>

            <div className="text-[11px] text-white/40 mb-2">
              {pool.length} 张可选 · 点击加入卡组
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              {pool.map((n) => (
                <CardPreview
                  key={n.id}
                  node={n}
                  copies={copyMap.get(n.id) ?? 0}
                  onClick={() => handleAdd(n.id)}
                />
              ))}
              {pool.length === 0 && (
                <div className="col-span-full text-center text-white/40 text-sm py-12">
                  没有匹配的知识节点
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: deck slots */}
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-white">当前卡组</h3>
              <button
                onClick={() => pushToast('已自动保存', 'success')}
                className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25"
                title="所有更改自动保存"
              >
                <Save size={12} /> 已自动保存
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
              <div className="bg-white/5 rounded px-2 py-1.5">
                <div className="text-white/40 text-[10px]">平均掌握度</div>
                <div className="text-white font-medium">{avgMastery}%</div>
              </div>
              <div className="bg-white/5 rounded px-2 py-1.5">
                <div className="text-white/40 text-[10px]">已遗忘</div>
                <div className={decayedInDeck > 0 ? 'text-rose-300 font-medium' : 'text-emerald-300 font-medium'}>
                  {decayedInDeck} 张
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-white/50 mb-1">法力曲线</div>
              <ManaCurve nodes={cardNodes} />
            </div>

            <div className="text-[11px] text-white/40 mb-2">
              点击移除一张
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[calc(100vh-440px)]">
              {cardNodes.length === 0 && (
                <div className="text-center text-white/40 text-sm py-12">
                  从左侧选择卡牌加入卡组
                </div>
              )}
              {cardNodes.map((n, idx) => (
                <CardPreview
                  key={`${n.id}-${idx}`}
                  node={n}
                  size="sm"
                  onClick={() => removeCardAt(deck.id, idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
