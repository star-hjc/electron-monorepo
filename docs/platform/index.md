---
title: 原生平台（platform）
---

# 原生平台（platform）

- 路径：`platform`

## 能力

- 网络子系统：`os/network` 提供跨平台网络能力抽象（`windows.rs`/`macos.rs`）
- 错误模型与类型：统一错误与数据类型（`error.rs`、`types.rs`）

## 使用

- 通过原生进程或桥接层在主进程调用，建议统一在主进程初始化并暴露到渲染端

