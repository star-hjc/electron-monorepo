import { BridgeModule } from './types'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativeModule:BridgeModule = require('./libs/index.node')
export default nativeModule
