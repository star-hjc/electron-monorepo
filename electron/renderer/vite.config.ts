import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as dotenv from 'dotenv'
import path from 'path'
import workspace from '@package/workspace'

const env = (mode: string, envDir: string) => {
	const envPath = path.join(envDir, `.env`)
	const defaultEnvPath = path.join(envDir, `.env.${mode}`)
	const defaultEnv = dotenv.config({ path: defaultEnvPath }).parsed || {}
	const env = dotenv.config({ path: envPath }).parsed || {}
	return { ...defaultEnv, ...env }
}

export default defineConfig(({ mode }) => {
	const envDir = workspace.getRoot()
	const envPrefix = 'VITE_'
	const define = Object.entries(env(mode, envDir)).reduce((a: { [key: string]: string }, b) => {
		if (b[0].startsWith(envPrefix) || b[0] === 'NODE_ENV') {
			return a
		}
		a[`import.meta.env.${b[0]}`] = JSON.stringify(b[1])
		return a
	}, {})
	return {
		base: './',
		envPrefix,
		envDir,
		define,
		plugins: [vue()],
		resolve: {
			alias: {
				'@': `${path.resolve(__dirname, './src')}/`
			}
		},
		server: {
			host: '0.0.0.0',
			port: Number(process.env.VITE_PORT)
		},
		build: {
			rollupOptions: {
				input: {
					main: path.resolve(__dirname, './index.html'),
					mini: path.resolve(__dirname, './mini.html')
				}
			}
		}
	}
})
