/** 由 electron/main/tsup.config.ts  自动生成, 请勿手动修改 */

type EmitsOptions = {
	once?: boolean
	private?: boolean
}

export interface Ipc {
'version': () => Promise<string>
'openDevTools': () => Promise<void>
'ping': (id: number, value: number, callback: (name: string, time: number, num: number) => void, options?: EmitsOptions) => void
'ping1': (id: string, name: string) => Promise<{ name: string; num: number; id: string; }>
/** ⚠️ ['main'] 需求可用 'ping3'  */
'ping3': () => Promise<number>
on(event: 'cccc', callback: (...arg) => void): void
'cccc': (callback: (name: string) => void, options?: EmitsOptions) => void
'bbbb': (callback: (name: string) => void, options?: EmitsOptions) => void
'syncStore': (storeId: string, property: string, value: unknown) => Promise<void>
on(event: 'syncStore', callback: (...arg) => void): void
'checkUpdate': () => Promise<Promise<import("D:/code/electron/ai-chat-ultral-pc/.virtual/electron-updater@6.6.2/node_modules/electron-updater/out/types").UpdateCheckResult>>
'downloadUpdate': () => Promise<void>
'quitAndInstall': (isSilent: boolean, isForceRunAfter: boolean) => Promise<void>
on(event: 'appUpdate', callback: (...arg) => void): void
on(event: 'appUpdate', callback: (...arg) => void): void
on(event: 'appUpdate', callback: (...arg) => void): void
on(event: 'appUpdate', callback: (...arg) => void): void
on(event: 'appUpdate', callback: (...arg) => void): void
on(event: 'appUpdate', callback: (...arg) => void): void
'send': (event: string, ...args) => void
}
