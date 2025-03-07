import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { greet } from '@chat/common'

greet()

console.log('main', import.meta.env)

createApp(App).mount('#app')
