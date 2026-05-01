# Game Pillars: Knowledge Quest

## Document Status
- **Version**: 1.0
- **Last Updated**: 2026-04-28
- **Approved By**: creative-director
- **Status**: Approved

---

## Core Fantasy

> **「我所学的一切，都是我的武器。」**

详见 [`game-concept.md`](./game-concept.md#core-fantasy)。

---

## Target MDA Aesthetics

| Rank | Aesthetic | How Our Game Delivers It |
| ---- | ---- | ---- |
| 1 | Challenge | Boss 难度梯度、tempo 博弈、卡组构筑深度 |
| 2 | Expression | 用户原创知识 → 唯一秘技卡 = 个人知识画像 |
| 3 | Discovery | 力导向图漫游、跨域共鸣 synergy 发掘 |
| 4 | Sensation | 炉石级动效 + 霓虹/赛博朋克美术 |
| N/A | Fellowship / Submission / Narrative | 不在本作目标 |

---

## The Pillars

### Pillar 1: 知识即卡牌（Knowledge IS the Card）

**One-Sentence Definition**：游戏中**所有战力**必须可一对一追溯到玩家知识图谱里的一个节点；不存在「凭空获得」的卡牌。

**Target Aesthetics Served**：Challenge、Expression

**Design Test**：
> 「我们要不要加一个开宝箱抽卡机制？」
> Pillar 1 答：**不**。卡牌只能通过新建/掌握知识节点产生，宝箱违背追溯性。

#### What This Means for Each Department

| Department | This Pillar Says... | Example |
| ---- | ---- | ---- |
| **Game Design** | 任何卡牌效果都必须有「知识来源」字段 | 战吼效果由节点的 tags 决定 |
| **Art** | 卡面必须显示来源知识域图标 | AI 域 🧠、商业 📊 等 |
| **Audio** | 不同知识域有不同打出 SFX | 区分 8 个域 |
| **Narrative** | 卡牌描述使用节点的 content 摘要 | 而非编造 flavor text |
| **Engineering** | `BattleCard` 类型必须包含 `sourceNodeId` 字段 | 见 `card-system.md` |

#### Serving This Pillar
- 删除节点 → 对应卡牌消失
- 节点 mastery 变化 → 卡牌数值实时重算
- 用户新建节点 → 立即生成可用卡牌

#### Violating This Pillar
- ❌ 充值送卡包
- ❌ 通关 Boss 直接奖励指定卡（应改为「奖励知识点解锁」）
- ❌ 编辑器里手动调卡牌数值（必须通过编辑节点）

---

### Pillar 2: 原创即秘技（Originality IS Power）

**One-Sentence Definition**：用户**自己创作的知识节点**生成的卡牌，必须在数值与效果独特性上**严格优于**等条件下的系统预设卡牌。

**Target Aesthetics Served**：Expression、Challenge

**Design Test**：
> 「秘技卡是不是应该和系统卡使用同一套数值公式？」
> Pillar 2 答：**不**。秘技卡有专属的数值加成系数和独享效果池，否则用户失去原创动机。

#### What This Means for Each Department

| Department | This Pillar Says... | Example |
| ---- | ---- | ---- |
| **Game Design** | 秘技卡专属效果池 + 数值乘数 | 秘技卡数值 = 基础值 × 1.3 |
| **Art** | 金色边框 + ✨ 粒子特效 | 一眼可辨识 |
| **Audio** | 打出秘技卡有专属音效 | 强调稀有感 |
| **Narrative** | 卡牌名 = 用户填写的标题（不被改写） | 尊重用户创作 |
| **Engineering** | `source: 'user'` → 走独立生成路径 | 见 `card-system.md` §3.2 |

#### Serving This Pillar
- 秘技卡 mana 成本可下调 1（同等数值情况下）
- 秘技卡触发跨域共鸣时倍率额外 +0.2
- 秘技卡死亡有专属亡语模板

#### Violating This Pillar
- ❌ 系统卡数值上限 ≥ 秘技卡
- ❌ 让秘技卡和系统卡共用美术资源
- ❌ 在不通知用户的情况下「平衡削弱」秘技卡

---

### Pillar 3: 遗忘有代价（Forgetting Has a Cost）

**One-Sentence Definition**：长期不复习的知识节点，对应卡牌必须**线性衰退**直至禁用；不存在「不维护也能保持战力」的路径。

**Target Aesthetics Served**：Challenge、Competence (SDT)

**Design Test**：
> 「我们要不要做一个 Premium 订阅，付费保持卡牌满数值？」
> Pillar 3 答：**绝对不**。这会摧毁核心循环——付费就能跳过学习行为。

#### What This Means for Each Department

| Department | This Pillar Says... | Example |
| ---- | ---- | ---- |
| **Game Design** | 衰退曲线公式必须存在且可测试 | 见 `memory-decay.md` |
| **Art** | 衰退状态有视觉提示 | 卡面褪色 / 灰阶 |
| **Audio** | 衰退状态打出有提示音 | 弱化版 SFX |
| **Narrative** | UI 文案使用「遗忘」「淡忘」等词 | 而非「负面状态」 |
| **Engineering** | 卡牌数值实时根据 `lastReview` 计算 | 见 `card-system.md` |

#### Serving This Pillar
- 24h 不复习 → mastery × 0.7
- 7 天不复习 → 卡牌不可使用直到复习
- 复习方式必须是**真的学习行为**（重读 / 测验 / 对战获胜）

#### Violating This Pillar
- ❌ 「金币购买掌握度」道具
- ❌ 「VIP 玩家不衰退」机制
- ❌ 一键全部复习按钮（必须节点级操作）

---

## Anti-Pillars (What This Game Is NOT)

- **NOT 一款答题闯关游戏**：核心循环是 TCG 对战，不是问答。如果加入答题，会变成第三个学习 App，失去 hook。
- **NOT 一款放置/挂机游戏**：所有进度必须由「学习行为」驱动，被动获取违背 Pillar 3。
- **NOT 一款重剧情 RPG**：叙事是装饰，主线剧情会偷走核心循环时间预算。
- **NOT 一款竞技 PvP**（v1）：平衡性会强迫削弱秘技卡 → 违背 Pillar 2。
- **NOT 一款多人协作社区**（v1）：知识图谱是私有的、个人化的，强行共享会稀释 Expression 美学。

---

## Pillar Conflict Resolution

| Priority | Pillar | Rationale |
| ---- | ---- | ---- |
| 1 | **知识即卡牌** | 是整个游戏存在的根基，违背则游戏失去 identity |
| 2 | **原创即秘技** | 是 hook 与 retention 的关键，违背则等同于普通 TCG |
| 3 | **遗忘有代价** | 是长期 engagement 的支撑，违背则学习动机消失 |

**示例冲突**：

> 用户原创了一张极强的秘技卡（Pillar 2），但其底层节点 7 天没复习导致禁用（Pillar 3）。该用谁？
>
> **决议**：Pillar 3 优先于 Pillar 2。秘技卡也必须遵守衰退规则——这恰恰强化了 Pillar 3 的严肃性。但 UI 应清晰提示「你最强的牌正在淡忘」以激励复习行为。

---

## Player Motivation Alignment (SDT)

| Need | Which Pillar Serves It | How |
| ---- | ---- | ---- |
| **Autonomy** | Pillar 2（原创即秘技） | 玩家完全决定建什么、怎么链 |
| **Competence** | Pillar 3（遗忘有代价） | 复习行为 → 数值反馈，掌握度可见 |
| **Relatedness** | (Pillar 1 间接) | 卡组截图 = 知识画像，可分享 |

**Gap check**：Relatedness 较弱，v2 可考虑「卡组分享」「Boss 排行榜」补强，但不能违背前三条。

---

## Emotional Arc

### Session Emotional Arc

| Phase | Duration | Target Emotion | Pillar Driving It | Mechanics |
| ---- | ---- | ---- | ---- | ---- |
| Opening | 0–2 min | 期待 + 检视 | Pillar 1 | 浏览图谱 / 选择 Boss |
| Rising | 2–10 min | 紧张 + 心流 | Pillar 1+2 | 抽牌 / 解场 / tempo 博弈 |
| Climax | 10–20 min | 胜负关键 | Pillar 2 | 打出秘技卡决定战局 |
| Resolution | 20–25 min | 满足 / 反思 | Pillar 3 | 战后复习提示 / 知识缺口 |
| Hook | 结束时 | 「我得去补这块」 | Pillar 3 | 衰退提醒 / 新 Boss 解锁 |

### Long-Term Emotional Progression

- **早期（1–2 周）**：建立种子图谱，每张卡都珍贵 → 好奇 + 拥有感
- **中期（1–2 月）**：图谱密集，卡组分化 → 策略沉迷 + 个性化
- **后期（3 月+）**：维护成本上升，Boss 难度上限 → 掌握感 + 知识画像沉淀

---

## Reference Games

| Reference | What We Take | What We Do Differently | Pillar Validated |
| ---- | ---- | ---- | ---- |
| Hearthstone | 法力曲线、随从交换 | 卡池来源是个人知识 | Pillar 1 |
| Anki | 间隔复习、遗忘曲线 | 复习反馈是卡牌强度，不是评分 | Pillar 3 |
| Obsidian | 双向链接、力导向图 | 图谱直接驱动战力 | Pillar 1 |
| Slay the Spire | Boss 阶梯、卡组构筑 | 卡牌长期积累，不是 run-based | Pillar 2 |

**Non-game inspirations**：费曼学习法（教学即掌握）、知识晶体理论。

---

## Pillar Validation Checklist

- [x] **Count**: 3 pillars
- [x] **Falsifiable**: 每条都做出可证伪的具体主张
- [x] **Constraining**: 每条都明确否决了若干合理选项
- [x] **Cross-departmental**: 覆盖 design / art / audio / narrative / engineering
- [x] **Design-tested**: 每条都有具体决策测试
- [x] **Anti-pillars defined**: 5 条
- [x] **Priority-ranked**: 1 > 2 > 3
- [x] **MDA-aligned**: 主交付 Challenge + Expression + Discovery
- [x] **SDT coverage**: Autonomy + Competence 强；Relatedness 弱（v1 接受）
- [x] **Memorable**: 「知识即卡牌 / 原创即秘技 / 遗忘有代价」三句口诀
- [x] **Core fantasy served**: 三条都直接服务于「我所学即我之武器」

---

## Next Steps

- [x] Pillar 审批
- [ ] 在 `card-system.md` 中实现数值公式以承载 Pillar 1+2
- [ ] 在 `memory-decay.md` 中实现衰退曲线以承载 Pillar 3
- [ ] 季度回顾（首次安排：开发 6 周后）

---

*This document is the creative north star. Lives in `design/gdd/game-pillars.md`,
referenced by every system GDD.*
