import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { greet } from '@chat/common'

greet()

createApp(App).mount('#app')
