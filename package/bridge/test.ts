import { BridgeModule } from './typings/index'
const nativeModule:BridgeModule = require('./libs/index.node')

console.log(nativeModule, 'test.ts::4行')

const result = nativeModule.sum(3, 5)
console.log(result, 'test.ts::7行')
