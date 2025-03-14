import { defineConfig } from 'tsup'

export default defineConfig({
	clean: true,
	entryPoints: ['src'],
	format: ['cjs'],
	outDir: 'dist'
})
