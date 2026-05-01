# Game Concept: Knowledge Quest（知识征途）

*Created: 2026-04-28*
*Status: Approved (v2.0 → restructured per CCGS architecture)*

---

## Elevator Pitch

> 这是一款**炉石传说风格的卡牌对战游戏**，玩家通过**构建并维护自己的知识图谱**来获得战斗卡牌——每一个掌握的知识点变成一张随从，每一条用户原创的笔记变成一张专属「秘技卡」，最终用知识本身去击败 Boss。
>
> 测试：未玩过的人能否在 10 秒内理解？「炉石传说 + Obsidian 知识图谱，你的笔记就是你的卡牌。」

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | 集换式卡牌对战 (TCG) + 知识图谱 (PKM) 混合 |
| **Platform** | Web (桌面浏览器优先) |
| **Target Audience** | 18–35 岁，知识工作者 / 学生 / Obsidian-Anki-Notion 用户 |
| **Player Count** | Single-player (PvE)，预留 PvP 接口 |
| **Session Length** | 15–30 分钟（一场对战 + 一次知识维护） |
| **Monetization** | Premium / 自部署，无内购 |
| **Estimated Scope** | Medium（3–9 个月） |
| **Comparable Titles** | Hearthstone、Slay the Spire、Obsidian、Anki |

---

## Core Fantasy

> **「我所学的一切，都是我的武器。」**

玩家不是在打卡牌游戏——玩家是在**把自己的知识结构化成战力**。
每一次复习、每一次新建笔记、每一次链接两个概念，都直接转化为牌桌上的优势。
赢下一场战斗的快感，等同于「我真的掌握了这块知识」的实证反馈。

---

## Unique Hook

「**它像炉石传说，AND ALSO 你的卡组就是你的笔记本。**」

- 系统知识 → 通用随从卡（蓝边）
- 用户原创知识 → 独有秘技卡（金边 ✨），别的玩家永远抽不到
- 关联越密、掌握度越高 → 卡牌数值越强
- 长期不复习 → 卡牌数值衰退甚至禁用（遗忘曲线）

这不是「学习皮肤套在卡牌上」的 gamification，而是**知识结构 ↔ 卡组结构** 的双向同构。

---

## Player Experience Analysis (MDA Framework)

### Target Aesthetics

| Aesthetic | Priority | How We Deliver It |
| ---- | ---- | ---- |
| **Challenge** (掌握) | 1 | Boss 难度梯度、法力曲线博弈、随从交换 tempo |
| **Expression** (自我表达) | 2 | 用户自定义知识 → 专属秘技卡，独一无二的卡组 |
| **Discovery** (探索) | 3 | 知识图谱可视化、跨域共鸣组合、隐藏 synergy |
| **Sensation** (感官) | 4 | 炉石级动效、霓虹色卡面、力导向图脉冲 |
| **Fantasy** | 5 | 「知识武装的法师」角色幻想 |
| Narrative / Fellowship / Submission | N/A | 本作不强调线性故事、社交、放松 |

### Key Dynamics（期望涌现的玩家行为）

- 玩家会为了**强化某张关键卡**，回到知识图谱主动复习对应节点
- 玩家会**新建并互链笔记**，去解锁高数值的秘技卡
- 玩家会**研究 Boss 卡组**，反推自己应补的知识域
- 玩家会**讨论自己的卡组截图**，因为它就是自己的知识体系画像

### Core Mechanics

1. **知识图谱 CRUD**：节点、链接、标签、掌握度
2. **知识 → 卡牌转化引擎**：mastery / links / tags / source → 卡牌属性
3. **炉石式法力对战**：水晶递增、手牌、随从、英雄技能
4. **遗忘曲线衰退**：时间 → 掌握度 → 卡牌数值
5. **秘技卡生成**：用户自创节点 → 唯一效果

---

## Player Motivation Profile (Self-Determination Theory)

| Need | How This Game Satisfies It | Strength |
| ---- | ---- | ---- |
| **Autonomy** | 玩家完全决定建什么节点、链什么关系、组什么卡组 | Core |
| **Competence** | 掌握度数值化、Boss 阶梯、对战胜负作为反馈 | Core |
| **Relatedness** | 弱（v1 单机），未来通过卡组分享 / 知识社区扩展 | Minimal |

### Bartle Player Type Appeal

- [x] **Achievers** — 收集知识节点、Boss 击杀、掌握度满分
- [x] **Explorers** — 知识图谱漫游、跨域 synergy 发掘
- [ ] Socializers — v1 不支持
- [ ] Killers — v1 无 PvP

### Flow State Design

- **Onboarding**：首次进入 → 引导式建立 5 个种子节点 → 第一场对战
- **Difficulty scaling**：Boss 按知识域 + 难度梯度（普通 → 精英 → 传说）
- **Feedback clarity**：节点掌握度条 / 卡牌数值实时计算 / 战斗 log
- **Recovery**：失败惩罚弱（仅经验少），鼓励重试 + 复习

---

## Core Loop

### Moment-to-Moment (30s)

打出一张卡 → 看到效果触发 → 决定下一步攻击/换牌。

### Short-Term (5–15 min)

完整一场 PvE 对战：抽牌 → 解场 → 斩杀 / 被斩杀。

### Session-Level (30–120 min)

战败 → 进入知识图谱补强相应域 → 新建/复习节点 → 卡组重构 → 再战。

### Long-Term Progression

- 知识图谱节点数：5 → 50 → 200+
- 解锁更高难度 Boss
- 等级 / 金币 / 卡背 / 头像（轻度 meta）

### Retention Hooks

- **Curiosity**：未发现的跨域 synergy / 未挑战的 Boss
- **Investment**：自己积累的知识图谱无法替代
- **Mastery**：掌握度衰退提醒 → 「你今天该复习了」

---

## Game Pillars（详见 `game-pillars.md`）

1. **知识即卡牌**——所有战力必须可追溯到一个知识节点
2. **原创即秘技**——用户产出的内容必须比预设内容更强、更独特
3. **遗忘有代价**——不复习就掉数值，没有「躺平不维护也变强」的路径

详细落地见 [`game-pillars.md`](./game-pillars.md)。

### Anti-Pillars

- **NOT 一款答题游戏**——核心循环是卡牌对战，不是问答闯关
- **NOT 一款挂机/养成游戏**——所有进度都需要主动学习行为驱动
- **NOT 一款重剧情 RPG**——叙事是装饰，不是核心
- **NOT 一款 PvP 竞技游戏**（v1）——平衡性和反作弊不在 MVP 范围

---

## Inspiration and References

| Reference | What We Take From It | What We Do Differently | Why It Matters |
| ---- | ---- | ---- | ---- |
| Hearthstone | 法力水晶、随从对战、英雄技能 | 卡池来自玩家知识，不是统一卡池 | 验证 TCG 节奏可玩性 |
| Obsidian | 力导向图、双向链接、本地优先 | 图谱直接驱动战力，不只是组织笔记 | 验证 PKM UI 范式 |
| Anki | 遗忘曲线、间隔复习 | 复习反馈不是评分，而是卡牌数值 | 验证记忆模型有效 |
| Slay the Spire | 卡组构筑、Boss 阶梯 | 卡牌不是 run-based，是长期积累 | 验证 PvE 难度曲线 |

**Non-game inspirations**：费曼学习法、Roam Research、知识晶体（开智学堂）。

---

## Target Player Profile

| Attribute | Detail |
| ---- | ---- |
| **Age range** | 18–35 |
| **Gaming experience** | Mid-core（玩过炉石/杀戮尖塔级别） |
| **Time availability** | 工作日 30 分钟 / 周末更长 |
| **Platform preference** | 桌面浏览器（学习场景） |
| **Current games they play** | Hearthstone、Slay the Spire；Anki/Obsidian 用户 |
| **What they're looking for** | 让「学习」本身有内在反馈和炫耀价值的载体 |
| **What would turn them away** | 学习内容被强加（必须是自己的体系才有动力） |

---

## Technical Considerations

| Consideration | Assessment |
| ---- | ---- |
| **Recommended Engine** | Web — React 18 + Vite + TypeScript |
| **Key Technical Challenges** | 力导向图性能（200+ 节点）、卡牌动效流畅度、AI Boss 决策 |
| **Art Style** | 2D 卡牌 + 霓虹/赛博朋克 UI + 星云图谱 |
| **Art Pipeline Complexity** | Low（CSS/SVG 为主，无 3D） |
| **Audio Needs** | Minimal（v1 仅 SFX，可选 BGM） |
| **Networking** | None（v1 全本地 localStorage） |
| **Content Volume** | 50+ 系统知识节点、9 个 Boss、~30 个英雄技能/效果 |
| **Procedural Systems** | 知识 → 卡牌生成、AI Boss 出牌策略 |

详见 `docs/architecture/`（待创建）。

---

## Risks and Open Questions

### Design Risks
- 学习与娱乐节奏冲突——对战中途打断学习心流？（→ 已通过「先建图谱再对战」的循环顺序缓解）
- 用户原创卡数值平衡——可能过强或过弱（→ Tuning Knobs 在 `card-system.md`）

### Technical Risks
- 200+ 节点力导向图在低端设备卡顿（→ 需 prototype 验证，见 `knowledge-graph.md`）
- localStorage 容量上限（5–10 MB）→ 长期重度用户可能溢出（→ 未来迁移 IndexedDB）

### Market Risks
- 用户愿意「为了打牌而学习」吗？还是只为了学习而学习？（→ MVP 必须验证）

### Scope Risks
- 卡牌效果系统（战吼/亡语/嘲讽/连击/跨域共鸣）组合爆炸（→ MVP 只做战吼+嘲讽）

### Open Questions
- 自动效果生成 vs 玩家手动指定效果？(→ MVP 用规则模板，见 `card-system.md`)
- 是否引入「卡牌平衡补丁」机制？

---

## MVP Definition

**Core hypothesis**：玩家会**为了赢下对战**，主动回到知识图谱去新建/复习节点。

**Required for MVP**：
1. 知识图谱（CRUD + 力导向可视化 + 50 个种子节点）
2. 知识 → 卡牌生成引擎（基础规则）
3. 炉石式对战（法力、手牌、随从、英雄 30HP）
4. 1 个 Boss + 简单 AI（随机出牌足矣）
5. 用户登录 + 数据持久化（localStorage）

**Explicitly NOT in MVP**：
- 复杂卡牌效果（亡语、连击、跨域共鸣）
- 遗忘曲线衰退（v2）
- PvP / 排行榜 / 社区
- 成就 / 每日挑战
- 多个 Boss 阶梯

### Scope Tiers

| Tier | Content | Features | Timeline |
| ---- | ---- | ---- | ---- |
| **MVP** | 50 节点 + 1 Boss | 图谱 + 转化 + 基础对战 | 4 周 |
| **Vertical Slice** | 100 节点 + 3 Boss | + 秘技卡 + 战吼/嘲讽 | +3 周 |
| **Alpha** | 200 节点 + 9 Boss | + 遗忘曲线 + 全部效果 | +6 周 |
| **Full Vision** | 用户自由扩展 | + 成就 + 每日挑战 + 卡组分享 | +8 周 |

---

## Next Steps

- [x] 概念审批（用户已确认 v2.0）
- [x] 拆分系统索引（见 `systems-index.md`）
- [ ] 完成各系统 GDD 详细设计
- [ ] 建立第一个 ADR（架构决策记录）：`localStorage vs IndexedDB`
- [ ] Prototype 力导向图性能测试
- [ ] 首次 playtest 验证 Core hypothesis
