import { computed, ref } from 'vue'
import { defineStore, type StoreDefinition } from 'pinia'
import type { SyncOptions } from '@package/pinia'
import { createWindowSyncStore } from '@package/pinia'

const id = 'app'

const syncOptions: SyncOptions = {
	blacklist: ['name']
}

export { id, syncOptions }

const appStore = defineStore(id, () => {
	const count = ref(0)
	const name = ref('app')
	const doubleCount = computed(() => count.value * 2)
	function increment() {
		count.value++
	}
	return { count, name, doubleCount, increment }
})

ipc.on('syncStore', (storeId:string, property:string, value:unknown, id:number) => {
	// eslint-disable-next-line no-console
	console.log('syncStore', storeId, property, value, 'win:', id)
	const prop = property as keyof ReturnType<typeof appStore> ['$state']
	const storeValue = appStore().$state?.[prop]
	if (storeValue !== void 0 && storeValue !== value) {
		appStore()[prop] = value as never
	}
})

export default createWindowSyncStore(appStore as StoreDefinition, ipc.syncStore, syncOptions)

