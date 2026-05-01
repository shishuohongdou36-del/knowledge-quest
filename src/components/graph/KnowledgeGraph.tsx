import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Crosshair,
  Filter,
  Link2,
  Network,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import * as THREE from 'three'
import SpriteText from 'three-spritetext'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { DOMAINS } from '@/data/domains'
import { currentMastery } from '@/utils/memoryDecay'
import { decayTuning } from '@/config/tuning'
import { NodeEditor } from '@/components/graph/NodeEditor'
import { NodeDetailPanel } from '@/components/graph/NodeDetailPanel'
import type { KnowledgeNode, Domain } from '@/types'

interface GraphNode {
  id: string
  name: string
  domain: Domain
  source: 'system' | 'user'
  liveMastery: number
  linkCount: number
  val: number
  color: string
  dimColor: string
  searchMatch: boolean
  isDecayed: boolean
  x?: number
  y?: number
  z?: number
}

interface GraphLink {
  source: string
  target: string
  value: number
}

function linkEndpointId(endpoint: string | GraphNode): string {
  return typeof endpoint === 'object' ? endpoint.id : endpoint
}

export function KnowledgeGraph() {
  const {
    nodes,
    selectNode,
    selectedNodeId,
    searchQuery,
    setSearch,
    filterDomain,
    setFilterDomain,
    initNodes,
  } = useKnowledgeStore()

  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 1200, h: 800 })
  const [showEditor, setShowEditor] = useState(false)
  const [editingNode, setEditingNode] = useState<KnowledgeNode | undefined>()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    initNodes()
  }, [initNodes])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const graphModel = useMemo(() => {
    const now = Date.now()
    const q = searchQuery.trim().toLowerCase()
    const domainNodes = filterDomain ? nodes.filter((n) => n.domain === filterDomain) : nodes
    const visibleIds = new Set(domainNodes.map((n) => n.id))

    const searchMatches = new Set<string>()
    if (q) {
      for (const n of domainNodes) {
        const hit =
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        if (hit) searchMatches.add(n.id)
      }
    }

    const graphNodes: GraphNode[] = domainNodes.map((n) => {
      const live = currentMastery(n, now)
      const baseColor = n.source === 'user' ? '#737373' : '#a3a3a3'
      const everReviewed = n.lastReview !== null
      const isDecayed = everReviewed && live < decayTuning.masteryFragile
      const masteryWeight = Math.max(0.72, live / 100)
      return {
        id: n.id,
        name: n.title,
        domain: n.domain,
        source: n.source,
        liveMastery: Math.round(live),
        linkCount: n.links.length,
        val: 3.6 + Math.min(5.5, n.links.length * 0.85) + (n.source === 'user' ? 1.8 : 0) + masteryWeight * 1.4,
        color: isDecayed ? '#c4c4c4' : baseColor,
        dimColor: '#d9d9d9',
        searchMatch: !q || searchMatches.has(n.id),
        isDecayed,
      }
    })

    const graphLinks: GraphLink[] = []
    const seen = new Set<string>()
    const neighborMap = new Map<string, Set<string>>()
    for (const n of domainNodes) {
      if (!neighborMap.has(n.id)) neighborMap.set(n.id, new Set())
      for (const linkedId of n.links) {
        if (!visibleIds.has(linkedId)) continue
        const key = [n.id, linkedId].sort().join('|')
        if (!seen.has(key)) {
          seen.add(key)
          graphLinks.push({ source: n.id, target: linkedId, value: 1 })
        }
        if (!neighborMap.has(linkedId)) neighborMap.set(linkedId, new Set())
        neighborMap.get(n.id)?.add(linkedId)
        neighborMap.get(linkedId)?.add(n.id)
      }
    }

    const stats = {
      nodes: graphNodes.length,
      links: graphLinks.length,
      userNodes: graphNodes.filter((n) => n.source === 'user').length,
      decayed: graphNodes.filter((n) => n.isDecayed).length,
      matches: q ? searchMatches.size : graphNodes.length,
      avgMastery: graphNodes.length
        ? Math.round(graphNodes.reduce((sum, n) => sum + n.liveMastery, 0) / graphNodes.length)
        : 0,
    }

    return {
      data: { nodes: graphNodes, links: graphLinks },
      neighborMap,
      stats,
      hasSearch: Boolean(q),
    }
  }, [nodes, searchQuery, filterDomain])

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null
  const focusId = hoveredId ?? selectedNodeId
  const focusNeighbors = focusId ? graphModel.neighborMap.get(focusId) ?? new Set<string>() : new Set<string>()

  const domainStats = useMemo(
    () =>
      DOMAINS.map((domain) => ({
        ...domain,
        count: nodes.filter((n) => n.domain === domain.name).length,
      })),
    [nodes],
  )

  useEffect(() => {
    if (!fgRef.current) return
    const graph = fgRef.current as unknown as {
      d3Force: (name: string) => { strength?: (v: number) => void; distance?: (v: number) => void } | undefined
    }
    graph.d3Force('charge')?.strength?.(-170)
    graph.d3Force('link')?.distance?.(108)
  }, [graphModel.data.nodes.length, graphModel.data.links.length])

  const isInFocus = (id: string) => !focusId || id === focusId || focusNeighbors.has(id)
  const isSearchDimmed = (node: GraphNode) => graphModel.hasSearch && !node.searchMatch

  const resetCamera = () => {
    fgRef.current?.zoomToFit(650, 80)
  }

  return (
    <div ref={containerRef} className="w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-[#f7f7f5]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.96), transparent 38%), linear-gradient(135deg, rgba(229,231,235,0.5), rgba(255,255,255,0.2))',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.18) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-4 bottom-4 z-10 w-[19rem] max-w-[calc(100vw-2rem)] pointer-events-auto"
      >
        <div className="h-full flex flex-col gap-3">
          <section className="rounded-2xl border border-zinc-300/70 bg-white/78 backdrop-blur-2xl shadow-xl shadow-zinc-300/30 overflow-hidden">
            <div className="p-4 border-b border-zinc-200/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Network size={16} />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Knowledge Atlas</span>
                  </div>
                  <h1 className="mt-2 text-lg font-bold text-zinc-900">知识图谱</h1>
                </div>
                <button
                  onClick={resetCamera}
                  className="h-9 w-9 rounded-xl border border-zinc-300 bg-white/70 text-zinc-500 hover:text-zinc-900 hover:bg-white flex items-center justify-center transition-colors"
                  title="重置视角"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white/70 px-3 py-2">
                <Search size={15} className="text-zinc-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-zinc-800 placeholder-zinc-400 outline-none"
                  placeholder="搜索标题、标签、内容"
                />
              </div>
              {graphModel.hasSearch && (
                <div className="mt-2 text-[11px] text-zinc-500">
                  匹配节点略微加深，其他节点保留为浅灰上下文。
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2">
            {[
              { label: '节点', value: graphModel.stats.nodes, icon: Network, color: 'text-zinc-500' },
              { label: '连接', value: graphModel.stats.links, icon: Link2, color: 'text-zinc-500' },
              { label: '秘技', value: graphModel.stats.userNodes, icon: Sparkles, color: 'text-zinc-500' },
              { label: '均值', value: `${graphModel.stats.avgMastery}%`, icon: Crosshair, color: 'text-zinc-500' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-zinc-300/70 bg-white/74 backdrop-blur-xl p-3 shadow-sm shadow-zinc-200/50">
                <div className={`flex items-center gap-1.5 text-[11px] ${item.color}`}>
                  <item.icon size={12} />
                  {item.label}
                </div>
                <div className="mt-1 text-xl font-bold text-zinc-900">{item.value}</div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-zinc-300/70 bg-white/78 backdrop-blur-2xl p-3 overflow-hidden shadow-xl shadow-zinc-300/20">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                <Filter size={14} />
                知识域
              </div>
              <button
                onClick={() => setFilterDomain(null)}
                className={`rounded-lg px-2 py-1 text-[11px] transition-colors ${
                  !filterDomain ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                全部
              </button>
            </div>

            <div className="space-y-1.5 max-h-[32vh] overflow-y-auto pr-1">
              {domainStats.map((domain) => {
                const active = filterDomain === domain.name
                return (
                  <button
                    key={domain.name}
                    onClick={() => setFilterDomain(active ? null : domain.name)}
                    className={`w-full rounded-xl border px-2.5 py-2 text-left transition-all ${
                      active
                        ? 'border-zinc-400 bg-zinc-100'
                        : 'border-zinc-200 bg-white/55 hover:border-zinc-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: domain.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-zinc-700">
                        {domain.icon} {domain.name}
                      </span>
                      <span className="text-[11px] text-zinc-400">{domain.count}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {graphModel.stats.decayed > 0 && (
            <section className="rounded-2xl border border-zinc-300/70 bg-white/72 backdrop-blur-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-zinc-500" />
                <div>
                  <div className="text-xs font-semibold text-zinc-800">
                    {graphModel.stats.decayed} 个节点正在衰退
                  </div>
                  <div className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                    灰色节点代表复习价值更高，点击节点可在详情里复习。
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mt-auto rounded-2xl border border-zinc-300/70 bg-white/72 backdrop-blur-xl px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
            拖拽旋转，滚轮缩放，右键平移。点击节点会聚焦一跳关联。
          </div>
        </div>
      </motion.aside>

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        {graphModel.hasSearch && (
          <div className="rounded-xl border border-zinc-300 bg-white/78 px-3 py-2 text-xs text-zinc-600 backdrop-blur-xl">
            {graphModel.stats.matches} / {graphModel.stats.nodes} 匹配
          </div>
        )}
        <button
          onClick={() => {
            setEditingNode(undefined)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-300/60 transition-all hover:bg-zinc-700"
        >
          <Plus size={16} /> 创建知识
        </button>
      </div>

      <ForceGraph3D
        ref={fgRef as MutableRefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>}
        graphData={graphModel.data}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(247,247,245,0)"
        showNavInfo={false}
        nodeRelSize={4}
        nodeVal={(n) => (n as GraphNode).val}
        nodeOpacity={0.86}
        nodeResolution={18}
        nodeColor={(n) => {
          const node = n as GraphNode
          if (isSearchDimmed(node)) return node.dimColor
          if (!isInFocus(node.id)) return node.dimColor
          if (hoveredId === node.id || selectedNodeId === node.id) return '#4b5563'
          if (focusNeighbors.has(node.id)) return '#737373'
          return node.color
        }}
        nodeLabel={(n) => {
          const node = n as GraphNode
          return `<div style="padding:8px 10px;background:rgba(255,255,255,0.96);border:1px solid #d4d4d8;border-radius:10px;color:#27272a;font-size:12px;box-shadow:0 12px 30px rgba(39,39,42,.12);backdrop-filter:blur(8px)">
            <div style="font-weight:700">${node.source === 'user' ? '秘技 · ' : ''}${node.name}</div>
            <div style="font-size:10px;opacity:.62;margin-top:3px">${node.domain} · 掌握 ${node.liveMastery}% · 关联 ${node.linkCount}</div>
          </div>`
        }}
        nodeThreeObjectExtend
        nodeThreeObject={(n) => {
          const node = n as GraphNode
          const important = node.source === 'user' || node.linkCount >= 4 || selectedNodeId === node.id || hoveredId === node.id
          if (!important) return null as unknown as THREE.Object3D
          const label = new SpriteText(node.source === 'user' ? `秘技 ${node.name}` : node.name)
          label.color = isSearchDimmed(node) || !isInFocus(node.id) ? 'rgba(82,82,91,0.34)' : '#52525b'
          label.backgroundColor = false as unknown as string
          label.fontFace = 'Inter, system-ui, sans-serif'
          label.fontSize = 64
          label.fontWeight = selectedNodeId === node.id || hoveredId === node.id ? '700' : '500'
          label.padding = 2
          label.textHeight = selectedNodeId === node.id || hoveredId === node.id ? 6 : 4.5
          label.position.set(0, node.val * 0.7 + 4, 0)
          return label
        }}
        linkColor={(l) => {
          const src = linkEndpointId(l.source as string | GraphNode)
          const tgt = linkEndpointId(l.target as string | GraphNode)
          if (focusId && (src === focusId || tgt === focusId)) return 'rgba(82,82,91,0.62)'
          if (selectedNodeId && (src === selectedNodeId || tgt === selectedNodeId)) return 'rgba(82,82,91,0.62)'
          if (graphModel.hasSearch) {
            const srcMatch = graphModel.data.nodes.find((n) => n.id === src)?.searchMatch
            const tgtMatch = graphModel.data.nodes.find((n) => n.id === tgt)?.searchMatch
            if (!srcMatch && !tgtMatch) return 'rgba(161,161,170,0.12)'
          }
          return 'rgba(113,113,122,0.26)'
        }}
        linkWidth={(l) => {
          const src = linkEndpointId(l.source as string | GraphNode)
          const tgt = linkEndpointId(l.target as string | GraphNode)
          if (focusId && (src === focusId || tgt === focusId)) return 0.9
          return 0.38
        }}
        linkOpacity={0.72}
        linkDirectionalParticles={0}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={0}
        onNodeClick={(n) => {
          const node = n as GraphNode
          selectNode(node.id)
          if (fgRef.current && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
            const distance = 86
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z || 1)
            fgRef.current.cameraPosition(
              { x: node.x * distRatio, y: node.y * distRatio, z: (node.z ?? 0) * distRatio },
              { x: node.x, y: node.y, z: node.z ?? 0 },
              850,
            )
          }
        }}
        onNodeHover={(n) => setHoveredId(n ? (n as GraphNode).id : null)}
        onBackgroundClick={() => selectNode(null)}
        d3AlphaDecay={0.018}
        d3VelocityDecay={0.32}
        cooldownTicks={120}
        warmupTicks={28}
      />

      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => selectNode(null)}
            onEdit={() => {
              setEditingNode(selectedNode)
              setShowEditor(true)
              selectNode(null)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditor && (
          <NodeEditor
            node={editingNode}
            isNew={!editingNode}
            onClose={() => {
              setShowEditor(false)
              setEditingNode(undefined)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
