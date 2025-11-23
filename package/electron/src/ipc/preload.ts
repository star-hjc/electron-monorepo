import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type { EmitsOptions } from '@/types/preload'

export type EmitsArgs = [...unknown[], (...args: unknown[]) => void]
type EmitsArgsDefault = [...EmitsArgs, EmitsOptions]

const DEFAULT_EMITS_OPTIONS: EmitsOptions = {
	once: false,
	private: true
}

function emits(channel: string, ...args: EmitsArgsDefault) {
	let emitsOptions = DEFAULT_EMITS_OPTIONS
	const last = args[args.length - 1]
	if (typeof (last) !== 'function') {
		emitsOptions = { ...emitsOptions, ...last as EmitsOptions }
		args.pop()
	}
	const callback = args[args.length - 1] as (...callbackArgs: unknown[]) => void
	const options = args.slice(0, -1)
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
			send: ipcRenderer.send,
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

