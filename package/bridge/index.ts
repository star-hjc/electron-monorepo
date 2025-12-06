import { createRequire } from 'module'
import { BridgeModule } from './types'
const _require = createRequire(import.meta.url)
const nativeModule: BridgeModule = _require('./index.node')

export default nativeModule
