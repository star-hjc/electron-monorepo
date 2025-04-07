export function singleton<T extends new(...args: never[]) => object>(ClassName: T): T {
	let instance: InstanceType<T>
	const proxy = new Proxy(ClassName, {
		construct(Target: T, args: ConstructorParameters<T>): InstanceType<T> {
			if (!instance) {
				instance = new Target(...args) as InstanceType<T>
			}
			return instance
		}
	})
	proxy.prototype.constructor = proxy
	return proxy
}
