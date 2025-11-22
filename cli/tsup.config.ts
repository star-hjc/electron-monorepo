import { defineConfig } from 'tsup'

export default defineConfig({
	clean: true,
	entryPoints: ['src'],
	format: ['cjs'],
	outDir: 'bin',
	bundle: true,
	splitting: false,
	sourcemap: false,
	minify: true,
	external: [],
	noExternal: ['inquirer', 'chokidar'],
	dts: false
})
