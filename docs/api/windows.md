---
title: 窗口管理（wins）
---

# 窗口管理（wins）

- 包路径：`package/electron/src/windows`
- 模块名称：`@package/electron` (窗口管理: `@package/electron/windows`)
- 主进程导出：`wins`（`Windows` 的单例封装）

## 模块

- `wins.add(id: number, name: string)` 记录窗口标识与名称
- `wins.get(id: number): string | undefined` 获取窗口名称
- `wins.remove(id: number)` 删除记录
- `wins.clear()` 清空所有记录
- `wins.getId(name: string): number[]` 根据名称获取所有窗口 id

## 使用示例

```ts
import { BrowserWindow } from 'electron'
import { wins } from '@package/electron'

function createMain() {
  const win = new BrowserWindow({ width: 900, height: 700 })
  wins.add(win.webContents.id, 'main')
  win.on('closed', () => wins.remove(win.webContents.id))
  return win
}

function notifyMain() {
  const ids = wins.getId('main')
  // 结合 ipc.sendByIds 发送消息到指定窗口
}
```

## 设计要点

- 通过 `Map` 维护 `id -> name` 与 `name -> ids` 的双向索引。
- 支持多窗口同名分组，便于批量操作目标窗口集合。
