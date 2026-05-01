# Achievements & Meta System

> **Status**: In Design
> **Created**: 2026-04-29
> **Priority**: Full Vision (lightweight MVP slice)
> **Depends On**: All systems (read-only sensors)

---

## Purpose

Provide **long-horizon goals** and **moments of recognition** to support Pillar 2 (Expression) and SDT *Competence*. Achievements act as **declarative sensors** over the game state — never gate-keeping content, never giving stat rewards (would violate Pillar 3).

> **Anti-pattern**: 「打通 5 个 Boss → 解锁特殊卡牌」违背 Pillar 1（卡牌只能来自知识）。我们解锁的是**称号/徽章/UI 装饰**。

---

## Categories

| Category | Theme | Example IDs |
|---|---|---|
| **Knowledge** | 图谱建设 | `know-10`, `know-50`, `know-link-100` |
| **Original** | 秘技创作 | `secret-1`, `secret-10`, `secret-resonance` |
| **Mastery** | 掌握度维护 | `master-5`, `master-20`, `decay-rescue` |
| **Battle** | 对战累积 | `battle-1`, `battle-10`, `battle-flawless` |
| **Deck** | 卡组构筑 | `deck-1`, `deck-curated`, `deck-multi` |
| **Meta** | 跨系统行为 | `daily-7`, `polymath`（5 域均 ≥ 5 节点） |

Total MVP: **20 成就**。每个成就 1–3 行 JSON 描述。

---

## Data Model

```ts
interface AchievementDef {
  id: string
  category: 'knowledge' | 'original' | 'mastery' | 'battle' | 'deck' | 'meta'
  title: string
  description: string
  icon: string              // emoji
  hidden?: boolean          // hidden until unlocked
  /**
   * Pure predicate over current game state. Returns:
   *   - {progress, target} for trackable achievements (e.g., 5/10 nodes)
   *   - {unlocked: true} for binary achievements
   */
  evaluate: (ctx: AchievementContext) => { unlocked: boolean; progress?: number; target?: number }
}

interface AchievementContext {
  nodes: KnowledgeNode[]
  decks: DeckBlueprint[]
  user: User | null
}

interface AchievementProgress {
  unlockedIds: Record<string, number>  // id -> unlockedAt timestamp
  seen: Record<string, true>            // ids the user has acknowledged (no badge dot)
}
```

---

## Triggers

A single function `evaluateAll(ctx)` runs on:
- App boot (catch up on missed unlocks)
- After `addNode` / `updateNode` / `deleteNode`
- After `reinforceNode`
- After `victory` in battle (`useHsBattleStore` phase change)
- After `createDeck` / `updateDeck`

Performance: 20 predicates × cheap state inspection = sub-millisecond. No need to memoize.

---

## UX

### Toast on unlock
A special **achievement toast** with golden border + icon, lasting 6s.

### `/achievements` page
- Grid by category
- Locked: grayed icon + obfuscated title (if `hidden`)
- Unlocked: full color + unlock timestamp
- Progress bars for trackable goals

### Header badge
Small dot on header avatar when there are unlocked-but-unseen achievements. Cleared on visiting `/achievements`.

---

## Pillar Mapping

| Pillar | Constraint |
|---|---|
| **1 知识即卡牌** | Achievements grant NO stat / NO cards. Only badges. |
| **2 原创即秘技** | `secret-*` achievements celebrate user creation. |
| **3 遗忘有代价** | `decay-rescue` rewards rescuing forgotten cards via review. |

---

## Acceptance Criteria

- [ ] 20 个成就定义
- [ ] 创建第 1 个节点立刻解锁 `know-1`
- [ ] 解锁触发金色 toast
- [ ] `/achievements` 页可见全部，已锁的灰显
- [ ] 进入页面后未读徽章清除
- [ ] localStorage 持久化
