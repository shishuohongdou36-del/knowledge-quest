import type { KnowledgeNode } from '@/types'
import { generateCardFromKnowledge } from '@/utils/cardGenerator'

// ============================================================
// Tiny mana-curve histogram. 0/1/2/3/4/5/6/7+ buckets.
// ============================================================
export function ManaCurve({ nodes }: { nodes: KnowledgeNode[] }) {
  const buckets = new Array(8).fill(0) as number[] // 0..7+
  for (const n of nodes) {
    const card = generateCardFromKnowledge(n)
    const idx = Math.min(7, Math.max(0, card.manaCost))
    buckets[idx]++
  }
  const max = Math.max(1, ...buckets)
  const labels = ['0', '1', '2', '3', '4', '5', '6', '7+']

  return (
    <div className="flex items-end gap-1 h-16">
      {buckets.map((count, i) => {
        const heightPct = (count / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
                style={{ height: `${heightPct}%`, minHeight: count > 0 ? '4px' : '0' }}
                title={`${count} 张 ${labels[i]} 费`}
              />
            </div>
            <div className="text-[9px] text-white/50">{labels[i]}</div>
            <div className="text-[10px] text-white/80 font-medium leading-none">{count}</div>
          </div>
        )
      })}
    </div>
  )
}
