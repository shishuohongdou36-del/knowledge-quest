# Card Generation Engine

> **Status**: In Design
> **Author**: systems-designer + economy-designer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Pillar 1（知识即卡牌）、Pillar 2（原创即秘技）

## Summary

将每个 KnowledgeNode 通过纯函数确定性地转化为一张 BattleCard。系统节点 → 普通随从（蓝边）；用户节点 → 秘技卡（金边 ✨，数值倍率 1.3x）。本系统是 Pillar 1+2 的算法实现层。

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Knowledge Graph`

## Overview

引擎暴露纯函数 `generateCard(node, context) → BattleCard`，输入节点 + 上下文（mastery / lastReview），输出完整可战斗卡牌。无副作用，结果只依赖输入——保证 Pillar 1 的可追溯性。

## Player Fantasy

「我看到的每张卡，都能解释它为什么有这些数值——因为我学了什么、链接了什么。」该系统应让玩家**理解并相信数值的合理性**。

## Detailed Design

### Core Rules

1. 每个节点对应**至多一张** BattleCard（1:1 映射）；卡 ID = `card-${nodeId}`。
2. 卡牌类型由节点属性决定：
   - `source: 'system'` → 知识随从（蓝边）
   - `source: 'user'` → 秘技卡（金边）
   - `mastery > 80` 且 `links.length ≥ 5` → 装备卡变体（v2，绿边）
   - 跨域桥接节点（≥ 2 域链接）→ 法术卡变体（v2，紫边）
3. 卡牌效果文本由模板系统生成（MVP）：基于 `tags` 中第一个匹配关键字选模板。
4. 数值随 mastery、lastReview 实时重算（不缓存）。
5. 秘技卡（user 节点）享受**全局倍率 1.3x** 应用于 attack 和 hp。
6. 节点删除 → 卡牌从所有卡组中移除（不阻断对战中已抽出的卡）。

### States and Transitions

| State | Entry | Exit | Behavior |
|---|---|---|---|
| Active | mastery ≥ 30 | mastery < 30 | 可放入卡组、可对战 |
| Disabled | mastery < 30 | mastery ≥ 30 | 卡组中变灰，不可抽 |

## Formulas

### Mana Cost（法力消耗）

```
base_mana = clamp(round(node.tags.length * 0.7 + 1), 1, 10)
mana = source == 'user' ? max(1, base_mana - 1) : base_mana
```

| Variable | Type | Range | Source | Description |
|---|---|---|---|---|
| node.tags.length | int | 0–10 | node | 标签越多越高级 |
| base_mana | int | 1–10 | calc | 基础法力 |
| mana | int | 1–10 | calc | 秘技 -1 |

### Attack（攻击力）

```
attack = round(
  (node.mastery / 20)              // 基础 0–5
  + (node.links.length * 0.5)      // 关联加成
) * mastery_multiplier(mastery)
  * (source == 'user' ? 1.3 : 1.0)
```

| Variable | Type | Range | Source |
|---|---|---|---|
| node.mastery | float | 0–100 | node |
| node.links.length | int | 0–N | node |
| mastery_multiplier | float | 0–1.0 | see below |

### HP（生命值）

```
hp = round(
  3
  + (node.links.length * 0.8)
  + (node.tags.length * 0.5)
) * mastery_multiplier(mastery)
  * (source == 'user' ? 1.3 : 1.0)
```

### Mastery Multiplier（衰退乘子）

```
if mastery >= 80:  return 1.0
if mastery >= 50:  return 0.8
if mastery >= 30:  return 0.6
else:              return 0     // 卡牌禁用
```

详见 [`memory-decay.md`](./memory-decay.md)。

### Effect Selection（效果选择，MVP）

```
if 'AI技术' in node.tags:    effect = 战吼·抽一张同域卡
elif 'product' in node.tags:  effect = 战吼·获得 1 法力
elif node.tags.length >= 3:   effect = 嘲讽
elif source == 'user':        effect = 秘技·{用户title前6字}
else:                          effect = (无)
```

**Expected ranges**：mana 1–10，attack 0–12，hp 1–15（满 mastery system 卡）；秘技卡同公式 ×1.3。

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|---|---|---|
| node.links.length = 0 | 仍生成卡，但 hp 较低 | 鼓励互链 |
| node.tags.length = 0 | mana = 1，无效果 | 最简卡 |
| mastery = 100 + links = 20 | attack 上限 clamp 到 12 | 平衡 |
| user 节点刚创建（mastery=100） | 直接生成强力秘技卡 | 即时奖励原创 |
| node.cardId 已存在 | regenerate 覆盖 | 无副本 |
| 删除节点而卡在手牌 | 当前对战该卡保留可用，对战结束后消失 | 不破坏战局 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Knowledge Graph | This depends on KG | 节点是输入 |
| Memory Decay | This depends | 衰退乘子 |
| Battle | Battle depends on this | 抽卡时调 generateCard |
| Deck Builder | Deck depends on this | 卡组只能含已生成卡 |

## Tuning Knobs

| Parameter | Current | Safe Range | Effect+ | Effect− |
|---|---|---|---|---|
| 用户卡倍率 | 1.3 | 1.1–1.6 | 鼓励原创但易 OP | Pillar 2 弱化 |
| mana 公式系数 | 0.7 | 0.5–1.0 | 高级卡更贵 | 高级卡更便宜 |
| attack mastery 系数 | 0.05 | 0.02–0.1 | mastery 影响更大 | 更平 |
| 链接数 hp 系数 | 0.8 | 0.4–1.5 | 鼓励互链 | 弱化 |
| mastery 禁用阈值 | 30 | 0–50 | 衰退更狠 | 更宽容 |
| attack 上限 clamp | 12 | 8–20 | 高 ceiling | 平衡保守 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| 卡牌首次生成 | 卡面飞入手牌 | 闪光音 | High |
| 秘技卡生成 | 金色粒子 + ✨ | 专属铃音 | High |
| 数值变化（mastery 升） | 数字翻滚动画 | 短促 tick | Medium |
| 卡牌禁用 | 卡面变灰 + 锁图标 | 低沉提示 | High |

## Game Feel

### Feel Reference
**Slay the Spire** 卡面信息层级 + **Hearthstone** 卡面数值的厚重感。

### Input Responsiveness

| Action | Max Latency | Notes |
|---|---|---|
| 节点编辑→卡数值更新 | 50ms | UI 立即反映 |
| 卡牌悬停查看效果 | 16ms | tooltip |

### Feel Acceptance Criteria
- [ ] 玩家能在 5 秒内说出「这张卡为什么是这个数值」
- [ ] 数值变化时有清晰的 before/after 视觉
- [ ] 秘技卡视觉上**绝对不会**被误认为系统卡

## UI Requirements

| Info | Location | Update | Condition |
|---|---|---|---|
| 卡面：法力 / 攻击 / 生命 | 卡牌四角 | 实时 | 总是 |
| 来源节点链接 | 卡背 / 长按 | 静态 | 总是 |
| 衰退状态 | 卡面浮层 | mastery 变化 | mastery < 80 |
| 秘技 ✨ 标记 | 卡面顶部 | 静态 | source=user |

## Cross-References

| This References | Target GDD | Element | Nature |
|---|---|---|---|
| 输入 KnowledgeNode | `knowledge-graph.md` | 节点结构 | Data dependency |
| mastery_multiplier 实现 | `memory-decay.md` | 衰退函数 | Rule dependency |
| 卡入手牌后逻辑 | `battle.md` | 抽卡 / 出牌 | Ownership handoff |

## Acceptance Criteria

- [ ] `generateCard` 是纯函数（property test 验证：相同输入 → 相同输出）
- [ ] mana / attack / hp 输出区间符合 §Formulas 预期
- [ ] 用户卡的攻击+生命之和 > 系统卡（同等输入下，统计验证）
- [ ] 删除节点 → `cardId` 在所有 store 中清理
- [ ] Performance: 单次生成 ≤ 1ms
- [ ] No hardcoded values（公式系数全部走 `cardTuning` 配置）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| MVP 用规则模板 vs LLM 生成效果文案？ | game-designer | Pre-MVP | 已定：模板 |
| 装备卡 / 法术卡何时引入？ | systems-designer | Vertical Slice | TBD |
| 是否允许玩家手动覆写卡牌效果？ | creative-director | Alpha | 倾向不允许（违背 Pillar 1 追溯性） |
