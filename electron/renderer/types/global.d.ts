
import { Ipc } from './ipc'

declare global {
    interface Window {
        ipc: Ipc
    }

    const ipc: Ipc = window.ipc
}

export { }
