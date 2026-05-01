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
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import SpriteText from 'three-spritetext'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { DOMAINS, getDomainColor } from '@/data/domains'
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

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
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
      const baseColor = n.source === 'user' ? '#fbbf24' : getDomainColor(n.domain)
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
        val: 4.5 + Math.min(10, n.links.length * 1.2) + (n.source === 'user' ? 5 : 0) + masteryWeight * 3,
        color: isDecayed ? '#6b7280' : baseColor,
        dimColor: isDecayed ? '#374151' : rgba(baseColor, 0.34),
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
    const composer = fgRef.current.postProcessingComposer()
    const existing = composer.passes.filter((p) => (p as { name?: string }).name === 'UnrealBloomPass')
    for (const p of existing) composer.removePass(p)
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.w, size.h), 0.62, 0.32, 0.72)
    composer.addPass(bloom)
  }, [size.w, size.h])

  useEffect(() => {
    if (!fgRef.current) return
    const graph = fgRef.current as unknown as {
      d3Force: (name: string) => { strength?: (v: number) => void; distance?: (v: number) => void } | undefined
    }
    graph.d3Force('charge')?.strength?.(-210)
    graph.d3Force('link')?.distance?.(118)
  }, [graphModel.data.nodes.length, graphModel.data.links.length])

  const isInFocus = (id: string) => !focusId || id === focusId || focusNeighbors.has(id)
  const isSearchDimmed = (node: GraphNode) => graphModel.hasSearch && !node.searchMatch

  const resetCamera = () => {
    fgRef.current?.zoomToFit(650, 80)
  }

  return (
    <div ref={containerRef} className="w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-[#02030a]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-45"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, rgba(20,184,166,0.22), transparent 28%), radial-gradient(circle at 78% 18%, rgba(245,158,11,0.12), transparent 28%), radial-gradient(circle at 50% 68%, rgba(99,102,241,0.18), transparent 36%)',
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(2,3,10,0.62)_72%,_rgba(0,0,0,0.9)_100%)]" />

      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-4 bottom-4 z-10 w-[19rem] max-w-[calc(100vw-2rem)] pointer-events-auto"
      >
        <div className="h-full flex flex-col gap-3">
          <section className="rounded-2xl border border-cyan-300/20 bg-slate-950/72 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-cyan-200">
                    <Network size={16} />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em]">Knowledge Atlas</span>
                  </div>
                  <h1 className="mt-2 text-lg font-bold text-white">知识星图</h1>
                </div>
                <button
                  onClick={resetCamera}
                  className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                  title="重置视角"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/28 px-3 py-2">
                <Search size={15} className="text-cyan-200/80" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-white/35 outline-none"
                  placeholder="搜索标题、标签、内容"
                />
              </div>
              {graphModel.hasSearch && (
                <div className="mt-2 text-[11px] text-white/50">
                  匹配节点会发亮，其他节点保留为上下文。
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2">
            {[
              { label: '节点', value: graphModel.stats.nodes, icon: Network, color: 'text-cyan-200' },
              { label: '连接', value: graphModel.stats.links, icon: Link2, color: 'text-indigo-200' },
              { label: '秘技', value: graphModel.stats.userNodes, icon: Sparkles, color: 'text-amber-200' },
              { label: '均值', value: `${graphModel.stats.avgMastery}%`, icon: Crosshair, color: 'text-emerald-200' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/68 backdrop-blur-xl p-3">
                <div className={`flex items-center gap-1.5 text-[11px] ${item.color}`}>
                  <item.icon size={12} />
                  {item.label}
                </div>
                <div className="mt-1 text-xl font-bold text-white">{item.value}</div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-950/72 backdrop-blur-2xl p-3 overflow-hidden">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <Filter size={14} />
                知识域
              </div>
              <button
                onClick={() => setFilterDomain(null)}
                className={`rounded-lg px-2 py-1 text-[11px] transition-colors ${
                  !filterDomain ? 'bg-cyan-400/18 text-cyan-100' : 'text-white/45 hover:text-white'
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
                        ? 'border-white/20 bg-white/10'
                        : 'border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                        style={{ color: domain.color, backgroundColor: domain.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-white/78">
                        {domain.icon} {domain.name}
                      </span>
                      <span className="text-[11px] text-white/38">{domain.count}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {graphModel.stats.decayed > 0 && (
            <section className="rounded-2xl border border-amber-300/20 bg-amber-500/10 backdrop-blur-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-200" />
                <div>
                  <div className="text-xs font-semibold text-amber-100">
                    {graphModel.stats.decayed} 个节点正在衰退
                  </div>
                  <div className="mt-1 text-[11px] leading-relaxed text-amber-100/62">
                    灰色节点代表复习价值更高，点击节点可在详情里复习。
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mt-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl px-3 py-2 text-[11px] leading-relaxed text-white/42">
            拖拽旋转，滚轮缩放，右键平移。点击节点会聚焦一跳关联。
          </div>
        </div>
      </motion.aside>

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        {graphModel.hasSearch && (
          <div className="rounded-xl border border-white/10 bg-slate-950/72 px-3 py-2 text-xs text-white/70 backdrop-blur-xl">
            {graphModel.stats.matches} / {graphModel.stats.nodes} 匹配
          </div>
        )}
        <button
          onClick={() => {
            setEditingNode(undefined)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-orange-400"
        >
          <Plus size={16} /> 创建知识
        </button>
      </div>

      <ForceGraph3D
        ref={fgRef as MutableRefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>}
        graphData={graphModel.data}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        nodeRelSize={4}
        nodeVal={(n) => (n as GraphNode).val}
        nodeOpacity={0.94}
        nodeResolution={18}
        nodeColor={(n) => {
          const node = n as GraphNode
          if (isSearchDimmed(node)) return node.dimColor
          if (!isInFocus(node.id)) return node.dimColor
          if (hoveredId === node.id || selectedNodeId === node.id) return node.source === 'user' ? '#fde68a' : '#e0f2fe'
          if (focusNeighbors.has(node.id)) return node.source === 'user' ? '#fcd34d' : node.color
          return node.color
        }}
        nodeLabel={(n) => {
          const node = n as GraphNode
          return `<div style="padding:8px 10px;background:rgba(2,6,23,0.94);border:1px solid ${node.color};border-radius:10px;color:white;font-size:12px;box-shadow:0 12px 30px rgba(0,0,0,.35);backdrop-filter:blur(8px)">
            <div style="font-weight:700">${node.source === 'user' ? '秘技 · ' : ''}${node.name}</div>
            <div style="font-size:10px;opacity:.72;margin-top:3px">${node.domain} · 掌握 ${node.liveMastery}% · 关联 ${node.linkCount}</div>
          </div>`
        }}
        nodeThreeObjectExtend
        nodeThreeObject={(n) => {
          const node = n as GraphNode
          const important = node.source === 'user' || node.linkCount >= 4 || selectedNodeId === node.id || hoveredId === node.id
          if (!important) return null as unknown as THREE.Object3D
          const label = new SpriteText(node.source === 'user' ? `秘技 ${node.name}` : node.name)
          label.color = isSearchDimmed(node) || !isInFocus(node.id) ? 'rgba(255,255,255,0.34)' : '#ffffff'
          label.backgroundColor = false as unknown as string
          label.fontFace = 'Inter, system-ui, sans-serif'
          label.fontSize = 64
          label.fontWeight = selectedNodeId === node.id || hoveredId === node.id ? '700' : '500'
          label.padding = 2
          label.textHeight = selectedNodeId === node.id || hoveredId === node.id ? 7 : 5
          label.position.set(0, node.val * 0.7 + 4, 0)
          return label
        }}
        linkColor={(l) => {
          const src = linkEndpointId(l.source as string | GraphNode)
          const tgt = linkEndpointId(l.target as string | GraphNode)
          if (focusId && (src === focusId || tgt === focusId)) return 'rgba(255,255,255,0.92)'
          if (selectedNodeId && (src === selectedNodeId || tgt === selectedNodeId)) return 'rgba(125,211,252,0.9)'
          if (graphModel.hasSearch) {
            const srcMatch = graphModel.data.nodes.find((n) => n.id === src)?.searchMatch
            const tgtMatch = graphModel.data.nodes.find((n) => n.id === tgt)?.searchMatch
            if (!srcMatch && !tgtMatch) return 'rgba(100,116,139,0.12)'
          }
          return 'rgba(148,163,184,0.22)'
        }}
        linkWidth={(l) => {
          const src = linkEndpointId(l.source as string | GraphNode)
          const tgt = linkEndpointId(l.target as string | GraphNode)
          if (focusId && (src === focusId || tgt === focusId)) return 1.8
          return 0.48
        }}
        linkOpacity={0.86}
        linkDirectionalParticles={(l) => {
          const src = linkEndpointId(l.source as string | GraphNode)
          const tgt = linkEndpointId(l.target as string | GraphNode)
          return focusId && (src === focusId || tgt === focusId) ? 4 : 0
        }}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2.4}
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
