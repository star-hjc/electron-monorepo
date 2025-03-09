import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
	const envDir = path.resolve(__dirname, '../../')
	const env = loadEnv(mode, envDir)
	return {
		envDir,
		plugins: [vue()],
		resolve: {
			alias: {
				'@': `${path.resolve(__dirname, './src')}/`
			}
		},
		server: {
			host: '0.0.0.0',
			port: Number(env.VITE_PORT)
		}
	}
})
