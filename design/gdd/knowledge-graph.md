# Knowledge Graph

> **Status**: In Design
> **Author**: systems-designer + ux-designer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Pillar 1（知识即卡牌）、Pillar 2（原创即秘技）

## Summary

Obsidian 风格的力导向知识图谱，玩家可视化地浏览、创建、链接、复习知识节点。每个节点是后续卡牌的唯一来源（Pillar 1）。

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Auth`

## Overview

进入主界面看到的是一张星云式知识网，节点按知识域用不同颜色区分，连线表示双向链接。玩家可拖拽、缩放、搜索、按域过滤。点击节点 → 详情 + 编辑面板。50+ 系统预设节点跨 8 大域（AI 技术 / 产品设计 / 商业洞察 / 思维框架 / 跨学科 / 编程技术 / 数据科学 / 用户自定义）。

## Player Fantasy

「我看到的不只是笔记列表——我看到我的大脑结构。每条连线都是我建立的认知。」该系统应给玩家**「这是我的世界」**的拥有感。

## Detailed Design

### Core Rules

1. 每个节点字段：`id, title, domain, content, tags[], links[], source, mastery, lastReview, ownerId, createdBy, cardId?`
2. `source` ∈ {`system`, `user`}；`system` 节点不可删除/不可改 domain，但可改 mastery（学习行为）。
3. 链接是**双向**的：A.links 含 B → B.links 自动含 A（持久化前 normalize）。
4. 创建用户节点必填：`title, domain, content`；`tags, links` 可选。
5. 删除节点 → 级联清除所有反向链接 → 触发对应卡牌移除（见 `card-system.md`）。
6. 节点 mastery 初始：system = 0，user = 100（自创代表已掌握）。
7. 搜索：按 title / tags / content 模糊匹配，结果在图谱中高亮。
8. 过滤：按 domain / source / mastery 范围。

### States and Transitions

| State | Entry | Exit | Behavior |
|---|---|---|---|
| Idle | 默认 | 用户交互 | 节点轻微浮动动画 |
| Dragging | 鼠标按下节点 | 释放 | 节点跟随鼠标，连接弹性变形 |
| Editing | 点击「编辑」 | 保存 / 取消 | 弹出表单，图谱半透明 |
| Searching | 输入搜索框 | 清空 | 非匹配节点淡化至 30% 透明 |

### Interactions with Other Systems

| System | Interface |
|---|---|
| Auth | 读 `userId`，所有节点写入时附 `ownerId` |
| Card Generation | 节点 CRUD 触发 `regenerateCard(nodeId)` |
| Memory Decay | 提供 `lastReview` 字段供衰退计算；复习行为反向更新 mastery |

## Formulas

### Force-Directed Layout

```
F_repulsion(i, j) = -k_repel / dist(i, j)^2
F_spring(i, j) = k_spring * (dist(i, j) - rest_length)   // 仅相连节点
F_center(i)    = -k_center * pos(i)
position(i)    += sum(F) * dt * damping
```

| Variable | Type | Range | Source | Description |
|---|---|---|---|---|
| k_repel | float | 200–2000 | tuning | 节点斥力 |
| k_spring | float | 0.01–0.2 | tuning | 链接弹性 |
| rest_length | float | 50–200 px | tuning | 链接静止长度 |
| damping | float | 0.7–0.95 | tuning | 阻尼 |
| dt | float | 16ms | runtime | 帧间隔 |

**Expected output**：≤ 5 秒内收敛至稳态（200 节点以内）。

### Node Color By Domain

```
hue = domainHueMap[domain]   // 见 game-concept.md §6
saturation = 70%
lightness = 40 + mastery * 0.4   // 掌握度越高越亮
```

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|---|---|---|
| 节点 self-link | 禁止 | 无意义 |
| 创建用户节点时 domain 选「用户自定义」 | 允许 | 8 域之一 |
| 节点数 > 200 | 切到 Canvas 渲染 + 默认按 domain 折叠 | 性能 |
| 删除一个被 N 张卡引用的 system 节点 | 不允许（system 节点不可删） | 数据完整性 |
| 用户节点孤立（无链接） | 允许，但 UI 提示「孤立节点战力较低」 | 鼓励互链 |
| 同 title 节点 | 允许（不同 ID），UI 显示 disambiguation | 避免删数据 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Auth | This depends | 需 userId |
| Card Generation | Card depends on this | 节点是卡的唯一来源 |
| Memory Decay | Decay depends on this | 读 lastReview，写 mastery |

## Tuning Knobs

| Parameter | Current | Safe Range | Effect+ | Effect− |
|---|---|---|---|---|
| k_repel | 800 | 200–2000 | 节点更分散 | 节点重叠 |
| k_spring | 0.05 | 0.01–0.2 | 链接更紧 | 松散 |
| rest_length | 120 | 50–200 | 图更大 | 更密 |
| 默认 mastery 衰退节点显示阈值 | 30 | 0–100 | 更多警告 | 更少 |
| 系统预设节点数 | 50 | 30–100 | 更丰富 | 更聚焦 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| 节点出现 | 粒子聚合 + 淡入 | 短促 chime | Medium |
| 创建链接 | 两节点间脉冲连线 | 「叮」音效 | High |
| 节点 mastery 上升 | 亮度脉冲 | 微弱反馈 | Medium |
| 节点禁用（衰退） | 灰阶 + 锁图标 | — | High |
| 搜索高亮 | 匹配节点放大 + 光环 | — | Medium |

## Game Feel

### Feel Reference
**Obsidian Graph View** 的丝滑感 + **星空图鉴**的浪漫感。NOT D3.js 默认 demo 的机械感。

### Input Responsiveness

| Action | Max Latency | Frame Budget @60fps | Notes |
|---|---|---|---|
| 拖拽节点 | 16ms | 1 帧 | 必须 60fps |
| 缩放（滚轮） | 16ms | 1 帧 | 平滑插值 |
| 点击打开详情 | 50ms | 3 帧 | 弹出动画 |
| 创建新节点 | 100ms | 6 帧 | 含表单弹出 |

### Animation Feel Targets

| Animation | Startup | Active | Recovery | Feel Goal |
|---|---|---|---|---|
| 节点点击展开 | 0 | 8 帧 | 4 帧 | 有弹性的「咔哒」 |
| 链接创建 | 4 帧 | 12 帧 | 0 | 流体能量传导 |
| 节点删除 | 0 | 16 帧 | 0 | 消散，不突兀 |

### Impact Moments

| Type | Duration | Effect | Configurable? |
|---|---|---|---|
| 创建用户节点 | 300ms | 全图轻微脉冲 | Yes |
| 跨域首次链接 | 500ms | 两域中线绽放粒子 | Yes |

### Weight and Responsiveness Profile

- **Weight**：节点应感觉**轻盈但有惯性**——拖动时有阻尼，松开后衰减回弹。
- **Player control**：High——任何时候可中断、撤销。
- **Snap quality**：连线创建是 binary（成功/取消），节点位置是 analog。
- **Acceleration**：缩放使用指数曲线，避免突变。
- **Failure texture**：链接到错误目标 → 连线弹回原节点 + 红色提示，无惩罚。

### Feel Acceptance Criteria
- [ ] 200 节点下拖拽保持 ≥ 55 fps（中端笔记本）
- [ ] 无 playtester 用「卡」「迟钝」「跳」描述
- [ ] 新建节点流程 ≤ 30 秒（包含填表）

## UI Requirements

| Information | Location | Update | Condition |
|---|---|---|---|
| 节点数 / 链接数 | 顶栏 | 实时 | 总是 |
| 当前过滤条件 | 左侧栏 | 用户变更时 | 总是 |
| 选中节点详情 | 右侧抽屉 | 选中变更 | 有选中 |
| 衰退提醒 badge | 节点上 | 每次进入图谱 | mastery < 阈值 |

## Cross-References

| This References | Target GDD | Element | Nature |
|---|---|---|---|
| ownerId 来自登录态 | `auth.md` | userId | Data dependency |
| 节点 CRUD 触发卡生成 | `card-system.md` | `regenerateCard` | Ownership handoff |
| mastery 由衰退计算 | `memory-decay.md` | mastery 更新规则 | Data dependency |

## Acceptance Criteria

- [ ] 50 个种子节点跨 7 域（不含「用户自定义」）覆盖 v1 内容
- [ ] CRUD 全部本地化持久化
- [ ] 双向链接 invariant 在所有路径下成立（测试覆盖）
- [ ] 删除节点 → 卡牌联动消失
- [ ] 200 节点下首次布局收敛 ≤ 5s
- [ ] Performance: graph tick ≤ 10ms / frame
- [ ] No hardcoded values（domain 配色、tuning 参数走配置）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| 是否支持节点分组/文件夹？ | ux-designer | Alpha | 倾向不做，违背图谱模型 |
| 链接是否支持类型/标签？ | game-designer | Alpha | TBD |
| 节点最大数量上限？ | technical-director | Alpha | 暂定 500，触发降级渲染 |
