import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { config as loadEnv } from 'dotenv'
import path from 'path'

const env = (mode:string, envDir:string) => {
	const envPath = path.join(envDir, `.env`)
	const defaultEnvPath = path.join(envDir, `.env.${mode}`)
	const defaultEnv = loadEnv({ path: defaultEnvPath }).parsed || {}
	const env = loadEnv({ path: envPath }).parsed || {}
	return { ...defaultEnv, ...env }
}

export default defineConfig(({ mode }) => {
	const envDir = path.resolve(__dirname, '../../')
	const envPrefix = 'VITE_'
	const define = Object.entries(env(mode, envDir)).reduce((a: { [key: string]: string }, b) => {
		if (b[0].startsWith(envPrefix) || b[0] === 'NODE_ENV') {
			return a
		}
		a[`import.meta.env.${b[0]}`] = b[1]
		return a
	}, {})
	return {
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
			port: Number('8888')
		}
	}
})
