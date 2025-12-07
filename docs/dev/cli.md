---
title: CLI（clean/env）
---

# CLI（clean/env）

- 路径：`cli`

## 能力

- 清理：`clean` 脚本整理构建产物与临时目录
- 环境：`env` 脚本注入/读取工作区环境变量

## 使用

```bash
pnpm ts-node cli/src/clean.ts
pnpm ts-node cli/src/env.ts
```

## 注意

- 与 `pretask` 配合使用，确保初始构建状态正确

