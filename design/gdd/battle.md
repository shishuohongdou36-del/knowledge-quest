# Battle (Hearthstone-style)

> **Status**: In Design
> **Author**: game-designer + gameplay-programmer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Pillar 1（卡来自知识）、Pillar 3（衰退影响战斗）

## Summary

回合制法力水晶式 TCG 对战。双方英雄各 30HP，30 张卡组，初始 3–4 手牌，每回合 +1 水晶（上限 10）+1 抽牌，场上随从上限 7。胜负条件：将对方英雄 HP 降至 0。

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Card Generation`

## Overview

Knowledge Quest 的核心娱乐循环。玩家用自己的知识卡组对抗 Boss AI，体验经典 TCG 节奏。MVP 实现：法力 / 抽牌 / 出牌 / 攻击 / 英雄技能 / 战吼 / 嘲讽 / 胜负判定。Alpha 加入：亡语 / 连击 / 跨域共鸣。

## Player Fantasy

「我用我学过的东西，正面击败一个比我强大的存在。」每次胜利都应感到**「这是我赢的，不是运气」**。

## Detailed Design

### Core Rules

1. 双方英雄各 30HP，0 攻击力初始。
2. 卡组 30 张，开局玩家抽 3，对手抽 4（先后手平衡）。
3. 每回合开始：水晶 +1（≤10）→ 抽 1 张 → 玩家行动。
4. 出牌消耗水晶；不足则不可出。
5. 随从打出当回合不可攻击（无「冲锋」时）。
6. 每个随从每回合可攻击 1 次（次回合解锁）。
7. 攻击：双方互掉对方攻击力 HP；HP ≤ 0 进入「亡语」并移除。
8. 嘲讽：场上有嘲讽随从时，攻击必须先选嘲讽。
9. 英雄技能：每回合 1 次，消耗 2 水晶（见 §英雄技能）。
10. 手牌上限 10；超出则抽到的牌被销毁。
11. 卡组耗尽后每回合受「疲劳」伤害（1, 2, 3, ... 累加）。
12. 同时双方 HP ≤ 0 → 平局。

### Phases / States

| Phase | Entry | Exit | Behavior |
|---|---|---|---|
| TurnStart | 上回合结束 | 抽牌完成 | 水晶+1, 抽1, 触发回合开始 trigger |
| MainAction | TurnStart 结束 | EndTurn 按钮 | 玩家自由出牌/攻击/技能 |
| Resolving | 任意效果触发 | 效果队列空 | 串行结算，UI 锁定输入 |
| TurnEnd | EndTurn 触发 | 切换玩家 | 触发回合结束 trigger |
| GameOver | 任一英雄 HP ≤ 0 | — | 显示胜负界面 |

### Interactions with Other Systems

| System | Interface |
|---|---|
| Card Generation | 抽卡时调 `generateCard(node, ctx)` 取最新数值 |
| Memory Decay | 战斗胜利时对参战卡片对应节点 `+5 mastery`（最多每天一次） |
| Boss AI | Boss 在 MainAction 阶段执行预设策略 |
| Auth | 战斗结束写 `user.stats.battlesWon/Lost` |

## Formulas

### Damage Resolution（攻击结算）

```
attacker.hp -= defender.attack
defender.hp -= attacker.attack
if attacker.hp <= 0: trigger_deathrattle(attacker); remove(attacker)
if defender.hp <= 0: trigger_deathrattle(defender); remove(defender)
```

### Fatigue（疲劳）

```
fatigue_damage(turn_n_after_empty) = turn_n_after_empty
hero.hp -= fatigue_damage
```

### Initial Hand Size

```
player_first  → 3 cards
player_second → 4 cards + "硬币"卡（一次性 +1 法力）
```

### Mana Crystal

```
crystals_at_turn(n) = min(n, 10)
```

## Edge Cases

| Scenario | Expected | Rationale |
|---|---|---|
| 场上 7 随从时再打随从卡 | 不可出，UI 提示 | 上限 |
| 嘲讽随从被「沉默」效果（v2） | 失去嘲讽 | 一致 |
| 双方互攻同时死亡 | 双方进入亡语再移除 | 顺序无关 |
| 抽空卡组开始 | 立即开始疲劳 | 标准 TCG |
| 一张卡的来源节点战中被删除 | 该卡保留至战斗结束 | 不破坏战局 |
| 一张卡的来源节点战中 mastery 跌破 30 | 已抽出的卡仍可用，未抽出的不可抽 | 战斗一致性 |
| 无法连接对方（无嘲讽情况） | 允许直接攻击英雄 | 标准 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Card Generation | This depends | 卡数值来源 |
| Memory Decay | Decay depends on this | 战胜→mastery+5 |
| Boss AI | This depends | 对手决策 |
| Auth | Auth depends on this | 写 stats |

## Tuning Knobs

| Parameter | Current | Safe Range | Effect+ | Effect− |
|---|---|---|---|---|
| 起始 HP | 30 | 20–40 | 节奏更慢 | 更快爆发 |
| 卡组大小 | 30 | 20–40 | 更稳定 | 更随机 |
| 手牌上限 | 10 | 5–15 | 更储备 | 更紧迫 |
| 场上随从上限 | 7 | 4–9 | 更复杂 | 更简化 |
| 法力上限 | 10 | 7–12 | 后期巨牌可出 | 节奏受限 |
| 战胜 mastery 奖励 | +5 | 0–10 | 强化 Pillar 3 反向 | 弱化 |
| 英雄技能法力 | 2 | 1–4 | 更频繁 | 更稀缺 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| 抽牌 | 卡从牌堆飞入手牌 | 抽牌 SFX | High |
| 出牌 | 拖拽 → 飞入战场 + 入场粒子 | 入场音 | High |
| 攻击 | 撞击 + hit-stop + 飞溅 | 武器音 | High |
| 随从死亡 | 碎裂粒子 | 碎裂音 | High |
| 法力水晶充能 | 水晶亮起序列 | 充能音 | Medium |
| 英雄技能 | 角色头像发光 + 飞行特效 | 域特定音 | Medium |
| 胜利 | 胜利屏 + 烟花 | 胜利乐 | High |
| 失败 | 渐黑 + 沉重音 | 失败音 | High |

## Game Feel

### Feel Reference
**Hearthstone** 的卡面厚重感与撞击 hit-stop。NOT 卡通弱反馈、NOT 拖泥带水。

### Input Responsiveness

| Action | Max Latency | Frame Budget @60fps | Notes |
|---|---|---|---|
| 拖卡 | 16ms | 1 帧 | 必须粘手 |
| 选攻击目标 | 16ms | 1 帧 | 箭头跟随 |
| 出牌完成 → 战场就位 | 300ms | 18 帧 | 含动画 |
| 攻击 → 互击结算 | 600ms | 36 帧 | 含 hit-stop 100ms |

### Animation Feel Targets

| Animation | Startup | Active | Recovery | Feel Goal |
|---|---|---|---|---|
| 出牌 | 4 帧 | 12 帧 | 4 帧 | 有重量地落地 |
| 攻击移动 | 6 帧 | 8 帧（含撞击） | 6 帧 | 蓄力→冲撞 |
| 死亡 | 0 | 18 帧 | 0 | 戏剧化但快 |

### Impact Moments

| Type | Duration | Effect | Configurable? |
|---|---|---|---|
| Hit-stop | 100ms | 双方静止 | Yes |
| Screen shake | 80ms | 致命一击时 | Yes |
| 击杀慢速 | 200ms（×0.5 速度） | 致命攻击 | Yes |
| 秘技卡入场 | 500ms | 全屏稍暗 + 光柱 | Yes |

### Weight and Responsiveness Profile

- **Weight**：Heavy。每张卡像在桌上「啪」地一拍。
- **Player control**：High（自己回合内任何时刻可撤回未确定操作）。
- **Snap quality**：Crisp/binary——出牌动作不能模糊。
- **Acceleration**：动画用 ease-out（落地感）。
- **Failure texture**：法力不够 → 卡片弹回 + 红光 + 提示文字，无惩罚。

### Feel Acceptance Criteria
- [ ] 撞击有「打到」感（playtester 自发提及）
- [ ] 完整一回合（玩家+对手）≤ 90 秒
- [ ] 无人用「卡」「拖」「迟钝」描述
- [ ] 60fps 不掉帧（中端笔记本）

## UI Requirements

| Info | Location | Update | Condition |
|---|---|---|---|
| 双方 HP / 当前法力 / 法力上限 | 屏幕上下英雄区 | 实时 | 总是 |
| 手牌 | 屏幕底部 | 抽/弃时 | 总是 |
| 战场 | 屏幕中部 | 出牌/死亡时 | 总是 |
| 卡组剩余数 | 牌堆图标 | 抽牌时 | 总是 |
| 回合计时器（v2） | 屏幕顶部 | 每秒 | 启用时 |
| 战斗日志 | 侧边可展开 | 每个 action | 可选 |
| 英雄技能图标 | 头像旁 | 使用后冷却 | 总是 |

## 英雄技能

每个知识域绑定一个英雄技能（玩家根据卡组主导域选择，2 法力/次/回合）：

| 域 | 技能 | 效果 |
|---|---|---|
| AI技术 | 智能分析 | 对一个随从造成 1 伤害 |
| 产品设计 | 用户洞察 | 抽 1 张牌 |
| 商业洞察 | 资源整合 | 本回合 +1 法力水晶 |
| 思维框架 | 逻辑推演 | 给一个友方随从 +1 攻击 |
| 跨学科 | 触类旁通 | 随机获得 1 张其他域卡到手牌 |
| 编程技术 | 代码重构 | 让一个友方随从 +1/+1 |
| 数据科学 | 统计推断 | 偷看对方手牌 1 张 |
| 用户自定义 | 灵感涌现 | 抽 1 张随机秘技卡 |

## Cross-References

| This References | Target GDD | Element | Nature |
|---|---|---|---|
| 卡数值实时计算 | `card-system.md` | generateCard | Data dependency |
| 战胜回写 mastery | `memory-decay.md` | reinforce 规则 | Rule dependency |
| Boss AI 决策接口 | `boss-ai.md` (TBD) | takeTurn() | State trigger |
| 战斗结果写 stats | `auth.md` | user.stats | Ownership handoff |

## Acceptance Criteria

- [ ] 完整一场对战可在 10–25 分钟完成
- [ ] 法力水晶曲线符合标准 TCG（n 回合 = n 水晶）
- [ ] 嘲讽规则在所有路径下成立（测试覆盖）
- [ ] 双方互攻致死正确触发双亡语
- [ ] 疲劳伤害递增正确
- [ ] 战胜回写 mastery 命中节点（测试）
- [ ] Performance: 每回合处理 ≤ 50ms
- [ ] No hardcoded values（数值走 `battleTuning` 配置）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| 是否引入「咒语 / 法术卡」类型？ | game-designer | Vertical Slice | v2 |
| 跨域共鸣具体效果如何设计？ | game-designer + economy | Alpha | TBD |
| 是否引入回合计时器？ | game-designer | Alpha | 倾向 v2 |
