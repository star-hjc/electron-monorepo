---
title: Pinia 跨窗口同步
---

# Pinia 跨窗口同步

- 包路径：`package/pinia`
- 模块名称：`@package/pinia`
- 导出(渲染进程)：`createWindowSyncStore(store, syncCallback, syncOptions?)`
- 选项类型：`SyncOptions`（白名单或黑名单）

## 模块

- `createWindowSyncStore(store, syncCallback, syncOptions?)`
  - `store: StoreDefinition` Pinia 的 `defineStore` 定义
  - `syncCallback(id, property, value)` 向主进程上报变更的回调
  - `syncOptions?: SyncOptions` 白/黑名单控制同步的字段

- `SyncOptions`
  - `whitelist: string[]` 仅同步列表内字段（与 `blacklist` 互斥）
  - `blacklist: string[]` 排除列表内字段同步（与 `whitelist` 互斥）

## 主进程对接

在主进程注册 `syncStore`，将变更广播到其他窗口：

```ts
import { ipc } from '@package/electron'

ipc.response('syncStore', (event, storeId: string, property: string, value: unknown) => {
  ipc.sendByNotIds('syncStore', storeId, property, value, event.frameId, [event.frameId])
})
```

## 渲染端使用

示例：在 `renderer` 中定义 `app` store，并通过 `createWindowSyncStore` 包装以启用跨窗口同步。

```ts
import { computed, ref } from 'vue'
import { defineStore, type StoreDefinition } from 'pinia'
import { createWindowSyncStore, type SyncOptions } from '@package/pinia'

const id = 'app'

const syncOptions: SyncOptions = {
  blacklist: ['name']
}

const appStore = defineStore(id, () => {
  const count = ref(0)
  const name = ref('app')
  const doubleCount = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, name, doubleCount, increment }
})

// 包装为具备同步能力的 store 实例工厂
export default createWindowSyncStore(appStore as StoreDefinition, ipc.syncStore, syncOptions)

// 接收其他窗口的同步事件
ipc.on('syncStore', (storeId: string, property: string, value: unknown, id: number) => {
  const prop = property as keyof ReturnType<typeof appStore>['$state']
  const storeValue = appStore().$state?.[prop]
  if (storeValue !== void 0 && storeValue !== value) {
    appStore()[prop] = value as never
  }
})
```

## 工作原理

- 通过 `Proxy` 拦截 store 实例的属性写入，在非黑名单且满足白名单条件时触发 `syncCallback`。
- 渲染端将本窗口变更上报主进程；主进程利用 `ipc.sendByNotIds` 广播变更到除当前窗口外的其他窗口。
- 各窗口在接收 `syncStore` 事件时对比当前值与广播值，若不同则更新，从而实现跨窗口状态一致性。
