const ENV = process.env.NODE_ENV
const CONFIG = process.env.NODE_CONFIG

export function getCurrentEnv() {
	return ENV
}

export const getEnvConfig = (() => {
	const _config = JSON.parse(CONFIG)
	return () => (_config)
})()
