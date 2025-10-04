export interface Ipc {
'ping': (id: number, value: number, callback: (name: string, time: number, num: number) => void) => void
'ping1': () => Promise<{ name: number; num: string; }>
'ping3': () => Promise<number>
'on': (event: 'cccc', callback: (...arg: unknown[]) => void) => void
'cccc': (callback: (name: string) => void) => void
'bbbb': (callback: (name: string) => void) => void
}
