<template>
	<view class="chat-page">
		<scroll-view
			class="chat-container"
			scroll-y
			:scroll-top="scrollTop"
			:scroll-with-animation="true"
		>
			<!-- 空状态 + 常见问题 -->
			<view v-if="messages.length === 0" class="chat-empty">
				<up-empty mode="message" text="开始和AI旅游助手对话吧！"></up-empty>
				<view class="quick-questions">
					<view class="quick-title">常见问题</view>
					<view class="quick-tags">
						<view
							class="quick-tag"
							v-for="question in quickQuestions"
							:key="question"
							@click="tagClick(question)"
						>
							{{ question }}
						</view>
					</view>
				</view>
			</view>

			<!-- 消息列表 -->
			<view v-else class="message-list">
				<view
					class="bubble-row"
					:class="message.role"
					v-for="message in messages"
					:key="message.id"
				>
					<view class="avatar" v-if="message.role === 'ai'">AI</view>
					<view class="bubble">{{ message.content || '...' }}</view>
				</view>
				<view class="streaming-indicator" v-if="isStreaming">
					<up-loading-icon size="18" mode="spinner"></up-loading-icon>
					<text class="thinking-text">AI正在思考中...</text>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区 -->
		<view class="chat-input-area">
			<u-input
				v-model="inputMessage"
				placeholder="请输入您的问题..."
				:disabled="isStreaming"
				clearable
				border="surround"
				shape="circle"
				@confirm="sendMessage"
			>
				<template #suffix>
					<button
						class="send-btn"
						:class="{ disabled: isStreaming }"
						@click="sendMessage"
					>
						发送
					</button>
				</template>
			</u-input>
		</view>
	</view>
</template>

<script setup>
	import { ref, nextTick } from 'vue'
	import { fetchStream } from '../../api/api.js'

	const messages = ref([])
	const inputMessage = ref('')
	const isStreaming = ref(false)
	const scrollTop = ref(0)

	const quickQuestions = ref([
		'北京有哪些必去的景点？',
		'上海美食推荐',
		'成都三日游攻略',
		'如何购买旅行保险？'
	])

	// 滚动到底部
	const scrollToBottom = () => {
		nextTick(() => {
			scrollTop.value = 1000000 + Math.floor(messages.value.length)
		})
	}

	const tagClick = (question) => {
		inputMessage.value = question
		sendMessage()
	}

	const addUserMessage = (content) => {
		messages.value.push({
			id: Date.now(),
			role: 'user',
			content
		})
	}

	const sendMessage = () => {
		const msg = inputMessage.value.trim()
		if (!msg || isStreaming.value) {
			return
		}
		addUserMessage(msg)
		inputMessage.value = ''
		scrollToBottom()
		fetchResponse(msg)
	}

	const fetchResponse = (msg) => {
		isStreaming.value = true
		messages.value.push({
			id: Date.now() + 1,
			role: 'ai',
			content: ''
		})
		scrollToBottom()

		let fullResponse = ''

		fetchStream(
			'/chat',
			{ message: msg },
			(chunk) => {
				// 实时累加内容
				fullResponse += chunk
				const lastMessage = messages.value[messages.value.length - 1]
				if (lastMessage && lastMessage.role === 'ai') {
					lastMessage.content = fullResponse
				}
				scrollToBottom()
			},
			() => {
				// 流结束，过滤掉 think 标签内容与多余换行
				isStreaming.value = false
				const lastMessage = messages.value[messages.value.length - 1]
				if (lastMessage && lastMessage.role === 'ai') {
					lastMessage.content = lastMessage.content
						.replace(/[\s\S]*?<\/think>/g, '')
						.replace(/\n{3,}/g, '\n\n')
				}
				scrollToBottom()
			},
			(errorMsg) => {
				isStreaming.value = false
				const lastMessage = messages.value[messages.value.length - 1]
				if (lastMessage && lastMessage.role === 'ai') {
					lastMessage.content = errorMsg
				}
				uni.showToast({ title: '请求失败，请稍后重试', icon: 'none' })
			}
		)
	}
</script>

<style lang="scss" scoped>
	.chat-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
		box-sizing: border-box;

		.chat-container {
			flex: 1;
			overflow: hidden;
			padding: 24rpx;
			box-sizing: border-box;
			padding-bottom: 140rpx;
		}

		.chat-empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 120rpx;

			.quick-questions {
				margin-top: 40rpx;
				width: 100%;

				.quick-title {
					font-size: 30rpx;
					font-weight: 700;
					color: #333;
					text-align: center;
					margin-bottom: 24rpx;
				}

				.quick-tags {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;

					.quick-tag {
						font-size: 26rpx;
						color: #FF6600;
						background-color: #fff;
						border: 1px solid #ffd6b3;
						border-radius: 50rpx;
						padding: 14rpx 28rpx;
						margin: 0 14rpx 20rpx;
					}
				}
			}
		}

		.message-list {
			.bubble-row {
				display: flex;
				margin-bottom: 28rpx;

				.bubble {
					max-width: 70%;
					font-size: 28rpx;
					line-height: 42rpx;
					padding: 18rpx 24rpx;
					border-radius: 16rpx;
					word-break: break-all;
					white-space: pre-wrap;
				}

				&.user {
					justify-content: flex-end;

					.bubble {
						background-color: #FF6600;
						color: #fff;
						border-top-right-radius: 4rpx;
					}
				}

				&.ai {
					justify-content: flex-start;

					.avatar {
						width: 64rpx;
						height: 64rpx;
						flex-shrink: 0;
						margin-right: 16rpx;
						border-radius: 50%;
						background-color: #FF6600;
						color: #fff;
						font-size: 24rpx;
						font-weight: 700;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.bubble {
						background-color: #fff;
						color: #333;
						border-top-left-radius: 4rpx;
					}
				}
			}

			.streaming-indicator {
				display: flex;
				align-items: center;
				padding-left: 80rpx;

				.thinking-text {
					font-size: 26rpx;
					color: #999;
					margin-left: 12rpx;
				}
			}
		}

		.chat-input-area {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			padding: 16rpx 24rpx;
			padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
			background-color: #fff;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);

			.send-btn {
				margin: 0;
				font-size: 26rpx;
				color: #fff;
				background-color: #FF6600;
				border-radius: 50rpx;
				padding: 0 28rpx;
				line-height: 60rpx;
				height: 60rpx;

				&.disabled {
					background-color: #ffc299;
				}

				&::after {
					border: none;
				}
			}
		}
	}
</style>
