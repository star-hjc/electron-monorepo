import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import store from './store'
import { create_tags } from './logger'
import { greet } from '@package/common'
import init, { md5 } from '@package/wasm'

greet()
const console = create_tags('RM')
console.log('main', import.meta.env)

const app = createApp(App)
app.use(store)
app.mount('#app')

;(async() => {
	await init()
	console.log(md5('123456'))
})()

