const levels = ['log', 'error', 'warn', 'debug']

const logFormat = (args:unknown[], tags:string|undefined = 'test') => {
	return [`[${tags}]:`, ...args].map(v => {
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

export const create_tags = (tags:string) => {
	return new Proxy(console, {
		get(target, prop, receiver) {
			if (levels.includes(String(prop))) {
				return (...args: unknown[]) => {
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
