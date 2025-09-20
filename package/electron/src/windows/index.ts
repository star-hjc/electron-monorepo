import { singleton } from '@package/common/singleton'

export type WindowsName = string
export type WindowId = number

class Windows {
	private ids:Map<WindowId, WindowsName> = new Map()
	private names:Map<WindowsName, Set<WindowId>> = new Map()

	add(id:WindowId, name:WindowsName) {
		this.ids.set(id, name)
		if (this.names.has(name)) {
			this.names.get(name).add(id)
			return
		}
		this.names.set(name, new Set<WindowId>().add(id))
	}

	get(id:WindowId): WindowsName | undefined {
		return this.ids.get(id)
	}

	remove(id:WindowId) {
		this.ids.delete(id)
	}

	clear() {
		this.ids.clear()
		this.names.clear()
	}

	getId(name:WindowsName): Set<WindowId> | undefined {
		return this.names.get(name)
	}
}
const Win = singleton(Windows)

export const Wins = new Win()

export default Win

