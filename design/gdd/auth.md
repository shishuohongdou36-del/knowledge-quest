# Auth & Persistence

> **Status**: In Design
> **Author**: systems-designer
> **Last Updated**: 2026-04-28
> **Last Verified**: 2026-04-28
> **Implements Pillar**: Foundation（无直接 Pillar，但承载 Pillar 1+3 所依赖的数据持久化）

## Summary

提供本地账号注册/登录、访客模式、用户数据持久化。所有玩家数据（知识图谱、卡组、对战记录、统计）均绑定用户 ID，存储在 localStorage 中。

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `None`

## Overview

这是 Knowledge Quest 的最底层系统。玩家可以以三种方式进入：注册新账号、登录已有账号、或访客模式（无注册）。访客可在任何时候升级为正式账号且不丢数据。所有数据本地优先（localStorage + Zustand persist），v1 不联网。

## Player Fantasy

「我的知识库是我的私人保险箱——不需要任何人许可，也不会被云端绑架。」玩家应感到**完全的数据主权与隐私**。

## Detailed Design

### Core Rules

1. 用户名必须 3–20 字符，唯一性在本地用户表中校验。
2. 密码以 SHA-256 哈希后存储；明文不写入任何位置。
3. 访客模式生成随机 `guest_xxxxx` 用户 ID，所有数据正常持久化。
4. 访客升级正式账号：填写用户名密码，原 guest user record 重写为正式 record（保留所有数据）。
5. 同一时刻仅一个用户处于登录态；切换用户时清空内存中的图谱/卡组缓存。
6. localStorage 满时（QuotaExceededError）抛出明确错误并提示用户清理或导出。

### States and Transitions

| State | Entry Condition | Exit Condition | Behavior |
|---|---|---|---|
| Anonymous | App 启动且无 active session | 登录成功 / 注册成功 / 进入访客 | 显示登录页 |
| Guest | 选择「访客模式」 | 登出 / 升级 / 切换账号 | 正常游戏，UI 角标显示「访客」 |
| Authenticated | 登录或注册成功 | 登出 | 完整功能解锁 |

### Interactions with Other Systems

| System | Interface |
|---|---|
| Knowledge Graph | 提供当前 `userId`，图谱按 userId 隔离存储 |
| Card Generation | 不直接交互，通过 KG 间接 |
| Battle | 战斗结果写回 user.stats |

## Formulas

### Password Hash

```
hash = sha256(username + ":" + password + ":" + APP_SALT)
```

| Variable | Type | Range | Source | Description |
|---|---|---|---|---|
| username | string | 3–20 | input | 全小写化 |
| password | string | 6–64 | input | 不做复杂度校验（v1） |
| APP_SALT | string | const | code | 编译时常量，防同明文相同哈希 |

**Edge case**：username 含 `:` 时按字面拼接，不需转义（哈希仍唯一）。

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|---|---|---|
| 重复用户名注册 | 拒绝并提示「用户名已存在」 | 唯一性 |
| 访客切换浏览器 | 数据丢失（localStorage 隔离） | v1 局限，UI 必须警告 |
| localStorage 被禁用 | 进入只读演示模式 | 不能崩溃 |
| 同名 + 不同密码登录 | 拒绝 | 哈希不匹配 |
| 升级访客时填了已存在的用户名 | 拒绝，原 guest 数据保留 | 安全 |

## Dependencies

| System | Direction | Nature |
|---|---|---|
| Knowledge Graph | KG depends on this | userId 作为数据隔离 key |
| Battle | Battle depends on this | 写入 stats 需 userId |
| UI Shell | UI depends on this | 路由守卫使用登录态 |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|---|---|---|---|---|
| 用户名最小长度 | 3 | 2–8 | 更易冲突 | 更宽松 |
| 密码最小长度 | 6 | 4–16 | 更安全但更烦 | 更易记但弱 |
| 访客保留天数 | ∞ (本地永久) | 7–∞ | — | 强制升级 |

## Visual/Audio Requirements

| Event | Visual | Audio | Priority |
|---|---|---|---|
| 登录成功 | 头像淡入 + 欢迎文案 | 短促上扬 SFX | High |
| 注册成功 | 欢迎引导动画 | 同上 | High |
| 登录失败 | 输入框红色震动 | 错误提示音 | Medium |
| 访客升级 | 庆祝特效 | 升级音效 | Medium |

## Game Feel

### Feel Reference
应像 Notion / Linear 的登录——**安静、确定、零摩擦**。NOT 像游戏开服的盛大动画。

### Input Responsiveness

| Action | Max Latency | Frame Budget @60fps | Notes |
|---|---|---|---|
| 输入字符 | 16ms | 1 帧 | 受控组件 |
| 提交登录 | 100ms | 6 帧 | 含哈希计算 |
| 切换登录/注册 tab | 50ms | 3 帧 | 平滑过渡 |

### Feel Acceptance Criteria
- [ ] 登录流程从打开页面到进入主界面 ≤ 5 秒（首次访问）
- [ ] 任何按钮点击都有 ≤ 100ms 视觉反馈
- [ ] 没有「白屏 > 200ms」的中间态

## UI Requirements

| Information | Display Location | Update Frequency | Condition |
|---|---|---|---|
| 当前用户名 | 顶栏右侧 | 登录态变化时 | Authenticated/Guest |
| 访客角标 | 头像旁 | 静态 | Guest |
| 升级提示 | 设置页 banner | 每次进入设置 | Guest |

## Cross-References

| This Document References | Target GDD | Specific Element | Nature |
|---|---|---|---|
| `userId` 作为图谱数据 key | `knowledge-graph.md` | `KnowledgeNode.ownerId` | Data dependency |
| 战斗结束写 stats | `battle.md` | Battle 结束钩子 | Ownership handoff |

## Acceptance Criteria

- [ ] 注册流程 ≤ 4 步完成
- [ ] 登录哈希校验正确率 100%
- [ ] localStorage 配额异常被妥善处理（不崩溃）
- [ ] 访客升级零数据损失（由测试覆盖）
- [ ] 登出清空内存缓存
- [ ] No hardcoded values in implementation（除 APP_SALT 常量外）

## Open Questions

| Question | Owner | Deadline | Resolution |
|---|---|---|---|
| 是否提供 export/import JSON 备份？ | systems-designer | Alpha | TBD |
| 是否在 Alpha 迁移到 IndexedDB？ | technical-director | Pre-Alpha | 待 ADR-001 |
