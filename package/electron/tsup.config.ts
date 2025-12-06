import { defineConfig } from 'tsup'

export default defineConfig({
	entryPoints: ['src', 'types'],
	format: ['esm', 'cjs'],
	dts: true,
	outDir: 'dist'
})
