# Knowledge Quest — Game Design Documentation

> **架构**：参考 [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (`my-game`) 的设计文档体系——顶层概念 + 设计支柱 + 系统索引 + 每系统单独 GDD。
> **本文件**：仅作为 `design/gdd/` 的索引入口。所有详细设计已拆分到 [`design/gdd/`](./design/gdd/)。

---

## 文档地图

### 顶层（Top-Level）

| 文档 | 作用 |
|---|---|
| [`design/gdd/game-concept.md`](./design/gdd/game-concept.md) | 游戏概念：电梯演讲、核心幻想、独特 hook、MDA、SDT、核心循环、MVP 分层 |
| [`design/gdd/game-pillars.md`](./design/gdd/game-pillars.md) | 3 条非协商设计支柱 + 反支柱 + 冲突解决优先级 |
| [`design/gdd/systems-index.md`](./design/gdd/systems-index.md) | 系统枚举、依赖图、优先级、推荐设计顺序、风险登记 |

### 系统级 GDD（System-Level）

| # | 系统 | 文档 | 优先级 | 依赖 |
|---|---|---|---|---|
| 1 | Auth & Persistence | [`design/gdd/auth.md`](./design/gdd/auth.md) | MVP | — |
| 2 | Knowledge Graph | [`design/gdd/knowledge-graph.md`](./design/gdd/knowledge-graph.md) | MVP | Auth |
| 3 | Card Generation Engine | [`design/gdd/card-system.md`](./design/gdd/card-system.md) | MVP | Knowledge Graph |
| 4 | Battle (Hearthstone-style) | [`design/gdd/battle.md`](./design/gdd/battle.md) | MVP | Card Generation |
| 5 | Memory Decay | [`design/gdd/memory-decay.md`](./design/gdd/memory-decay.md) | Vertical Slice | Knowledge Graph, Card Generation |
| 6 | Boss & PvE AI | [`design/gdd/boss-ai.md`](./design/gdd/boss-ai.md) | MVP | Battle |
| 7 | Deck Builder | `design/gdd/deck-builder.md` (TBD) | Vertical Slice | Card Generation |
| 8 | UI Shell & Routing | [`design/gdd/ui-shell.md`](./design/gdd/ui-shell.md) | MVP | Auth |
| 9 | Achievements & Meta | (TBD) | Full Vision | All |

---

## 设计支柱速记

> 三句口诀贯穿所有决策（详见 [`game-pillars.md`](./design/gdd/game-pillars.md)）：

1. **知识即卡牌** — 所有战力必须可追溯到一个知识节点
2. **原创即秘技** — 用户产出的内容比预设内容更强、更独特
3. **遗忘有代价** — 不复习就掉数值，没有躺平变强的路径

**冲突优先级**：1 > 2 > 3

---

## MVP 范围速记

详见 [`game-concept.md` §MVP Definition](./design/gdd/game-concept.md#mvp-definition)。

**Required**：知识图谱 CRUD + 50 种子节点 + 卡牌生成 + 炉石式对战 + 1 个 Boss + 登录持久化
**Excluded**：复杂卡牌效果、遗忘曲线（v2）、PvP、多 Boss、成就

---

## 文档模板与规范

每份系统 GDD 遵循 `my-game` 的标准章节：

```
Summary → Overview → Player Fantasy →
Detailed Design (Core Rules / States / Interactions) →
Formulas → Edge Cases → Dependencies → Tuning Knobs →
Visual/Audio Requirements → Game Feel →
UI Requirements → Cross-References →
Acceptance Criteria → Open Questions
```

模板源：`my-game/.claude/docs/templates/game-design-document.md`

---

## 后续工作

- [x] ~~完成剩余 MVP 系统 GDD：`boss-ai.md`、`ui-shell.md`~~ ✅
- [ ] 完成 Vertical Slice 剩余 GDD：`deck-builder.md`
- [ ] 起草第一份 ADR：`docs/architecture/ADR-001-localStorage-vs-indexeddb.md`
- [ ] Prototype 力导向图性能（最高风险）
- [ ] 对每份 GDD 进行 design-review
- [ ] 在 MVP 系统全部 approved 后跑 gate-check
