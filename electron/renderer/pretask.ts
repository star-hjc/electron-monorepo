import env from '@package/workspace/env'
import { name } from './package.json'

env.updateFile({ 'ELECTRON_RENDERER': name })

