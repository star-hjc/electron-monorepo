import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { create_tags } from './logger'
import { greet } from '@package/common'

greet()
const console = create_tags('RM')
console.log('main', import.meta.env)

createApp(App).mount('#app')
