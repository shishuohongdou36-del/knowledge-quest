import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search, Plus } from 'lucide-react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import SpriteText from 'three-spritetext'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import { getDomainColor, DOMAINS } from '@/data/domains'
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
  val: number // size
  color: string
  // ForceGraph mutates these:
  x?: number
  y?: number
  z?: number
}

interface GraphLink {
  source: string
  target: string
  value: number
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

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Build graph data
  const graphData = useMemo(() => {
    const now = Date.now()
    const q = searchQuery.trim().toLowerCase()
    const filtered = nodes.filter((n) => {
      if (filterDomain && n.domain !== filterDomain) return false
      if (q) {
        const hit =
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        if (!hit) return false
      }
      return true
    })

    const visibleIds = new Set(filtered.map((n) => n.id))
    const gnodes: GraphNode[] = filtered.map((n) => {
      const live = currentMastery(n, now)
      const baseColor = n.source === 'user' ? '#fbbf24' : getDomainColor(n.domain)
      // Only dim if user actually learned then forgot it; never-studied system nodes keep their domain color.
      const everReviewed = n.lastReview !== null
      const decayed = everReviewed && live < decayTuning.masteryFragile
      return {
        id: n.id,
        name: n.title,
        domain: n.domain,
        source: n.source,
        liveMastery: Math.round(live),
        linkCount: n.links.length,
        val: 4 + n.links.length * 1.5 + (n.source === 'user' ? 6 : 0),
        color: decayed ? '#4b5563' : baseColor,
      }
    })

    const glinks: GraphLink[] = []
    const seen = new Set<string>()
    for (const n of filtered) {
      for (const l of n.links) {
        if (!visibleIds.has(l)) continue
        const key = [n.id, l].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        glinks.push({ source: n.id, target: l, value: 1 })
      }
    }

    return { nodes: gnodes, links: glinks }
  }, [nodes, searchQuery, filterDomain])

  // Bloom postprocessing for the cyber-glow effect
  useEffect(() => {
    if (!fgRef.current) return
    const composer = fgRef.current.postProcessingComposer()
    // Avoid stacking multiple bloom passes on re-render
    const existing = composer.passes.filter((p) => (p as { name?: string }).name === 'UnrealBloomPass')
    for (const p of existing) composer.removePass(p)
    // strength, radius, threshold — gentle bloom that respects domain colors
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.w, size.h), 0.4, 0.25, 0.85)
    composer.addPass(bloom)
  }, [size.w, size.h])

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null
  const userCount = nodes.filter((n) => n.source === 'user').length

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-4rem)] relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #0b1024 0%, #050813 60%, #02030a 100%)',
      }}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-lg shadow-black/40">
          <Search size={14} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48"
            placeholder="搜索知识..."
          />
        </div>

        <div className="flex flex-wrap gap-1.5 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-lg shadow-black/40">
          <button
            onClick={() => setFilterDomain(null)}
            className={`px-2 py-1 rounded-lg text-xs ${
              !filterDomain ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            全部
          </button>
          {DOMAINS.filter((d) => d.name !== '用户自定义').map((d) => (
            <button
              key={d.name}
              onClick={() => setFilterDomain(filterDomain === d.name ? null : d.name)}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                filterDomain === d.name ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              style={filterDomain === d.name ? { backgroundColor: d.color + '40' } : {}}
              title={d.name}
            >
              {d.icon}
            </button>
          ))}
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 shadow-lg shadow-black/40">
          🌌 {graphData.nodes.length} 节点 · {graphData.links.length} 连接
          {userCount > 0 && <span className="text-amber-300 ml-2">✨ {userCount} 秘技</span>}
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-gray-500">
          鼠标拖拽旋转 · 滚轮缩放 · 右键平移
        </div>
      </div>

      {/* Add knowledge button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            setEditingNode(undefined)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/30"
        >
          <Plus size={16} /> 创建知识 / 秘技
        </button>
      </div>

      {/* 3D Force Graph */}
      <ForceGraph3D
        ref={fgRef as React.MutableRefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>}
        graphData={graphData}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        nodeRelSize={4}
        nodeVal={(n) => (n as GraphNode).val}
        nodeOpacity={0.92}
        nodeResolution={16}
        nodeColor={(n) => {
          const gn = n as GraphNode
          // Avoid pure white on hover/select — bloom would blow it out. Use light-tinted domain color instead.
          if (hoveredId === gn.id || selectedNodeId === gn.id) {
            return gn.source === 'user' ? '#fef3c7' : '#e0e7ff'
          }
          return gn.color
        }}
        nodeLabel={(n) => {
          const gn = n as GraphNode
          return `<div style="padding:6px 10px;background:rgba(15,23,42,0.92);border:1px solid ${gn.color};border-radius:8px;color:white;font-size:12px;backdrop-filter:blur(4px)">
            <div style="font-weight:600">${gn.source === 'user' ? '✨ ' : ''}${gn.name}</div>
            <div style="font-size:10px;opacity:0.7;margin-top:2px">${gn.domain} · 掌握度 ${gn.liveMastery}% · 关联 ${gn.linkCount}</div>
          </div>`
        }}
        nodeThreeObjectExtend
        nodeThreeObject={(n) => {
          const gn = n as GraphNode
          if (gn.source !== 'user' && gn.linkCount < 4) return null as unknown as THREE.Object3D
          // Floating label sprite for important nodes
          const text = gn.source === 'user' ? `✨ ${gn.name}` : gn.name
          const sprite = new SpriteText(text)
          sprite.color = '#ffffff'
          sprite.backgroundColor = false as unknown as string
          sprite.fontFace = 'Inter, system-ui, sans-serif'
          sprite.fontSize = 64
          sprite.fontWeight = '500'
          sprite.padding = 2
          sprite.textHeight = 4 + Math.min(2, gn.linkCount * 0.15)
          sprite.position.set(0, gn.val * 0.6 + 4, 0)
          return sprite
        }}
        linkColor={(l) => {
          const src = (typeof l.source === 'object' ? (l.source as GraphNode).id : l.source) as string
          const tgt = (typeof l.target === 'object' ? (l.target as GraphNode).id : l.target) as string
          if (hoveredId && (src === hoveredId || tgt === hoveredId)) return 'rgba(255,255,255,0.95)'
          if (selectedNodeId && (src === selectedNodeId || tgt === selectedNodeId)) return 'rgba(99,102,241,0.85)'
          return 'rgba(160,180,220,0.18)'
        }}
        linkWidth={(l) => {
          const src = (typeof l.source === 'object' ? (l.source as GraphNode).id : l.source) as string
          const tgt = (typeof l.target === 'object' ? (l.target as GraphNode).id : l.target) as string
          if (hoveredId && (src === hoveredId || tgt === hoveredId)) return 1.6
          return 0.5
        }}
        linkOpacity={0.8}
        linkDirectionalParticles={(l) => {
          const src = (typeof l.source === 'object' ? (l.source as GraphNode).id : l.source) as string
          const tgt = (typeof l.target === 'object' ? (l.target as GraphNode).id : l.target) as string
          return hoveredId && (src === hoveredId || tgt === hoveredId) ? 3 : 0
        }}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2}
        onNodeClick={(n) => {
          const gn = n as GraphNode
          selectNode(gn.id)
          // Center camera on node
          if (fgRef.current && gn.x !== undefined && gn.y !== undefined && gn.z !== undefined) {
            const distance = 90
            const distRatio = 1 + distance / Math.hypot(gn.x, gn.y, gn.z || 1)
            fgRef.current.cameraPosition(
              { x: gn.x * distRatio, y: gn.y * distRatio, z: (gn.z ?? 0) * distRatio },
              { x: gn.x, y: gn.y, z: gn.z ?? 0 },
              900,
            )
          }
        }}
        onNodeHover={(n) => setHoveredId(n ? (n as GraphNode).id : null)}
        onBackgroundClick={() => selectNode(null)}
        d3AlphaDecay={0.018}
        d3VelocityDecay={0.32}
        cooldownTicks={120}
        warmupTicks={20}
      />

      {/* Node detail panel */}
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

      {/* Node editor modal */}
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
