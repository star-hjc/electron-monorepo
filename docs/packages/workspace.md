---
title: 工作区工具（workspace）
---

# 工作区工具（workspace）

- 包路径：`package/workspace`
- 模块名称：`@package/workspace`

## 能力

- 环境变量管理：`src/env.ts` 聚合并提供 `get()` 读取
- 工作区信息：根路径、提交哈希等（`getRoot()`、`getCommitHash()`）
- 构建注入：主进程构建中以 `define` 注入 `process.env.*`

## 使用

```ts
import workspace from '@package/workspace'
import env from '@package/workspace/env'

const root = workspace.getRoot()
const vars = env.get()
```

## 注意

- 在 `electron/main/tsup.config.ts` 中以 `define` 注入，渲染/预加载不应直接依赖 Node 端环境
- API（代码参考）

- `env.get(mode?: string)`，位置：`package/workspace/src/env.ts:70`
- `env.set(mode?: string)`，位置：`package/workspace/src/env.ts:87`
- `env.updateFile(options: EnvOptions)`，位置：`package/workspace/src/env.ts:112`
- `env.updateFileByMode(options: EnvOptions, mode?: string)`，位置：`package/workspace/src/env.ts:136`
- `workspace.getWorkspace()`，位置：`package/workspace/src/index.ts:15`
- `workspace.getWorkspaceByName(name?: string)`，位置：`package/workspace/src/index.ts:19`
- `workspace.getCommitHash()`，位置：`package/workspace/src/index.ts:25`
- `workspace.getRoot()`，位置：`package/workspace/src/index.ts:36`

