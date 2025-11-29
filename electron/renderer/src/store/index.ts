import { createPinia } from 'pinia'
import useAppStore from './modules/app'


export {
	useAppStore
}

const pinia = createPinia()

export default pinia

