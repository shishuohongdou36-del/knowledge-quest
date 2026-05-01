# Systems Index: Knowledge Quest

> **Status**: Approved
> **Created**: 2026-04-28
> **Last Updated**: 2026-04-28
> **Source Concept**: [`game-concept.md`](./game-concept.md)

---

## Overview

Knowledge Quest 由 7 个核心系统组成，分为 4 层：**Foundation**（认证 + 持久化）、**Core**（知识图谱 + 转化引擎）、**Feature**（卡牌 + 对战 + 衰退）、**Presentation**（UI/动效）。所有 Feature 层系统都依赖 Core 层的「知识 → 卡牌」契约（Pillar 1）。

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|---|---|---|---|---|---|
| 1 | Auth & Persistence | Persistence | MVP | In Design | [`auth.md`](./auth.md) | — |
| 2 | Knowledge Graph | Core | MVP | In Design | [`knowledge-graph.md`](./knowledge-graph.md) | Auth |
| 3 | Card Generation Engine | Core | MVP | In Design | [`card-system.md`](./card-system.md) | Knowledge Graph |
| 4 | Battle (Hearthstone-style) | Gameplay | MVP | In Design | [`battle.md`](./battle.md) | Card Generation |
| 5 | Memory Decay | Progression | Vertical Slice | In Design | [`memory-decay.md`](./memory-decay.md) | Knowledge Graph, Card Generation |
| 6 | Boss & PvE AI | Gameplay | MVP | In Design | [`boss-ai.md`](./boss-ai.md) | Battle |
| 7 | Deck Builder | Gameplay | Vertical Slice | In Design | [`deck-builder.md`](./deck-builder.md) | Card Generation |
| 8 | UI Shell & Routing | UI | MVP | In Design | [`ui-shell.md`](./ui-shell.md) | Auth |
| 9 | Achievements & Meta | Meta | Full Vision | Not Started | — | All |

---

## Categories

| Category | Systems |
|---|---|
| **Persistence** | Auth & Persistence |
| **Core** | Knowledge Graph, Card Generation Engine |
| **Gameplay** | Battle, Boss & PvE AI, Deck Builder |
| **Progression** | Memory Decay |
| **UI** | UI Shell & Routing |
| **Meta** | Achievements & Meta |

---

## Priority Tiers

| Tier | Systems |
|---|---|
| **MVP** | Auth, Knowledge Graph, Card Generation, Battle, Boss AI (basic), UI Shell |
| **Vertical Slice** | + Memory Decay, Deck Builder, Secret Cards path |
| **Alpha** | + Full effect roster (战吼/亡语/嘲讽/连击/跨域共鸣) |
| **Full Vision** | + Achievements, Daily Challenges, Deck Sharing |

---

## Dependency Map

### Foundation Layer
1. **Auth & Persistence** — localStorage / Zustand persist；所有数据载体

### Core Layer
2. **Knowledge Graph** — depends on: Auth
3. **Card Generation Engine** — depends on: Knowledge Graph

### Feature Layer
4. **Battle** — depends on: Card Generation
5. **Boss & PvE AI** — depends on: Battle
6. **Deck Builder** — depends on: Card Generation
7. **Memory Decay** — depends on: Knowledge Graph, Card Generation

### Presentation Layer
8. **UI Shell & Routing** — depends on: Auth, all feature systems

### Polish Layer
9. **Achievements & Meta** — depends on: 所有上层

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|---|---|---|---|---|---|
| 1 | Auth & Persistence | MVP | Foundation | systems-designer | S |
| 2 | Knowledge Graph | MVP | Core | systems-designer + ui-designer | L |
| 3 | Card Generation Engine | MVP | Core | systems-designer + economy-designer | M |
| 4 | Battle | MVP | Feature | game-designer + gameplay-programmer | L |
| 5 | Boss & PvE AI | MVP | Feature | ai-programmer | M |
| 6 | UI Shell & Routing | MVP | Presentation | ui-programmer + ux-designer | M |
| 7 | Memory Decay | Vertical Slice | Feature | systems-designer | S |
| 8 | Deck Builder | Vertical Slice | Feature | game-designer | M |
| 9 | Achievements & Meta | Full Vision | Polish | live-ops-designer | M |

> Effort: S = 1 session（1 份 GDD），M = 2–3，L = 4+。

---

## Circular Dependencies

- **Memory Decay ↔ Card Generation**：衰退影响数值，但数值由生成引擎计算。
  **Resolution**：生成引擎暴露纯函数 `recompute(card, mastery, lastReview)`，由 Decay 系统在每次访问时调用，无运行时循环。详见 `memory-decay.md` §Dependencies。

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|---|---|---|---|
| Knowledge Graph | Technical | 200+ 节点力导向图在低端浏览器可能 < 30fps | 早期 prototype，准备 Canvas 回退方案 |
| Card Generation Engine | Design | 自动效果生成可能产出无趣或 OP 的卡 | MVP 用规则模板而非 LLM；准备 Tuning Knobs |
| Boss & PvE AI | Design | AI 太弱无挑战 / 太强挫败 | MVP 用 scripted 卡组 + 简单启发式；soak-test |
| Memory Decay | Design | 衰退太狠会赶走玩家 / 太轻则违背 Pillar 3 | 参数可调，playtest 校准 |
| LocalStorage | Technical | 5–10 MB 上限对重度用户可能溢出 | ADR-001：MVP 用 localStorage，Alpha 迁 IndexedDB |

---

## Progress Tracker

| Metric | Count |
|---|---|
| Total systems identified | 9 |
| Design docs started | 8 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 6 / 6 |
| Vertical Slice systems designed | 2 / 3 |

---

## Next Steps

- [x] 完成所有 MVP 系统 GDD
- [x] 完成 Vertical Slice 剩余 GDD：deck-builder
- [ ] 对每份 GDD 跑 `/design-review`
- [ ] Prototype 力导向图性能（最高风险）
- [ ] 起草 ADR-001：localStorage vs IndexedDB
- [ ] 跑 `/gate-check pre-production`
