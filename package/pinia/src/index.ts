import type { StoreDefinition } from 'pinia'
import type { SyncOptions } from '@/types'

export {SyncOptions}

function isInBlacklist(property:string, syncOptions?: SyncOptions){
	if (!syncOptions) return false
	const isBlacklisted = syncOptions?.blacklist?.includes(property)
	const isNotWhitelisted = syncOptions?.whitelist && !syncOptions.whitelist.includes(property)
	if (isBlacklisted || isNotWhitelisted) return true
	return false
}

export function createWindowSyncStore(store: StoreDefinition, syncCallback:(id:string,property:string,value:unknown)=> void, syncOptions?: SyncOptions) {
    return () => new Proxy(store(), {
		set(target, property, value) {
			if (typeof property === 'string' && !isInBlacklist(property, syncOptions)) {
                syncCallback(store.$id,property,value)
            }
			return Reflect.set(target, property, value)
		}
    })
}