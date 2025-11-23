/** 由 electron/main/tsup.config.ts  自动生成, 请勿手动修改 */

type EmitsOptions = {
	once?: boolean
	private?: boolean
}

export interface Ipc {
'ping': (id: number, value: number, callback: (name: string, time: number, num: number) => void, options?: EmitsOptions) => void
'ping1': (id: string, name: string) => Promise<{ name: string; num: number; id: string; }>
/** ⚠️ ['main'] 需求可用 'ping3'  */
'ping3': () => Promise<number>
'on': (event: 'cccc', callback: (...arg: unknown[]) => void) => void
'cccc': (callback: (name: string) => void, options?: EmitsOptions) => void
'bbbb': (callback: (name: string) => void, options?: EmitsOptions) => void
'send': (event: string, ...args: unknown[]) => void
}
