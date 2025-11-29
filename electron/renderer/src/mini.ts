import { createApp } from 'vue'
import store from './store'
import './style.css'
import App from './AppMini.vue'
import { greet } from '@package/common'

greet()

const app = createApp(App)
app.use(store)
app.mount('#app')
