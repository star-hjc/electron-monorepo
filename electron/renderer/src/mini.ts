import { createApp } from 'vue'
import './style.css'
import App from './AppMini.vue'
import { greet } from '@package/common'

greet()

createApp(App).mount('#app')
