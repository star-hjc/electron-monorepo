import { shell } from 'electron'

export function openFile(event:unknown, path:string) {
	shell.openPath(path)
	return 1
}

export function openCall(event:unknown, data:Map<string, unknown>) {
	const a = setInterval(() => {
		console.log(data.get('0'))
	}, 1000)
	setTimeout(() => {
		console.log('openCall', a)
		clearInterval(a)
		console.log(data)
	}, 10 * 1000)
	return 1
}

export default {
	res: {

	},
	on: {

	}
}
