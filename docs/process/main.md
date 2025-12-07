---
title: 原生进程（process/main）
---

# 原生进程（process/main）

- 路径：`process/main`

## 能力

- 独立 Rust 进程示例：`src/main.rs`，用于承载耗时/系统级任务
- 构建与运行：`Cargo.toml`、`build.rs`

## 集成

- 与 Electron 主进程协作（消息协议/管道），在主进程统一调度与资源管理

