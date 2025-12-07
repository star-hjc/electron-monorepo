---
title: WASM 集成（wasm）
---

# WASM 集成（wasm）

- 包路径：`package/wasm`
- 模块名称：`@package/wasm`

## 能力

- Rust → Wasm 构建（`build.sh`、`Cargo.toml`）
- Web 端加载示例（`web/test.html`）

## 使用

```ts
import wasm from '@package/wasm'
const res = await wasm.call('input')
```

## 注意

- 渲染端加载需考虑 `wasm` 文件路径与静态资源部署；可通过 Vite 静态资源策略管理

