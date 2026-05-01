# Memory Decay

> **Status**: In Design
> **Author**: systems-designer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Pillar 3（遗忘有代价）

## Summary

基于遗忘曲线的 mastery 衰退系统：节点 `lastReview` 距今越久，`mastery` 越低，对应卡牌数值越弱，跌破阈值则禁用。复习行为可恢复 mastery。该系统是 Pillar 3 的算法实现层。

> **Quick reference** — Layer: `Feature` · Priority: `Vertical Slice` · Key deps: `Knowledge Graph`, `Card Generation`

## Overview

每个 KnowledgeNode 有 `mastery` (0–100) 和 `lastReview` 时间戳。系统提供纯函数 `currentMastery(node, now)` 计算实时掌握度。复习行为分三种：直接复习（点节点学习）、小测验通关、对战中使用该卡获胜——分别给予不同权重的 mastery 回升。

## Player Fantasy

「我感觉到我的卡组在变弱——我得回去复习了。」该系统应制造**温和但持续的压力**，不是惩罚而是召唤。

## Detailed Design

### Core Rules

1. 节点 mastery 初始：system 节点 = 0（未学），user 节点 = 100（自创即掌握）。
2. mastery 衰退由时间驱动，每次访问节点/卡牌时**惰性计算**（不写回除非超过阈值）。
3. 当衰退跌破档位边界（80→79、50→49、30→29）时，触发一次性写回 + UI 通知。
4. 复习行为分类与回升量见 §Formulas。
5. 单日同一节点的 mastery 回升上限 = 50（防刷）。
6. mastery < 30 → 卡牌禁用；mastery = 0 → 节点 UI 显示「已遗忘」并提示重学。
7. 用户节点（source=user）享受 0.7x 衰减系数（自己写的更难忘）。

### States and Transitions

| State | mastery | Effect | UI |
|---|---|---|---|
| 满力 | 80–100 | 数值 ×1.0 | 正常 |
| 衰退中 | 50–79 | 数值 ×0.8 | 卡面 80% 亮度 |
| 虚弱 | 30–49 | 数值 ×0.6 | 卡面 60% 亮度 |
| 遗忘 | 0–29 | 卡牌不可用 | 灰阶 + 锁图标 |

## Formulas

### Decay Function（衰退）

```
hours_since = (now - node.lastReview) / 3600_000
decay_factor = source == 'user' ? 0.7 : 1.0
effective_hours = hours_since * decay_factor

mastery_loss(effective_hours) =
  if effective_hours <  24:  effective_hours / 24 * 30      // 24h 损失 30
  elif effective_hours <  48: 30 + (effective_hours - 24) / 24 * 20   // 48h 累计 50
  elif effective_hours < 168: 50 + (effective_hours - 48) / 120 * 30  // 7d 累计 80
  else:                       min(80 + (effective_hours - 168) / 168 * 20, 100)

current_mastery = max(0, node.peak_mastery - mastery_loss)
```

| Variable | Type | Range | Source | Description |
|---|---|---|---|---|
| node.peak_mastery | float | 0–100 | node | 最近一次复习后的 mastery |
| node.lastReview | timestamp | epoch ms | node | 最近复习时间 |
| effective_hours | float | ≥0 | calc | 用户节点经 0.7x 折算 |

**Edge case**：`lastReview` 为 0（从未复习）→ system 节点 mastery 视为 0；user 节点视为 100 + lastReview = createdAt。

### Reinforce（复习回升）

| Action | Mastery Gain | Cap |
|---|---|---|
| 直接重读节点内容 | +20 | 单日累计 ≤50 |
| 完成小测验 | +30 | 单日累计 ≤50 |
| 对战中使用该卡且获胜 | +10 | 单日累计 ≤50 |
| 链接到新节点 | +5 | 单日累计 ≤20 |

```
reinforce(node, action):
  gain = ACTION_GAIN_MAP[action]
  daily_total = node.daily_reinforce_log[today]
  actual_gain = min(gain, max(0, DAILY_CAP - daily_total))
  node.peak_mastery = min(100, node.peak_mastery + actual_gain)
  node.lastReview = now
  node.daily_reinforce_log[today] += actual_gain
```

## Edge Cases

| Scenario | Expected | Rationale |
|---|---|---|
| 时区切换 | 「单日」按用户本地 0 点，不按 UTC | 公平 |
| 离线 30 天后回归 | 大量节点跌入「遗忘」 | 这是设计意图（Pillar 3） |
| 同一战中同一卡触发多次胜利？ | 仅记一次 reinforce | 防刷 |
| 节点 createdAt 在未来（系统时钟错乱） | 当作 now，避免负值 | 鲁棒性 |
| 用户秘技卡核心节点禁用 | 卡组中显示「灰卡」，对战时跳过 | UX 清晰 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Knowledge Graph | This depends | 读 lastReview / peak_mastery |
| Card Generation | Card depends on this | 衰退乘子作为 mastery_multiplier |
| Battle | Battle calls this | 战胜后调 reinforce |

> **解决循环依赖**：本系统不直接修改 Card；Card 在生成时调本系统纯函数 `currentMastery`。

## Tuning Knobs

| Parameter | Current | Safe Range | Effect+ | Effect− |
|---|---|---|---|---|
| 24h 损失量 | 30 | 15–40 | 衰退快 | 慢 |
| 7 天累计损失 | 80 | 50–95 | 强压力 | 弱压力 |
| 用户节点衰减系数 | 0.7 | 0.5–1.0 | 越偏向用户卡耐久 | 持平 |
| 单日 reinforce 上限 | 50 | 30–80 | 防刷宽松 | 严格 |
| 禁用阈值 | 30 | 0–50 | 严苛 | 宽容 |
| 直接重读 gain | 20 | 10–30 | 复习有效 | 弱 |
| 战胜 gain | 10 | 0–20 | 战斗反向激励强 | 弱 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| 节点跌入下一档位 | 节点闪烁 + 通知 toast | 弱化提示音 | High |
| 节点跌入禁用 | 锁图标 + 灰阶 | 警告音 | High |
| reinforce 成功 | 节点亮度脉冲 + +XX 浮字 | 上扬 SFX | Medium |
| 单日上限达成 | 浮字「今日已练满」 | — | Low |

## Game Feel

### Feel Reference
**Anki** 的 due card 提示——温和、信息明确，不焦虑。NOT 一些手游的「7 天不登录角色清零」威胁。

### Input Responsiveness
- 衰退检测应在节点/卡牌可见时立即生效（< 16ms）
- reinforce 反馈 ≤ 200ms

### Feel Acceptance Criteria
- [ ] 玩家 1 周内能感知到「该复习了」的提醒，但不感到被惩罚
- [ ] 复习成本可接受（重读 1 节点 < 1 分钟）
- [ ] 重新激活禁用节点的过程可在 1 次 session 内完成

## UI Requirements

| Info | Location | Update | Condition |
|---|---|---|---|
| 节点 mastery 进度条 | 节点详情 / 卡面 | 实时 | 总是 |
| 全局衰退仪表板 | Dashboard | 每次进入 | 有衰退节点 |
| 「今日复习清单」 | 主菜单 banner | 每日 | mastery 衰退节点 ≥ 5 |
| 卡牌灰阶 + 锁 | 卡组中 | 实时 | mastery < 30 |

## Cross-References

| This References | Target GDD | Element | Nature |
|---|---|---|---|
| 读节点 lastReview / peak_mastery | `knowledge-graph.md` | node 字段 | Data dependency |
| 提供 mastery_multiplier | `card-system.md` | 卡数值公式 | Rule dependency |
| 战胜触发 reinforce | `battle.md` | 战斗结束钩子 | State trigger |

## Acceptance Criteria

- [ ] `currentMastery` 是纯函数（property test）
- [ ] 24h / 48h / 7d 边界值精确（误差 < 1%）
- [ ] 用户节点衰减确实比系统节点慢（同条件对照）
- [ ] 单日 reinforce 上限严格生效（防刷测试）
- [ ] 时区切换不导致重复扣减或回升
- [ ] Performance: 1000 节点全量衰退计算 ≤ 50ms
- [ ] No hardcoded values（曲线参数走 `decayTuning` 配置）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| 是否引入间隔重复算法（SM-2 / Anki）？ | systems-designer | Alpha | 暂不，首版用线性衰退避免过度复杂 |
| 是否提供「冻结」机制（旅行/请假）？ | live-ops-designer | Full Vision | 倾向不做（违背 Pillar 3） |
| 衰退提醒频率上限？ | ux-designer | Vertical Slice | 每日 ≤ 1 次 push toast |
