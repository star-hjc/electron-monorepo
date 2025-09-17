import { defineConfig } from 'tsup'
import path from 'path'

export default defineConfig(({ env }) => {
	const NODE_ENV = env?.NODE_ENV || 'development'
	return {
		clean: true,
		entryPoints: ['./index.ts'],
		format: ['esm', 'cjs'],
		dts: NODE_ENV !== 'production',
		outDir: 'dist',
		esbuildPlugins: [
			{
				name: 'node-native-module',
				setup(build) {
					build.onResolve({ filter: /\.node$/ }, (args) => ({
						path: path.join(args.resolveDir, args.path),
						external: true // 标记为外部依赖
					}))
				}
			}
		]
	}
})
