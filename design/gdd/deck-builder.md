# Deck Builder System

> **Status**: In Design
> **Created**: 2026-04-29
> **Priority**: Vertical Slice
> **Depends On**: Knowledge Graph, Card Generation, Memory Decay

---

## Purpose

Pillar 1（知识即卡牌）要求玩家**对自己的卡组拥有完全所有权**。MVP 阶段卡组由 `generateDeckForDomain()` 自动生成；这剥夺了 player agency。Deck Builder 让玩家：

1. **浏览**自己所有可用卡牌（= 知识节点 → 实时数值）
2. **手工选择** 30 张组成命名卡组
3. **保存多套** 卡组、为不同 Boss 切换
4. **直观看到** 卡组质量（mana 曲线、域分布、平均战力、被遗忘节点警告）

---

## Pillar Mapping

| Pillar | How served |
|---|---|
| **1 知识即卡牌** | 每张可选卡都直接对应一个 KnowledgeNode；删节点 → 自动从所有卡组中移除 |
| **2 原创即秘技** | 秘技节点在选卡器中带金色标记 + 单独筛选 tab |
| **3 遗忘有代价** | 已遗忘节点（mastery < 30）显示为禁用，不能加入卡组；mana 曲线警告颜色 |

---

## Data Model

```ts
interface DeckBlueprint {
  id: string                  // 'deck-{ts}-{rand}'
  name: string                // user-named, e.g. "AI 全攻"
  primaryDomain: Domain | null // 主题域，影响 cross-domain bonus
  knowledgeIds: string[]      // 30 entries, allows duplicates (multiple copies of same card)
  createdAt: number
  updatedAt: number
}
```

---

## Constraints

- 卡组大小：**固定 30 张**（match `battleTuning.deckSize`）
- 单卡份数上限：**3 张同名卡**（防止滥用）
- 不可加入：`currentMastery < 30` 的节点
- 卡组数量上限：**12** 套 / 用户

---

## UI Flow

### `/decks` — 卡组列表
- 卡组卡片网格：名称 / 主域 / 卡数（30/30）/ 平均掌握度 / mana 曲线 mini-chart
- 创建按钮 → 进入空卡组编辑器
- 每个卡组：编辑 / 复制 / 删除

### `/decks/:deckId` — 卡组编辑器
- **左面板**：可用卡牌池
  - 搜索 / 域筛选 / 排序（mana / 掌握度 / 链接数）
  - 秘技 tab（仅显示 user-source 卡）
  - 已禁用卡（mastery < 30）灰显，不可点击
- **右面板**：当前卡组
  - 30 格槽位
  - mana 曲线柱状图（0/1/2/3/4/5/6/7+）
  - 域分布饼图（mini）
  - 警告：「3 张卡正在衰退」
- 点击池中卡 → 加入；点击卡组中卡 → 移除
- 保存按钮 → 持久化 + Toast「已保存」
- 重命名 / 改主题域 inline

### `/battle/:bossId` — 战前选卡
- 进入战斗时若有保存的卡组，弹出选择 modal：
  - 「使用保存的卡组」：列出卡组卡片，点击后开始
  - 「自动生成」：fallback 到当前 generateDeckForDomain
- 若无保存卡组：直接自动生成

---

## State

```ts
interface DeckStore {
  decks: DeckBlueprint[]
  createDeck: (name: string, primaryDomain: Domain | null) => string  // returns id
  updateDeck: (id: string, updates: Partial<DeckBlueprint>) => void
  deleteDeck: (id: string) => void
  duplicateDeck: (id: string) => string
  getDeck: (id: string) => DeckBlueprint | undefined
  /** Materialize blueprint → BattleCard[] using current node mastery */
  buildBattleCards: (id: string, nodes: KnowledgeNode[]) => BattleCard[] | null
}
```

Persisted via `zustand/middleware` `persist` to `kq-decks` key.

---

## Open Questions

- **跨域共鸣**：自定义主域 vs 自动 majority 域，哪个权威？→ 用户选择优先，仅当 null 时按 majority 自动推断
- **导入/导出**：v2 添加，MVP 不做
- **AI 推荐卡组**：v2，基于玩家熟练度自动构筑

---

## Acceptance Criteria

- [ ] 用户可以创建并命名一个卡组
- [ ] 卡组只能容纳 30 张，超过即不可添加
- [ ] 已遗忘节点（< 30）在选卡器中无法添加
- [ ] 删除一个 KnowledgeNode 会自动从所有卡组中移除该节点的所有副本
- [ ] 战斗页若有保存的卡组，会优先弹出选择
- [ ] mana 曲线 mini-chart 实时更新
- [ ] 数据 persisted across reloads
