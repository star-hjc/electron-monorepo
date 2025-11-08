import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type { EmitsOptions } from '@/types/preload'

export type EmitsArgs = [...unknown[], (...args: unknown[]) => void]
type EmitsArgsDefault = [...EmitsArgs, EmitsOptions]

function emits(channel: string, ...args: EmitsArgsDefault) {
	const emitsOptions: EmitsOptions = {
		once: false,
		private: true,
		...args[args.length - 1] as EmitsOptions
	}
	const callback = args[args.length - 2] as (...callbackArgs: unknown[]) => void
	const options = args.slice(0, -2)
	const action = emitsOptions.private ? `${channel}-${crypto.randomUUID()}` : channel
	const handler = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args)

	if (emitsOptions.once) {
		ipcRenderer.once(action, handler)
	} else {
		ipcRenderer.on(action, handler)
	}

	ipcRenderer.send(channel, action, ...options)
	return [() => ipcRenderer.removeListener(action, handler)]
}

export const preloadInit = (feature?: string) => {
	ipcRenderer.invoke('initIpc', feature).then(({ request, emit }) => {
		const api = {
			feature,
			on: (name: string, callback: (...arg:unknown[]) => void) => ipcRenderer.on(name, (_event, ...arg) => callback(...arg)),
			once: (name: string, callback: (...arg:unknown[]) => void) => ipcRenderer.once(name, (_event, ...arg) => callback(...arg))
		}
		for (const name of request) {
			api[name] = (...args: unknown[]) => ipcRenderer.invoke(name, ...args)
		}

		for (const name of emit) {
			api[name] = (...args: EmitsArgsDefault) => emits(name, ...args)
		}

		contextBridge.exposeInMainWorld('ipc', api)
	})
}

