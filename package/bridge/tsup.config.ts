import { defineConfig } from 'tsup'

export default defineConfig(({ env }) => {
	const NODE_ENV = env?.NODE_ENV || 'development'
	const outDir = 'dist'
	const libDir = 'libs'
	return {
		outDir,
		clean: true,
		shims: true,
		entryPoints: ['./index.ts'],
		publicDir: libDir,
		format: ['esm', 'cjs'],
		dts: NODE_ENV !== 'production'
	}
})
