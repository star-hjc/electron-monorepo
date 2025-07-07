import { create_tags } from '@logger'
import { singleton } from '@package/common/singleton'

const log = create_tags('WindowPool')

export type WindowsName = string
export type WindowId = number

class WindowPool {
	private ids:Map<WindowId, WindowsName> = new Map()

	add(id:WindowId, name:WindowsName) {
		this.ids.set(id, name)
	}

	get(id:WindowId): WindowsName | undefined {
		return this.ids.get(id)
	}

	remove(id:WindowId) {
		this.ids.delete(id)
	}

	clear() {
		this.ids.clear()
	}

	getId(name:WindowsName): WindowId | undefined {
		for (const [id, windowName] of this.ids.entries()) {
			if (windowName === name) {
				return id
			}
		}
		log.error(`WindowPool with name "${name}" not found in pool.`)
		return
	}
}
const Win = singleton(WindowPool)

export const windowPool = new Win()

export default singleton(WindowPool)

