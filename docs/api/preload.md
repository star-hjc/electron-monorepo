---
title: 预加载（preload）
---

# 预加载（preload）

- 包路径：`electron/preload/src`
- 模块名称：`@package/electron/preload`
- 导出：`preloadInit(feature?: string)` 暴露 `window.ipc` 与全局 `ipc`

## 能力

- 安全暴露 API：通过 `contextBridge.exposeInMainWorld('ipc', api)` 暴露受控接口
- 动态方法注入：根据主进程注册的频道注入 `ipc[channel]` 请求与事件方法
- 特性隔离：`preloadInit(feature)` 仅注入匹配的频道与公共频道

## 使用

```ts
import { preloadInit } from '@package/electron/preload'
preloadInit('chat')

// renderer
const user = await ipc.getUser('id-001')
const [off] = ipc.notify('Hello', { once: true, private: true }, (ack) => {})
off()
```

## 注意

- 在渲染端已声明全局别名：可直接使用 `ipc.xxx` 与 `ipc.feature`
- 事件型方法返回 `[off]`，请在组件卸载时清理避免内存泄漏

