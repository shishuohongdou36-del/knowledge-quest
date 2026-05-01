# Boss & PvE AI

> **Status**: In Design
> **Author**: ai-programmer + game-designer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Pillar 1（Boss 卡组同样追溯到知识节点，体现该域的"教学权威"）

## Summary

PvE 模式下的 Boss 系统：每个 Boss 代表一个知识域，使用预设卡组 + 启发式 AI 决策与玩家对战。MVP 提供 1 个 Boss + 简单贪心 AI；Vertical Slice 扩到 3 个；Alpha 完成全部 9 个 Boss 与 3 档难度。

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Battle`, `Card Generation`

## Overview

Boss 不是普通玩家——它是**该知识域的化身**。每个 Boss 卡组从该域的 system 节点中预选构筑，体现该域的"知识结构"；AI 决策按启发式权重选择最优出牌。MVP 用纯启发式（无 MCTS / 神经网络），保证可解释性与性能。

## Player Fantasy

「这个 Boss 在用 AI 技术域的知识打我——它不是数值碾压，是用"知识本身"的优势压制我。」打败 Boss 应感到**「我对这个域的理解超过它了」**。

## Detailed Design

### Core Rules

1. 每个 Boss 字段：`id, name, domain, difficulty, hp, deck[30], heroPower, aiProfile, lore`。
2. Boss 难度三档：
   - **普通 (Normal)**: HP 30, AI 贪心策略, 卡组质量基础
   - **精英 (Elite)**: HP 35, AI 含简单组合策略, 卡组高质量
   - **传说 (Legendary)**: HP 40, AI 含 lookahead 1 步, 卡组含特殊牌
3. Boss 卡组只含 system 节点生成的卡（不可含玩家秘技卡）。
4. AI 决策每回合一次，以"行动序列"输出（出牌 → 攻击 → 技能 → 结束），中间结算由 Battle 系统完成。
5. AI 必须遵守所有玩家规则（法力、手牌上限、嘲讽等）；不允许作弊。
6. AI 决策时间预算：≤ 500ms（含动画延迟），超时强制结束回合。
7. 击败 Boss → 解锁同域更高难度 Boss 或下一域 Boss。

### Boss 列表（v1）

| # | Boss | 域 | 难度 | MVP? |
|---|---|---|---|---|
| 1 | 注意力之主 | AI技术 | 普通 | ✅ |
| 2 | 涌现之神 | AI技术 | 精英 | VS |
| 3 | 用户之声 | 产品设计 | 普通 | VS |
| 4 | 增长飞轮 | 商业洞察 | 精英 | Alpha |
| 5 | 第一性原理 | 思维框架 | 传说 | Alpha |
| 6 | 博弈之眼 | 跨学科 | 精英 | Alpha |
| 7 | 编译之心 | 编程技术 | 普通 | Alpha |
| 8 | 统计之灵 | 数据科学 | 精英 | Alpha |
| 9 | 镜中之我 | 用户自定义 | 传说 | Full Vision |

### AI Decision Loop

```
takeTurn(boardState, hand, mana, opponent):
  actions = []
  while can_act():
    candidates = enumerate_legal_actions(boardState, hand, mana)
    if candidates is empty: break
    scored = [(action, score(action, boardState)) for action in candidates]
    best = argmax(scored)
    if best.score < END_TURN_THRESHOLD: break
    actions.append(best.action)
    apply(best.action, boardState)  // 模拟，不影响真实状态
  return actions
```

### States and Transitions

| State | Entry | Exit | Behavior |
|---|---|---|---|
| Waiting | 玩家回合 | 玩家结束回合 | 思考动画隐藏 |
| Thinking | Boss 回合开始 | 决策完成 | 思考气泡 + 头像呼吸动画 |
| Acting | 决策完成 | 行动序列执行完 | 串行播放每步动画 |
| Defeated | HP ≤ 0 | — | 失败动画 + 战利品弹窗 |

### Interactions with Other Systems

| System | Interface |
|---|---|
| Battle | 实现 `IOpponent.takeTurn(state) → Action[]` 接口 |
| Card Generation | Boss 卡组由 systemNodeId 列表，开战时调 generateCard 实例化 |
| Knowledge Graph | 击败 Boss 解锁该域指定节点（教学奖励） |
| Auth | 写入 `user.stats.bossesDefeated[bossId]` |

## Formulas

### Action Scoring（动作评分，MVP 启发式）

```
score(action) =
    w_lethal     * is_lethal_potential(action)
  + w_value      * mana_value_ratio(action)
  + w_tempo      * board_tempo_change(action)
  + w_threat     * removes_threat(action)
  - w_mana_waste * unspent_mana_after(action)
```

| Variable | Type | Range | Source | Description |
|---|---|---|---|---|
| w_lethal | float | 100 | const | 致命权重，压倒性 |
| w_value | float | 10 | const | 法力价值比 |
| w_tempo | float | 5 | const | 场面变化 |
| w_threat | float | 8 | const | 解威胁奖励 |
| w_mana_waste | float | 3 | const | 浪费法力惩罚 |

**Expected output range**：单动作分数 -50 ~ +200；致命局 ≥ 100。

### Mana Value Ratio

```
mana_value_ratio(card) = (card.attack + card.hp) / max(1, card.mana)
```

### Lookahead (Legendary 难度)

```
lookahead_score(action) = score(action) + 0.5 * max(score(next) for next in next_legal_actions)
```

仅展开 1 步，避免组合爆炸（Boss 回合 ≤ 500ms 预算）。

## Edge Cases

| Scenario | Expected | Rationale |
|---|---|---|
| AI 手牌为空且场上无随从 | 用英雄技能或直接 EndTurn | 不卡死 |
| AI 决策超时（> 500ms） | 立即结束回合 + 日志告警 | 体验保障 |
| 多个并列最优动作 | 取卡组顺序最早的（确定性） | 可重现 |
| 玩家从手牌"读取" Boss 决策（开作弊） | 不可能：Boss 决策不写共享状态 | 安全 |
| Boss 卡组中节点被系统更新移除 | 开战时跳过该卡，卡组数 < 30 仍可对战 | 鲁棒性 |
| 玩家秘技卡被 Boss "复制"效果（v2） | 禁用——Pillar 2 反对 | 设计原则 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Battle | This depends | 提供 boardState, 接收 actions |
| Card Generation | This depends | 实例化 Boss 卡组 |
| Knowledge Graph | This depends | 卡组节点来源 + 击败奖励 |
| Auth | Auth depends on this | 写 stats |

## Tuning Knobs

| Parameter | Current | Safe Range | Effect+ | Effect− |
|---|---|---|---|---|
| Boss 起始 HP（普通） | 30 | 25–35 | 更难 | 更易 |
| Boss 起始 HP（精英） | 35 | 30–40 | 更难 | 更易 |
| Boss 起始 HP（传说） | 40 | 35–50 | 更难 | 更易 |
| w_lethal | 100 | 50–200 | 更激进 | 更保守 |
| w_value | 10 | 5–20 | 重价值交换 | 重 tempo |
| AI 决策时间预算 | 500ms | 200–1000 | 更深思 | 更敏捷 |
| 击败奖励：解锁节点数 | 1 | 0–3 | 教学反馈强 | 弱 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| Boss 入场 | 对手区头像放大 + 域色光环 | 域专属 BGM 切入 | High |
| Boss 思考 | 头像呼吸 + "..." 气泡 | 低频思考音 | Medium |
| Boss 出牌 | 卡从对面飞出，红框入场 | 入场音 | High |
| Boss 英雄技能 | 头像放电 + 域光效 | 域专属技能音 | High |
| Boss 击败 | 屏幕泛白 + Boss 碎裂 | 胜利乐 + 域钟声 | High |
| 解锁奖励节点 | 知识图谱中新节点亮起 | 上扬 chime | High |

## Game Feel

### Feel Reference
**Slay the Spire** Boss 的"明牌但难解"——玩家能预见威胁，但解题需要技巧。NOT XCOM 那种黑箱概率焦虑。

### Input Responsiveness

| Action | Max Latency | Frame Budget @60fps | Notes |
|---|---|---|---|
| AI 决策计算 | 500ms | — | 后台异步 |
| AI 行动播放 | 600ms / 步 | 36 帧 | 与玩家出牌同节奏 |
| Boss 击败动画 | 2000ms | 120 帧 | 仪式感 |

### Animation Feel Targets

| Animation | Startup | Active | Recovery | Feel Goal |
|---|---|---|---|---|
| Boss 思考 | 8 帧 | 持续 | 4 帧 | 沉重，给玩家时间 |
| Boss 出牌 | 4 帧 | 12 帧 | 4 帧 | 与玩家同感受 |
| Boss 英雄技能 | 8 帧 | 16 帧 | 8 帧 | 比玩家技能更戏剧化 |
| Boss 击败 | 0 | 60 帧 | 0 | 慢速崩塌 |

### Impact Moments

| Type | Duration | Effect | Configurable? |
|---|---|---|---|
| Boss 致命一击 | 200ms | 屏幕震动 + 暗角 | Yes |
| Boss 倒计时（HP < 10） | 持续 | 头像红色脉冲 + 心跳音 | Yes |
| 击败 Boss | 2000ms | 慢动作 + 全屏特效 | No |

### Weight and Responsiveness Profile

- **Weight**：Heavy. Boss 行动应感觉**比玩家更重**——是"对手"，不是"机器"。
- **Player control**：玩家在 Boss 回合**完全无控制**（标准 TCG 体验），但可看清每一步推演。
- **Snap quality**：Crisp——每个 Boss 动作有清晰的开始/结束。
- **Failure texture**：败给 Boss 时给出明确反馈（"被斩杀"动画 + 复盘建议）。

### Feel Acceptance Criteria
- [ ] Boss 回合不让玩家感到"等待太久"（每步 ≤ 1.5s 含动画）
- [ ] Boss 决策可被有经验玩家**预测大致方向**（不黑箱）
- [ ] 失败后玩家能复述"我在哪一步犯错"
- [ ] 击败 Boss 时有明确的成就感节点（不是淡淡的胜利）

## UI Requirements

| Info | Location | Update | Condition |
|---|---|---|---|
| Boss 名称 / HP / 域图标 | 屏幕上方对手区 | 实时 | 总是 |
| Boss 卡组剩余数 | 对手牌堆 | 抽牌时 | 总是 |
| Boss 思考动画 | 对手英雄头像 | Boss 回合 | Thinking 状态 |
| 难度标识 | Boss 名旁徽章 | 静态 | 总是 |
| Boss lore（开战前） | 全屏入场动画 | 一次性 | 首战 / 再战可跳过 |
| 击败奖励弹窗 | 模态弹窗 | Boss 击败时 | 一次 |

## Cross-References

| This References | Target GDD | Element | Nature |
|---|---|---|---|
| 注入 takeTurn 接口 | `battle.md` | IOpponent | Ownership handoff |
| 实例化 Boss 卡组 | `card-system.md` | generateCard | Data dependency |
| Boss 卡组节点列表 | `knowledge-graph.md` | system 节点 | Data dependency |
| 击败写 stats | `auth.md` | user.stats.bossesDefeated | Ownership handoff |
| 击败解锁节点 mastery | `memory-decay.md` | reinforce | State trigger |

## Acceptance Criteria

- [ ] AI 决策在 95% 情况下 ≤ 500ms 完成
- [ ] AI 不作弊（不偷看玩家手牌、不超法力等，由测试覆盖）
- [ ] 普通难度 Boss 玩家首次胜率应在 40–60%（playtest 校准）
- [ ] 精英 30–50%，传说 15–30%
- [ ] AI 在所有合法状态下都能产生至少一个动作（不会卡死）
- [ ] AI 行动序列对外可观察（debug 面板可见每步评分）
- [ ] Performance: 单回合决策 ≤ 500ms（中端笔记本）
- [ ] No hardcoded values（权重/HP/难度走 `bossTuning` 配置）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| 是否引入 MCTS 或简单神经网络？ | ai-programmer | Alpha | 暂不，启发式足够 MVP–Alpha |
| Boss 是否有"阶段战"机制（HP < 50% 形态变化）？ | game-designer | Alpha | 倾向 Alpha 引入传说 Boss |
| 玩家失败是否给 mastery 损失？ | game-designer | Vertical Slice | 倾向不损失（已有衰退压力） |
| Boss 卡组是否随玩家强度动态调整？ | live-ops-designer | Full Vision | TBD |
