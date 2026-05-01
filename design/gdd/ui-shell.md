# UI Shell & Routing

> **Status**: In Design
> **Author**: ui-programmer + ux-designer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Foundation（承载所有功能的导航与全局 UI 框架）

## Summary

应用的全局外壳：路由架构、顶栏 / 侧栏、模态系统、Toast 通知、主题与响应式布局。所有功能页面通过此 shell 接入；本系统不实现具体功能逻辑，只提供"舞台"。

> **Quick reference** — Layer: `Presentation` · Priority: `MVP` · Key deps: `Auth`

## Overview

Knowledge Quest 是 Web 单页应用（SPA）。Shell 提供：

- **Top-level Routes**：`/login` `/dashboard` `/graph` `/deck` `/battle` `/settings`
- **Persistent Chrome**：顶栏（Logo / 用户头像 / 金币 / 等级）、侧栏（导航）、底部状态条
- **Global Overlays**：模态、Toast、确认对话框、加载遮罩
- **Theme System**：深色（默认）+ 浅色（可选）；霓虹色调由 CSS 变量驱动
- **Responsive Strategy**：桌面优先（≥ 1280px 完整）；平板（768–1279）紧凑；移动（< 768）引导跳转桌面（v1 不优化）

## Player Fantasy

「这个 App 像我的私人知识工作台——干净、安静、所有东西都在它该在的位置。」UI 应**消失**——让玩家专注于知识与战斗，而不是导航。

## Detailed Design

### Core Rules

1. 路由由 React Router v6 管理；URL 是真实状态，可分享 / 收藏。
2. 未登录访问受保护路由 → 重定向到 `/login`，登录后回原路由。
3. 模态系统单实例：同时只显示一个；新模态打开自动关闭旧的。
4. Toast 同时最多 3 条；超出按时间最早的自动消失。
5. 路由切换有 200ms 淡入淡出过渡；战斗页路由切换需玩家确认（防误退）。
6. 全局快捷键（v2）：`g` 图谱 / `b` 战斗 / `d` 卡组 / `?` 帮助。
7. 主题切换实时生效，无刷新；存 localStorage。

### Routes

| Path | Page | 守卫 | 说明 |
|---|---|---|---|
| `/login` | LoginPage | 已登录则重定向 dashboard | 登录/注册/访客 |
| `/dashboard` | Dashboard | 需登录 | 概览：节点数、衰退提醒、最近战斗、Boss 入口 |
| `/graph` | KnowledgeGraphPage | 需登录 | 力导向图主界面 |
| `/graph/:nodeId` | KnowledgeGraphPage | 需登录 | 同上，自动选中节点 |
| `/deck` | DeckBuilderPage | 需登录 | 卡组构建（VS+） |
| `/battle/select` | BossSelectPage | 需登录 | 选择 Boss |
| `/battle/:bossId` | BattleArenaPage | 需登录 + 卡组就绪 | 实际对战 |
| `/settings` | SettingsPage | 需登录 | 主题 / 数据导出 / 账号 |
| `/*` | NotFoundPage | — | 404 |

### States and Transitions

| State | Entry | Exit | Behavior |
|---|---|---|---|
| Loading | 路由切换中 | 新路由就绪 | 淡入淡出 |
| Modal Open | 任意触发 dispatch openModal | dispatch close | 背景遮罩 + ESC 关闭 |
| Toast Stack | dispatch toast | 4s 后自动消失 / 用户点 X | 右下堆叠 |
| Confirm Dialog | 危险操作触发 | 用户确认 / 取消 | 阻塞，键盘焦点锁定 |

### Interactions with Other Systems

| System | Interface |
|---|---|
| Auth | 读登录态决定路由守卫；提供登出按钮 |
| Knowledge Graph | 提供 `/graph` 容器；接收 nodeId 参数 |
| Battle | 提供 `/battle/:bossId` 容器；战中阻止退出 |
| Memory Decay | 在 Dashboard 与顶栏 banner 显示衰退提醒 |
| Card Generation | 顶栏显示当前卡牌总数；变化时小动画 |

## Formulas

### Layout Breakpoints

```
desktop:  width >= 1280px   // 完整布局
tablet:   768 <= width < 1280   // 侧栏折叠为图标
mobile:   width < 768   // 引导跳转桌面
```

### Toast Stack Geometry

```
toast_y(i) = bottom_offset + i * (toast_height + gap)
visible_count = min(active_toasts, 3)
```

### Theme Color Resolution

```
--color-primary  = themeMap[currentTheme].primary
--color-bg       = themeMap[currentTheme].bg
--color-domain-{X} = themeMap[currentTheme].domains[X]
```

## Edge Cases

| Scenario | Expected | Rationale |
|---|---|---|
| 战斗中刷新页面 | 加载时检测 active battle 并恢复 | 不丢战局 |
| 战斗中点击其他路由 | 弹确认对话框「确认放弃当前战斗？」 | 防误操作 |
| 移动端访问 | 显示「请用桌面访问」全屏提示 | v1 局限 |
| 同时触发多个 Toast | 仅保留 3 条，按时间堆叠 | 防 UI 爆炸 |
| 模态打开时再触发模态 | 旧模态关闭，新模态打开 | 单实例 |
| 网络不可用（v1 全本地无影响） | 不显示网络错误 | 离线优先 |
| localStorage 写入失败 | 顶栏红色 banner「保存失败，请清理空间」 | 用户感知 |
| URL 含无效 nodeId | 图谱正常加载，仅不预选节点 | 鲁棒性 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Auth | This depends | 路由守卫 + 登录态 |
| All Feature Pages | This hosts | 提供容器 |
| Knowledge Graph | This depends | 顶栏统计、Dashboard 数据 |
| Memory Decay | This depends | 衰退提醒展示 |

## Tuning Knobs

| Parameter | Current | Safe Range | Effect+ | Effect− |
|---|---|---|---|---|
| Toast 显示时长 | 4000ms | 2000–8000 | 更易看清 | 更不打扰 |
| Toast 最大堆叠 | 3 | 1–5 | 更多信息 | 更聚焦 |
| 路由过渡时长 | 200ms | 100–400 | 更平滑 | 更敏捷 |
| 模态打开动画 | 250ms | 150–400 | 更优雅 | 更直接 |
| 桌面断点 | 1280px | 1024–1440 | 更严苛 | 更宽容 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| 路由切换 | 整页淡入淡出 | — | High |
| Toast 出现 | 右下滑入 + 淡入 | 短促 tick（success/error 不同） | Medium |
| 模态打开 | 背景模糊 + 中心缩放 | 轻微下沉 SFX | Medium |
| 顶栏数值变化（金币/经验） | 数字翻滚 + 微光 | 收集音效 | Low |
| 衰退提醒 banner | 顶栏黄色边框脉冲 | — | High |

## Game Feel

### Feel Reference
**Linear** / **Notion** 的克制感 + **Hearthstone** 主菜单的仪式感。NOT 一般游戏 UI 的浮夸（霓虹只用在卡牌与图谱，shell 本身保持安静）。

### Input Responsiveness

| Action | Max Latency | Frame Budget @60fps | Notes |
|---|---|---|---|
| 点击导航 | 16ms | 1 帧 | 视觉立即反馈 |
| 路由切换完成 | 300ms | 18 帧 | 含数据加载 |
| 模态打开 | 250ms | 15 帧 | 平滑动画 |
| Toast 显示 | 16ms | 1 帧 | 立即出现 |
| 主题切换 | 16ms | 1 帧 | CSS 变量瞬切 |

### Animation Feel Targets

| Animation | Startup | Active | Recovery | Feel Goal |
|---|---|---|---|---|
| 路由淡出/淡入 | 0 | 12 帧 | 0 | 干净，不拖沓 |
| 模态进入 | 4 帧 | 12 帧 | 0 | 弹性收束 |
| Toast 滑入 | 0 | 16 帧 | 0 | 软着陆 |
| 顶栏数字翻滚 | 4 帧 | 12 帧 | 0 | 庆祝感但克制 |

### Impact Moments

| Type | Duration | Effect | Configurable? |
|---|---|---|---|
| 等级提升 | 1500ms | 全屏弹层 + 烟花 | No |
| 衰退首次警告 | 800ms | 顶栏 banner 抖动 + 黄光 | Yes |
| 数据保存失败 | 持续到解决 | 顶栏红色边框 + 持续提示 | No |

### Weight and Responsiveness Profile

- **Weight**：Light——shell 应"轻"，让内容（图谱/卡牌）成为重点。
- **Player control**：High——任何时候可逃出（除战斗中需确认）。
- **Snap quality**：Crisp——按钮、tab 切换都是 binary。
- **Failure texture**：操作失败时**永远有具体提示**（"保存失败：空间不足"），不只 "Error"。

### Feel Acceptance Criteria
- [ ] 进入应用到看到 Dashboard ≤ 1.5s（首次）
- [ ] 任何路由切换 ≤ 500ms 完成
- [ ] 无 playtester 反馈"找不到功能在哪"
- [ ] 无路由跳错 / 数据闪烁 / 布局抖动

## UI Requirements

### 顶栏（持久）

| Info | Position | Update | Condition |
|---|---|---|---|
| Logo / 应用名 | 左 | 静态 | 总是 |
| 主导航（图谱 / 卡组 / 战斗） | 中 | 当前路由高亮 | 已登录 |
| 用户头像 / 用户名 | 右 | 登录态变化时 | 已登录 |
| 等级 / 经验进度 | 头像旁 | 经验变化时 | 已登录 |
| 金币数 | 头像旁 | 金币变化时 | 已登录 |
| 衰退提醒 badge | 主导航"图谱"项 | 衰退节点 ≥ 5 | 已登录 |

### 底部状态条（v2 可选）

| Info | Position | Update | Condition |
|---|---|---|---|
| 知识节点数 | 左 | 实时 | 已登录 |
| 卡牌总数 | 中 | 实时 | 已登录 |
| 最近一战胜负 | 右 | 战斗结束 | 有战斗历史 |

### Dashboard 信息块

- **欢迎卡**：用户名 + 等级 + 简介
- **衰退提醒卡**（条件展示）：N 张卡牌正在衰退
- **快速行动卡**：进入图谱 / 进入战斗 / 卡组构建
- **最近战斗历史**（最多 5 条）

## Cross-References

| This References | Target GDD | Element | Nature |
|---|---|---|---|
| 路由守卫读登录态 | `auth.md` | userId / isAuthenticated | Data dependency |
| Dashboard 显示衰退节点数 | `memory-decay.md` | currentMastery | Data dependency |
| 顶栏卡牌总数 | `card-system.md` | 卡牌全集 | Data dependency |
| `/battle/:bossId` 容器 | `battle.md` | 战斗页面挂载点 | Ownership handoff |
| `/graph` 容器 | `knowledge-graph.md` | 图谱页面挂载点 | Ownership handoff |

## Acceptance Criteria

- [ ] 所有路由可直接 URL 访问（含路由守卫）
- [ ] 已登录用户访问 `/login` 自动重定向到 `/dashboard`
- [ ] 未登录用户访问受保护路由保留 returnTo 并跳转登录
- [ ] 模态系统单实例（测试覆盖：连续触发不堆叠）
- [ ] Toast 最多 3 条同显（测试覆盖）
- [ ] 战斗中切路由触发确认对话框
- [ ] 主题切换不刷新页面、不丢失滚动位置
- [ ] 桌面断点下不出现横向滚动条
- [ ] Lighthouse 首屏 LCP ≤ 2.5s
- [ ] No hardcoded values（颜色 / 间距走 design tokens）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| 是否实现移动端适配？ | ux-designer | Alpha | v1 桌面优先，移动端 v2 |
| 是否提供命令面板（Cmd+K）？ | ui-programmer | Vertical Slice | 倾向 v2 |
| Dashboard 是否可拖拽自定义？ | ux-designer | Full Vision | 倾向不（保持简单） |
| 主题：是否暴露用户自定义颜色？ | ux-designer | Full Vision | TBD |
