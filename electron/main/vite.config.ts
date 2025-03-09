import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'
import path from 'path'

export default defineConfig({
	envDir: path.join(__dirname, '../../'),
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			external: ['electron', '@chat/bridge', /^electron\/.+/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
			input: {
				main: path.join(__dirname, './src/main.ts')
			},
			output: {
				entryFileNames: '[name].js',
				format: 'cjs'
			}
		},
		reportCompressedSize: false,
		minify: true
	}
})
