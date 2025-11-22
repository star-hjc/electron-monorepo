import { defineConfig } from 'tsup'

export default defineConfig({
	entryPoints: ['src'],
	format: ['esm', 'cjs'],
	dts: true,
	outDir: 'dist',
	external: ['@package/workspace', 'dotenv', 'fs', 'node:fs']
	// clean: true
})
