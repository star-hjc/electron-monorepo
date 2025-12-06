
import { defineConfig } from 'tsup'
// import workspaceEnv from '@package/workspace/env'

export default defineConfig(() => {
	return {
		entry: ['src'],
		format: ['cjs'],
		outDir: '../main/dist/src/preload',
		clean: true,
		external: ['electron'],
		noExternal: ['@package/electron/preload']
	}
})
