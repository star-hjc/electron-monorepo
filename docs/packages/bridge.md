---
title: 原生桥接（bridge）
---

# 原生桥接（bridge）

- 包路径：`package/bridge`
- 模块名称：`@package/bridge`

## 能力

- Rust 导出能力（`src/lib.rs`）通过 TS 包装为可调用接口（`index.ts`）
- 类型定义：`types/index.d.ts` 提供 TS 使用提示

## 使用

```ts
import bridge from '@package/bridge'
const result = await bridge.doSomething('input')
```

## 注意

- 需确保对应原生构建产物已生成；在主进程优先加载，以统一资源路径

