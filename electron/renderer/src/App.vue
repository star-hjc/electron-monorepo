<template>
	<div>
		<a href="https://vite.dev" target="_blank">
			<img src="/vite.svg" class="logo" alt="Vite logo" />
		</a>
		<a href="https://vuejs.org/" target="_blank">
			<img src="./assets/vue.svg"
				class="logo vue"
				alt="Vue logo"
			/>
		</a>
		<div>当前版本: {{ version }}</div>
		<div>appUpdateStatus:{{ appUpdateStatus }}</div>
		<div>下载进度: {{ progress }}</div>
		<div>
			<button @click="checkUpdate">检查更新</button>&nbsp;&nbsp;
			<button @click="downloadUpdate">安装更新</button>
		</div>
		<div>count: {{ appStore.count }}</div>
	</div>
	<HelloWorld msg="Vite + Vue" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
// import { storeToRefs } from 'pinia'
import HelloWorld from './components/HelloWorld.vue'
import { useAppStore } from '@/store'
const appStore = useAppStore()
// const { count } = storeToRefs(appStore)
const appUpdateStatus = ref('')
const progress = ref(0)
const version = ref('')

ipc.version().then((value)=>{
	version.value = value
})

import { create_tags } from './logger'
const console = create_tags('vue')
console.log('app vue init')
ipc.ping(1,2,(a,b,c)=>{
	console.log('pong from main process',a,b,c);
},{})

const checkUpdate = () => {
	ipc.checkUpdate()
}

const downloadUpdate = () => {
	ipc.downloadUpdate()
}



ipc.on('appUpdate',({status, progress})=>{
	switch (status) {
		case 0:
			appUpdateStatus.value = `正在检查更新... ,status: ${status}`
			break;
		case 1:
			appUpdateStatus.value = `当前版本为最新版本, status: ${status}`
			break;
		case 2:
			appUpdateStatus.value = `有可用更新, status: ${status}`
			break;
		case 3:
			appUpdateStatus.value = `下载中...`
			progress.value = progress.percent || 0
			break;
		case 4:
			appUpdateStatus.value = `更新错误: ${status.error}`
			break;
		case 5:
			appUpdateStatus.value = `更新下载完成，准备安装, status: ${status}`
			if (confirm('是否现在安装更新？')) {
				ipc.quitAndInstall(false, false)
			}
			break;
		default:
			appUpdateStatus.value = `未知状态: ${status}`
			break;
	}
	console.log('status',status);
})

onMounted(()=>{
	setInterval(()=>{
		appStore.count++
	},1000)
	ipc.ping1('666','8888').then((result)=>{
		console.log('ping1 result:',result)
	}).catch((error)=>{
		console.error('ping1 error:',error)
	})
})
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
