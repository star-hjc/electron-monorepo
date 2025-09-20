
import { Ipc } from './ipc'

// interface OtherApi {
//     name:string
// }

declare global {
    interface Window {
        ipc:Ipc
    }
    const ipc: Ipc = window.ipc
}

export { }

