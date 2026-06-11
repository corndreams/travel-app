<template>
	<view class="content">
		<view class="topBox">
			<view class="setbox">
				<view class="set-left">
					<uni-icons type="caledar" size="30" color="#fff"></uni-icons>
					<view class="txt">
						签到
					</view>
				</view>
				<view class="set-right">
					<uni-icons type="gear" size="30" color="#fff"></uni-icons>
					<uni-icons type="chat" size="30" color="#fff"></uni-icons>
				</view>
			</view>
			<view class="users">
				<view class="u-top">
					<template v-if="!userInfo.nickName">
						<image 
						src="http://server.corndreams.top/uploads/1763521557882_1u3b2wx5gbg.jpeg" 
						mode="aspectFill">
						</image>
						<view class="tit" @click="setFun">
							注册 / 登录
						</view>
					</template>
					<template v-else>
						<image :src="userInfo.avatarUrl" mode="aspectFill"></image>
						<view class="tit">
							{{userInfo.nickName}}
						</view>
					</template>
				</view>
				<view class="u-bottom">
					<view class="u-item">
						<view class="num">12</view>
						<view class="u-tit">点赞</view>
					</view>
					<view class="u-item">
						<view class="num">12</view>
						<view class="u-tit">喜欢</view>
					</view>
					<view class="u-item">
						<view class="num">12</view>
						<view class="u-tit">浏览</view>
					</view>
					<view class="u-item">
						<view class="num">12</view>
						<view class="u-tit">收藏</view>
					</view>
				</view>
			</view>
		</view>
		<view class="listBox">
			<uni-list>
				<uni-list-item
			    v-for="(item, index) in menuList"
			    :key="index"
			    :show-extra-icon="true"
			    :extra-icon="item.extraIcon"
			    showArrow
			    :title="item.title"
			    clickable
				></uni-list-item>
			</uni-list>
		</view>
		<up-popup :show="show" mode="bottom" closeable @close="close" round="20">
			<view class="popup">
				<view class="title">
					获取您的头像、昵称
				</view>
				<view class="flex">
					<view class="label">
						获取用户头像
					</view>
					<button class="avatar-warpper" open-type="chooseAvatar" @chooseavatar="onChooseavatar">
						<image :src="userInfo.avatarUrl" class="avatar"></image>
					</button>
				</view>
				<view class="flex">
					<view class="label">
						获取用户昵称
					</view>
					<input type="nickname" @input="changeName" />
				</view>
				<button size="default" type="primary" @click="userSubmit">确认</button>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	import {ref,reactive} from 'vue'
	import {onLoad} from '@dcloudio/uni-app'
	import { login,getUserInfo } from '../../api/api'
	
	let userInfo = reactive({
		nickName:'',
		avatarUrl:''
	})
	
const menuList = [
  {
    title: '个人信息',
    extraIcon: {
      color: '#666666',
      size: '22',
      type: 'auth'
    }
  },
  {
    title: '我的购物车',
    extraIcon: {
      color: '#666666',
      size: '22',
      type: 'cart'
    }
  },
  {
    title: '用户反馈',
    extraIcon: {
      color: '#666666',
      size: '22',
      type: 'chatboxes'
    }
  },
  {
    title: '我的邮件',
    extraIcon: {
      color: '#666666',
      size: '22',
      type: 'email'
    }
  },
  {
    title: '个人信息', 
    extraIcon: {
      color: '#666666',
      size: '22',
      type: 'gift'
    }
  }
]
	
	const show = ref(false)
	
	onLoad(()=>{
		if(uni.getStorageSync('token') && !uni.getStorageSync('userInfo')){
			const {avatarUrl,nickName} = getUserInfo()
			userInfo.avatarUrl = avatarUrl
			userInfo.nickName = nickName
		}else if(uni.getStorageSync('token') && uni.getStorageSync('userInfo')){
			const {avatarUrl,nickName} = JSON.parse(uni.getStorageSync('userInfo'))
			userInfo.avatarUrl = avatarUrl
			userInfo.nickName = nickName
		}
	})
	
	const close =()=>{
		show.value=flase
	}
	
	const userSubmit = () =>{
		uni.setStorageSync('userInfo',JSON.stringify(userInfo))
		show.value=false
	}
	
	const onChooseavatar=(e)=>{
		userInfo.avatarUrl=e.detail.avatarUrl
	}
	
	const changeName=(e)=>{
		userInfo.nickName=e.detail.value
	}
	
		
	const setFun = ()=>{
		uni.showModal({
			title:'温馨提示',
			content:'请授权登录',
			success(res){
				if(res.confirm){
					// uni.getUserProfile({
					// 	desc:'获取用户头像和昵称',
					// 	success(res){
					// 		consle.log(res,'success')
					// 	}
					// 	fail(err){
					// 		console.log(err,'fail')
					// 	}
					// })
					uni.login({
						success: async (data) => {
							console.log(data)
							const {token} = await login(data.code)
							console.log(token,'token')
							uni.setStorageSync('token',token)
							const res = await getUserInfo()
							console.log(res)
							userInfo.avatarUrl = res.avatarUrl
							userInfo.nickName = res.nickName
							console.log(userInfo)
							show.value = true
							console.log('测试')
						}
					})
				}
			}
		})
	}
</script>

<style lang="scss">
	.content{
		height: 100vh;
		background-color: #f5f5f5;
		.topBox{
			width: 100%;
			position: relative;
			z-index: 1;
			overflow: hidden;
			padding: 40rpx 20rpx 40rpx;
			box-sizing: border-box;
		}
		.topBox::after{
			content: "";
			width: 140%;
			height: 200px;
			position: absolute;
			z-index: -1;
			top: 0%;
			left: -20%;
			background-color: #FF6600;
			border-radius: 0 0 50% 50%;
		}
		.setbox{
			display: flex;
			justify-content: space-between;
			align-items: center;
			.set-left{
				width: 18%;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.txt{
				color: #fff;
				font-size: 30rpx;
			}
		}
		.users{
			margin-top: 35rpx;
			padding: 30rpx;
			box-sizing: border-box;
			height: 280rpx;
			background-color: #fff;
			box-shadow: 1rpx 10rpx 20rpx #ececec;
			border-radius: 16rpx;
			.u-top{
				display: flex;
				justify-content: flex-start;
				align-items: center;
				margin-bottom: 30rpx;
				image{
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					margin-right: 20rpx;
				}
				.tit{
					font-size: 30rpx;
					font-weight: 700;
					color: #333;
				}
			}
			.u-bottom{
				display: flex;
				justify-content: space-around;
				align-items: center;
				.u-item{
					text-align: center;
					.u-tit{
						color: #757575;
						font-size: 26rpx;
						margin-top: 10rpx;
					}
					.num{
						color: #000;
						font-size: 33rpx;
						font-weight: 700;
					}
				}
			}
		}
		.popup{
			padding: 20rpx;
			border-radius: 20rpx 20rpx 0 0;
			.title{
				margin-bottom: 20rpx;
				font-size: 40rpx;
				text-align: center;
			}
			.flex{
				display: flex;
				justify-content: flex-start;
				align-items: center;
				border-bottom: 4rpx solid #f5f5f5;
				padding: 24rpx 0;
			}
			image{
				width: 70rpx;
				height: 70rpx;
			}
			.avatar-warpper{
				border: none;
				border-radius: 10rpx;
				width: 70rpx;
				height: 70rpx;
				margin-left: 20rpx;
				padding: 0;
			}
		}
		.listBox{
			height: 200rpx;
			margin: -10rpx auto 0;
			padding: 20rpx;
			box-sizing: border-box;
			border-radius: 12rpx;
		}
	}
</style>