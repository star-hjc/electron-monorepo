import winston from 'winston'

const mainProcessLogFileName = 'main'

const levels = { log: 'info', error: 'error', warn: 'warn', debug: 'debug' }

const formatIsCombine = [
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
	winston.format.printf(({ timestamp, level, message }) => `${timestamp} (${level}) ${message}`)
]

export function logger(filename: string | undefined = mainProcessLogFileName) {
	const log = winston.createLogger({
		level: 'debug',
		format: winston.format.combine(...formatIsCombine),
		transports: [
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.colorize(),
					...formatIsCombine
				)
			}),
			new winston.transports.File({
				filename: `${filename}.log`,
				dirname: `../resources/logs`,
				maxFiles: 5,
				maxsize: 20 * 1024 * 1024,
				tailable: true
			})
		]
	})
	if (filename === mainProcessLogFileName) {
		for (const [key, value] of Object.entries(levels)) {
			// eslint-disable-next-line no-console
			console[key] = (...args) => {
				log[value](logFormat(args))
			}
		}
	}
	return log
}

function logFormat(args: unknown[], tags:string|undefined = 'test') {
	return [`[${tags}]`, ...args].map(v => {
		if (typeof v === 'string') {
			return v.replace(/\n/g, '\t\t')
		} else if (v instanceof Error) {
			return `Error: ${v.message}\n Stack: ${v.stack}`
		} else if (typeof v === 'object' || v === void 0) {
			return JSON.stringify(v, (key, value) => {
				if (key === 'self') return '[Circular]'
				return value
			})
		}
		return v.toString()
	}).join('  ')
}

export function create_tags(tags:string) {
	const log = logger()
	return new Proxy(log, {
		get(target, prop, receiver) {
			const logLevels = Object.values(levels)
			if (logLevels.includes(String(prop))) {
				return (...args) => {
					return Reflect.get(target, prop, receiver)(logFormat(args, tags))
				}
			}
			return Reflect.get(target, prop, receiver)
		}
	})
}

// function sington(className) {
// 	let ins = null
// 	const proxy = new Proxy(className, {
// 		construct(target, args) {
// 			if (!ins) {
// 				ins = Reflect.construct(target, args)
// 			}
// 			return ins
// 		}
// 	})
// 	proxy.prototype.constructor = proxy
// 	return proxy
// }
