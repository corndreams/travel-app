<template>
	<view class="content">
		<up-search placeholder="搜索🔍" bg-color="#e3e3e3" v-model="keyword"></up-search>
		<up-swiper
			v-if="bannerList.length"
			:list="bannerList"
			keyName="image"
			showTitle
			radius="8"
		    @change="change"
		    @click="click"
			class="banner"
		></up-swiper>
		<up-notice-bar text="text1"></up-notice-bar>
		<view class="list">
			<up-waterfall v-model="flowList" columns="2">
				<template v-slot:left="{leftList}">
					<view class="demo-warter" v-for="(item,index) in leftList" :key="index" @click="goDetail(item)">
						<up-lazy-load threshold="-450" border-radius="10" :image="item.img" :index="index"></up-lazy-load>
						<view class="demo-title">
							{{item.title}}
						</view>
						<view class="demo-price">
							{{item.times}}
						</view>
						<view class="demo-tag">
							<view class="demo-tag-owner">
								{{item.tag[0]}}
							</view>
							<view class="demo-tag-text">
								{{item.tag[1]}}
							</view>
						</view>
						<view class="isDot" v-if="item.isDot">
							{{item.isDot}}
						</view>
					</view>
				</template>
				<template v-slot:right="{rightList}">
					<view class="demo-warter" v-for="(item,index) in rightList" :key="index" @click="goDetail(item)">
						<up-lazy-load threshold="-450" border-radius="10" :image="item.img" :index="index"></up-lazy-load>
						<view class="demo-title">
							{{item.title}}
						</view>
						<view class="demo-price">
							{{item.times}}
						</view>
						<view class="demo-tag">
							<view class="demo-tag-owner">
								{{item.tag[0]}}
							</view>
							<view class="demo-tag-text">
								{{item.tag[1]}}
							</view>
						</view>
					</view>
				</template>
			</up-waterfall>
		</view>
		<view class="topClass" @click="toTop" v-if="showTopBtn">
			<up-icon name="arrow-upward" color="#fff" size="28"></up-icon>
		</view>
	</view>
</template>

<script setup>
	import { getBanner,getHomeList } from '../../api/api.js';
	import { onLoad ,onReachBottom,onPageScroll } from '@dcloudio/uni-app'
	import { ref,reactive } from 'vue';  
	  
	const keyword = ref('');  
	  
	const bannerList = ref([]);  
	const flowList = ref([])
	const showTopBtn =ref(false)
	

	
	onLoad(()=>{
		getBanner().then(res =>{
			bannerList.value = res.bannerList
			console.log(bannerList.value)
		})
		getHomeList().then(res=>{
			console.log(res)
			flowList.value = res
		})

	})
	
	onReachBottom(()=>{
		setTimeout(()=>{
			addRandomData()
		},1000)
	})
	
	const goDetail = (item)=>{
		const can =JSON.stringify(item)
		uni.navigateTo({
			url:`/pages/detail/detail?item=${encodeURIComponent(can)}`
		})
	}
	
	const addRandomData =()=>{
		for (let i=0;i<10;i++){
			let index =uni.$u.random(0,flowList.value.length-1)
			let item =JSON.parse(JSON.stringify((flowList.value[index])))
			item.id = uni.$u.guid()
			flowList.value.push(item)
		}
	}
	
	onPageScroll((e)=>{
		if(e.scrollTop>600){
			showTopBtn.value=true
			consle.log(showTopBtn.value)
		}else{
			showTopBtn.value=false
		}
	})
	
	const toTop=()=>{
		uni.pageScrollTo({
			scrollTop:0,
			duration:300
		})
	}
</script>

<style>
	page{
		background-color: #f5f5f5;
	}
</style>
<style lang="scss" scoped>
.content{
	padding: 20rpx 20rpx;
}
.banner{
	margin: 16rpx 0;
}
.list{
	margin: 20rpx 0;
	.demo-warter{
		margin: 10rpx 10rpx 10rpx 0;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 16rpx;
		position: relative;
		
		.demo-title{
			font-size: 30rpx;
			margin-top: 10rpx;
			color: #303133;
			color: #FF6600;
		}
		.demo-price{
			font-size: 24rpx;
			color: #777;
			margin-top: 10rpx;
		}
		.demo-tag{
			display: flex;
			margin-top: 10rpx;
			.demo-tag-owner{
				border: 1px solid rgb(252,163,129);
				color: #ffaa00;
				font-size: 20rpx;
				display: flex;
				align-items: center;
				padding: 2rpx 14rpx;
				border-radius: 50rpx;
			}
			.demo-tag-text{
				border: 1px solid #00aaff;
				color: #00aaff;
				font-size: 20rpx;
				margin-left: 20rpx;
				display: flex;
				align-items: center;
				padding: 2rpx 14rpx;
				border-radius: 50rpx;
			}
		}
		.isDot{
			position: absolute;
			top: 20rpx;
			right: 20rpx;
			font-size: 24rpx;
			color: #fff;
			line-height: 32rpx;
			background-color: #ff0000;
			text-align: center;
			border-radius: 10rpx;
			padding: 4rpx 10rpx;
		}
	}

}

.topClass{
	position: fixed;
	bottom: 120rpx;
	right: 30rpx;
	background-color: rgba(0,0,0,0.5);
	padding: 20rpx;
	width: 44rpx;
	height: 44rpx;
	border-radius: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
