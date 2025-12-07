# 简介

::: tip 提示
本指南假设你熟悉 Electron 、 Vite 、Tsup 、Turborepo 、Pnpm 。开始阅读之前建议先阅读 [Electron 指南](https://www.electronjs.org/docs/latest/) 、 [Vite 指南](https://cn.vitejs.dev/guide/) [Tsup 指南](https://tsup.egoist.dev/#what-can-it-bundle) 、[Turborepo](https://turbo.net.cn/docs/guides) 、[Pnpm](https://www.pnpm.cn/motivation)
:::

## 项目由来

- 我接手的electron项目架构有待提高、吐槽点多

- 对于electron的理解有所提高、对自己新学知识的巩固,以往electron项目 [安卓自动化](https://github.com/star-hjc/igentai-perftools)、[electron 开发模板](https://github.com/star-hjc/electron_template)

## 目录结构（主要模块）

```
.
├─ electron/
│  ├─ main/             # 主进程源码与构建
│  │  ├─ src/
│  │  ├─ dist/
│  │  └─ electron.config.ts
│  ├─ preload/          # 预加载模块（暴露 window.ipc）
│  │  ├─ src/
│  │  └─ dist/
│  └─ renderer/         # 渲染进程（前端 UI）
│     ├─ src/
│     └─ types/
├─ package/
│  ├─ electron/         # 自定义 Electron 工具库
│  │  ├─ src/
│  │  │  ├─ ipc/        # IPC 封装（main/preload/renderer）
│  │  │  └─ windows/    # 窗口管理（wins）
│  │  └─ types/
│  ├─ pinia/            # Pinia 多窗口状态同步
│  │  └─ src/
│  ├─ common/           # 通用工具与单例封装
│  │  └─ src/
│  ├─ workspace/        # 工作区工具（环境、统一导出）
│  │  └─ src/
│  ├─ wasm/             # WebAssembly 相关封装
│  │  ├─ src/           # Rust → Wasm 源码
│  │  └─ web/           # Wasm 测试页面
│  ├─ napi/             # 原生扩展（Node-API）
│  │  └─ src/           # Rust N-API 源码
│  ├─ bridge/           # 原生桥接（Rust 与 TS 交互）
│  │  └─ src/
│  ├─ eslint/           # 统一 ESLint 配置
│  │  └─ src/
├─ docs/                # VitePress 文档
│  ├─ api/
│  │  ├─ ipc.md
│  │  ├─ windows.md
│  │  └─ pinia-sync.md
│  └─ guide/
│     └─ introduction.md
├─ platform/            # 原生平台工具（Rust，网络等）
├─ process/             # 原生进程样例（Rust）
```

## 功能概述

- `@package/electron`：IPC 封装与主进程工具
  - 主进程：`ipc.response` 请求-响应；`ipc.on` 事件-回执；`ipc.send*` 广播/定向
  - 预加载：`@package/electron/preload` 暴露 `window.ipc` 与全局 `ipc` 别名
  - 特性隔离：`features` 将频道按窗口分组，公共频道不受隔离

- `@package/electron` 窗口管理（`wins`）
  - 记录窗口 `id <-> name`，支持同名分组与批量操作目标窗口集合

- `@package/pinia` 多窗口状态同步
  - 通过 `createWindowSyncStore` 包装 `defineStore`，在写入时上报主进程并广播到其他窗口
  - 支持白/黑名单字段过滤

- 类型自动生成（开发模式）
  - 扫描主进程注册的频道，生成渲染端与预加载端的声明文件（`renderer/types/ipc.d.ts`、`package/electron/types/preload.d.ts`）

- 其他子包
  - `@package/common`：通用工具方法、单例封装
  - `@package/workspace`：工作区工具（环境信息、统一导出）
  - `@package/wasm`：Wasm 封装与示例（Rust → Wasm）
  - `@package/napi`：Node-API 原生扩展（Rust N-API）
  - `@package/bridge`：原生桥接与类型导出

## 根目录配置

- `package.json`：工作区脚本与根级依赖管理
- `pnpm-workspace.yaml`：Pnpm 工作区包范围与结构
- `turbo.json`：Turborepo 任务管线与缓存配置
- `eslint.config.ts`：ESLint 扁平化配置（Monorepo 统一规范）
- `.editorconfig`：统一编辑器代码风格（缩进、编码等）
- `.env`、`.env.development`、`.env.production`：环境变量文件
- `.npmrc`、`.nvmrc`：Node/Npm 环境与版本约束
- `.gitignore`、`.gitattributes`：Git 忽略与属性配置
- `cspell.json`：拼写检查词典配置
- `.oxlintrc.json`：Oxlint 配置（快速 JS/TS 代码检查）
- `Cargo.toml`、`rustfmt.toml`：Rust 工作区与格式化配置
- `README.md`：项目总览与说明

## 开发与构建

- 开发命令
  - `pnpm dev`：执行预任务与代码检查后，运行 Turbo 的开发管线（main/preload/renderer 同步编译与运行）
  - `pnpm docs:dev | docs:build | docs:preview`：文档开发/构建/预览
  - `pnpm lint`/`lint:pro`：Oxlint + ESLint（生产模式更严格）

- 构建发布
  - `pnpm build`：生产模式 Lint 后，运行 Turbo 构建所有包
  - 主进程构建：`electron/main/tsup.config.ts`，产物整理到 `electron/main/dist`
  - 预加载构建：`electron/preload/tsup.config.ts`，产物输出到 `electron/main/dist/src/preload`
  - 应用打包：构建完成后自动调用 `electron-builder`，读取 `electron.config.ts`，输出 `app/win-unpacked`

- 兼容与限制
  - 主进程 `type: module` → 输出 `esm`；否则 `cjs`
  - 当输出 `cjs` 且 `electron-store >= 9.0.0` 时（版本清理后比较），会抛错以避免不兼容
  - 代码加密：仅 `cjs` 格式启用 bytenode，加密主入口并生成 loader；`esm` 不支持加密
  - 开发模式会自动生成 `dev-app-update.yml` 以适配本地更新调试（URL 来自环境变量）

## 调试与工具

- DevTools：`.devtools/vue` 提供调试资源与图标
- 监听类型生成：主进程编译成功后扫描频道注册并生成 Types（渲染与预加载）
- 窗口分组：使用 `wins` 辅助获取目标窗口 id 并进行定向消息发送
