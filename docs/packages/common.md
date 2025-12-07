---
title: 通用工具（common）
---

# 通用工具（common）

- 包路径：`package/common`
- 模块名称：`@package/common`

## 能力

- 时间工具：格式化与时间计算（`src/time.ts`）
- 单例封装：统一的单例创建与获取（`src/singleton.ts`）
- 基础导出：常用工具函数集合（`src/index.ts`）

## 使用

```ts
import { sleep } from '@package/common/time'
import { singleton } from '@package/common/singleton'

await sleep(500)

class Store { count = 0 }
const StoreSingleton = singleton(Store)
const store = new StoreSingleton()
```

## 注意

- 保持工具函数纯净与可测试，避免耦合 Electron 环境
- 顶层导出仅包含基础函数，其他工具请按子路径导入（如 `@package/common/time`、`@package/common/singleton`）
- API（代码参考）

- `sleep(ms: number): Promise<void>`（`@package/common/time`），位置：`package/common/src/time.ts:1`
- `singleton<T>(ClassName: T): T`（`@package/common/singleton`），位置：`package/common/src/singleton.ts:1`
- `greet(): void`（`@package/common`），位置：`package/common/src/index.ts:1`
