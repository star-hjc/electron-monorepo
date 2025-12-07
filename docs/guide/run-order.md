---
title: 开发与构建流程
---

# 开发与构建流程

## 安装后流程（postinstall）

1. 触发：`pnpm postinstall` → `pnpm pretask`
2. 完成工作区的预任务链，保证初始构建目录与类型文件就绪（含预加载产物输出路径、类型声明生成位置准备）

## 预任务（pretask） {#pretask}

- 命令：`pnpm pretask`
- 作用：清理并准备各包的构建输出目录；生成或准备预加载产物输出至 `electron/main/dist/src/preload`
- 依赖链：
  - `@package/common#pretask → @package/workspace#pretask → cli#pretask`
  - `cli#pretask → @electron/renderer#pretask`、`cli#pretask → @electron/main#pretask`
  - `@package/electron#pretask → @electron/preload#pretask`
- 触发时机：
  - 安装后自动执行（`postinstall`）
 - 可手动执行以重置构建环境或准备类型生成
- 注意事项：任务为短时非持久（persistent: false），可能使用缓存（cache: true）；如目录结构异常或类型未生成，优先执行该命令修复环境。

### 开发依赖图（pretask）

```mermaid
graph TB
  common_pretask[@package/common#pretask] --> workspace_pretask[@package/workspace#pretask] --> cli_pretask[cli#pretask]
  cli_pretask --> renderer_pretask[@electron/renderer#pretask]
  cli_pretask --> main_pretask[@electron/main#pretask]
  electron_pkg_pretask[@package/electron#pretask] --> preload_pretask[@electron/preload#pretask]
```

## 开发流程（pnpm dev）

1. 执行预任务：`pnpm pretask`（详见[预任务（pretask）](#pretask)）

2. 代码检查：`pnpm lint`
   - `oxlint .` + `eslint .`

3. 启动开发管线：`turbo run dev`
   - 任务拓扑：`^dev`（所有包的 dev，按依赖顺序执行）
   - 关键依赖：
     - `@electron/main#dev` 依赖 `@package/bridge#dev`、`@package/wasm#dev`
     - `@electron/renderer#dev` 依赖 `@package/wasm#dev`
   - 主进程构建细节（`electron/main/tsup.config.ts`）：
     1. `buildStart`：版本校验（`electron-store` 在 `cjs` 时 >= 9 抛错）、生成 `dev-app-update.yml`、清理 `dist`
     2. `onSuccess`（watch）：生成 IPC 类型（渲染/预加载），启动 Electron（`spawn(getElectronPath(), ['--disable-gpu ', '.'])`）

4. 文档开发（可选）：`pnpm docs:dev`


### 开发依赖图（dev）

```mermaid
graph TB
  bridge_dev[@package/bridge#dev] --> main_dev[@electron/main#dev]
  wasm_dev[@package/wasm#dev] --> main_dev
  wasm_dev --> renderer_dev[@electron/renderer#dev]
  preload_dev[@electron/preload#dev]
  cli_dev[cli#dev]

  preload_dev -.-> main_dev
  cli_dev -.-> main_dev
  cli_dev -.-> renderer_dev
```

#### 含义说明（dev）

- 节点是任务名；箭头表示依赖顺序（上游完成后再运行下游）。
- `dev` 链中：主进程依赖 `bridge` 与 `wasm`；渲染进程依赖 `wasm`，保证相关产物先就绪。
- 虚线依赖：`@electron/preload#dev`、`cli#dev` 为并行辅助任务，产物可能在运行期被引用（例如预加载脚本、CLI 生成的工具）；它们不在 Turbo 的主依赖链上，但建议与主链同步执行以减少首次启动时的缺失。

## 构建流程（pnpm build）

1. 生产检查：`pnpm lint:pro`（`cross-env NODE_ENV=production`）
2. 运行构建管线：`turbo run build`
   - 任务拓扑：`^build`
   - 关键依赖：`@electron/main#build` 依赖 `@electron/renderer#build`
3. 主进程构建产出与打包：
   - 复制渲染产物到 `electron/main/dist/renderer`
   - 写入临时 `dist/package.json`（依赖重写为 workspace 本地路径）
   - 调用 `electron-builder --config=electron.config.js` 打包，输出到 `app/win-unpacked`
4. 代码加密（仅 `cjs`）：
   - `bytenode.compileFile` 编译主入口为 `.jsc`，生成 loader；`esm` 跳过加密

### 构建依赖图（build）

```mermaid
graph TB
  subgraph packages_build
    common_build[@package/common#build]
    workspace_build[@package/workspace#build]
    electron_pkg_build[@package/electron#build]
    preload_build[@electron/preload#build]
    renderer_build[@electron/renderer#build]
    bridge_build[@package/bridge#build]
    wasm_build[@package/wasm#build]

    common_build --> workspace_build
    electron_pkg_build --> preload_build
    wasm_build --> renderer_build
  end

  subgraph main_build_and_package
    main_build[@electron/main#build]
    copy_renderer[复制 renderer 产物到 main/dist/renderer]
    write_pkg_json[写入 dist/package.json（workspace 依赖重写）]
    bytenode_encrypt[bytenode 加密（仅 cjs），生成 .jsc 与 loader]
    electron_builder[调用 electron-builder 打包到 app/win-unpacked]

    bridge_build --> main_build
    wasm_build --> main_build
    renderer_build --> main_build
    preload_build --> main_build

    main_build --> copy_renderer --> write_pkg_json --> electron_builder
    main_build --> bytenode_encrypt
  end
```

#### 含义说明（build）

- 包级构建：通用工具与工作区工具先行；`@package/electron` 产物供预加载与主进程引用；`@electron/preload` 输出至 `../main/dist/src/preload`；`@package/wasm` 为渲染与主进程提供构建产物。
- 主进程构建：依赖 `bridge`/`wasm`/`renderer`/`preload` 的产物；随后复制渲染产物至 `main/dist/renderer` 并写入 `dist/package.json`（将 workspace 依赖重写为 `file:` 本地路径，确保打包期正确引用）。
- 版本与格式限制：当输出为 `cjs` 且 `electron-store` 版本清理后 ≥ `9.0.0`，构建会抛错以避免不兼容；`esm` 构建不受此限制。
- 加密与打包：`cjs` 模式执行 bytenode 加密主入口生成 `.jsc` 与 loader；最后调用 `electron-builder` 按 `electron.config.ts` 打包输出 `app/win-unpacked`。

## 运行时环境变量示例

```ts
// 主进程（由 tsup define 注入）
console.log(process.env.COMMIT_HASH)
console.log(process.env.VERSION)
console.log(process.env.OS)
console.log(process.env.ROOT_DIR)
```

说明：上述变量来源于 `@package/workspace/env` 的注入，便于在应用中读取构建信息与环境上下文。

## 构建产物目录结构示例（main/dist）

```
electron/main/dist/
├─ src/
│  ├─ main.js
│  └─ preload/              # 预加载产物（由 @electron/preload 输出）
│     └─ index.js
├─ renderer/                # 复制的渲染进程静态产物
│  ├─ index.html
│  └─ assets/
├─ package.json             # 打包期使用的临时包描述（依赖重写为 file:）
├─ main.jsc                 # cjs 加密后产物（bytenode）
└─ loader.js                # bytenode loader（自动加载 .jsc）
```


## 常见问题与修复指引

- `electron-store` 版本与 `cjs` 不兼容：当目标版本清理后 ≥ `9.0.0`，主进程 `cjs` 构建会抛错；调整为 `esm` 或降低版本。
- Mermaid 图不显示：确认插件已启用、主题中路由切换后执行渲染、代码块语言为 `mermaid`。
- 类型未生成：优先执行 `pnpm pretask`；开发模式下确保主进程处于 watch 状态以触发 `onSuccess` 类型生成。


## 文档命令

- `pnpm docs:build`：构建文档站点
- `pnpm docs:dev`：本地开发文档
- `pnpm docs:preview`：本地预览构建结果

## 其他说明

- 环境变量：
  - 通过 `@package/workspace/env` 注入到主进程构建的 `define`（`process.env.*`）
  - `ELECTRON_APP_UPDATE_URL` 用于开发模式的更新配置生成
- 类型生成：
  - 扫描主进程中 `ipc.response/on/send*` 的注册，生成渲染端/预加载端 `.d.ts`
  - Features 集合来自 `preloadInit(feature)` 的调用收集
