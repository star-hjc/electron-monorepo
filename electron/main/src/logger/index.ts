import winston from 'winston'

// 创建一个 logger 实例
const logger = winston.createLogger({
	level: 'info', // 设置日志级别
	// format: winston.format.json(),
	transports: [
		// 输出到控制台
		new winston.transports.Console(),
		// 输出到文件
		new winston.transports.File({ filename: 'combined.log' }),

		new winston.transports.File({ filename: 'logs/application.log' })
	]
})

console.log = (...args) => {
	logger.info(args.join(' '))
}

console.error = (...args) => {
	logger.error(args.join(' '))
}

console.warn = (...args) => {
	logger.warn(args.join(' '))
}

console.debug = (...args) => {
	logger.debug(args.join(' '))
}

// const test = (args) => {
// 	const opt = args.splice(args.length - 1)

// }
