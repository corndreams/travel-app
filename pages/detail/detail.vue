<template>
	<view>
		
	</view>
</template>

<script setup>
	import{onLoad} from '@dcloudio/uni-app'
	
	onLoad((opt)=>{
		console.log(JSON.parse(decodeURIComponent(opt.item)))
	})
</script>

<style>
	       
</style>
