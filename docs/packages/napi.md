---
title: 原生扩展（N-API）
---

# 原生扩展（N-API）

- 包路径：`package/napi`
- 模块名称：`@package/napi`

## 能力

- Rust N-API 模块（`src/lib.rs`、`build.rs`）输出到 `index.{js,mjs,d.ts}`
- 提供跨平台原生能力（例如数学/系统接口）

## 使用

```ts
import * as napi from '@package/napi'
const x = napi.add(1, 2)
```

## 注意

- 构建与加载需匹配当前平台与 Node/Electron ABI；建议在主进程进行初始化

