<template>
	<div class="MiniApp">
		<div>this is MiniApp page</div>
		{{ appStore.count }}
		<button @click="openDevTools">openDevTools</button>
	</div>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/store'
import { onMounted } from 'vue'
const appStore = useAppStore()
const openDevTools = () => ipc.openDevTools()

onMounted(() => {
})
</script>
<style lang="scss" scoped></style>
