import { defineConfig } from 'tsup'
import path from 'path'
// import fs from 'fs'

export default defineConfig({
	clean: true,
	entryPoints: ['./index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
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
		// {
		//   name: 'copy-node-file',
		//   setup(build) {
		//     build.onEnd(async () => {
		//       const source = path.resolve('./libs/index.node');
		//       const target = path.resolve('dist/index.node');
		//       fs.copyFileSync(source, target);
		//     });
		//   } ,
		// }
	]
})
