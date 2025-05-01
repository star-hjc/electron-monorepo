import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('create_tags', {})

console.log('preload', '1231231')

