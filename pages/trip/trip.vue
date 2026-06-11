<template>
	<view class="trip">
		<up-navbar :title="formData.city + '行程规划'" :autoBack="true" leftText="返回"></up-navbar>

		<view class="page-content">
			<!-- 加载中 -->
			<view v-if="isLoading" class="loading-container">
				<up-loading-icon size="40" mode="spinner"></up-loading-icon>
				<text class="loading-text">正在生成旅游规划...</text>
			</view>

			<!-- 出错 -->
			<view v-else-if="errorMsg" class="error-container">
				<up-empty mode="data" :text="errorMsg"></up-empty>
				<button type="primary" class="retry-btn" @click="fetchData">重新生成</button>
			</view>

			<!-- 行程详情 -->
			<block v-else-if="tripData">
				<view class="card overview-card">
					<view class="trip-header">
						<text class="title">{{ tripData.city }} · {{ tripData.days }}天行程规划</text>
						<text class="trip-budget">预算 {{ tripData.totalBudget }} 元</text>
					</view>
				</view>

				<view class="card trip-collapse">
					<up-collapse :value="activeDays">
						<up-collapse-item
							v-for="day in tripData.dailyItinerary"
							:key="day.day"
							:title="`第${day.day}天`"
							:name="day.day"
						>
							<view class="day-schedule">
								<view class="schedule-section" v-for="p in periods" :key="p.key">
									<view class="schedule-label" :class="p.cls">{{ p.label }}</view>
									<view class="spot" v-if="day[p.key]">
										<view class="spot-top">
											<text class="spot-name">{{ day[p.key].spot }}</text>
											<text class="spot-duration">{{ day[p.key].duration }}</text>
										</view>
										<view class="spot-meta">
											<text class="meta-tag">门票：{{ day[p.key].ticket }}</text>
										</view>
										<view class="spot-desc">{{ day[p.key].description }}</view>
										<view class="spot-row">
											<text class="row-label">游玩推荐</text>
											<text class="row-text">{{ day[p.key].playContent }}</text>
										</view>
										<view class="spot-row">
											<text class="row-label">交通</text>
											<text class="row-text">{{ day[p.key].transportation }}</text>
										</view>
									</view>
								</view>
							</view>
						</up-collapse-item>
					</up-collapse>
				</view>

				<view class="card budget-card" v-if="budgetRows.length">
					<view class="section-header">预算详情</view>
					<view class="budget-table">
						<view class="budget-row" v-for="(row, index) in budgetRows" :key="index">
							<text class="budget-label">{{ row.label }}</text>
							<text class="budget-value">{{ row.value }} 元</text>
						</view>
						<view class="budget-row total">
							<text class="budget-label">合计</text>
							<text class="budget-value">{{ tripData.totalBudget }} 元</text>
						</view>
					</view>
				</view>

				<view class="card tips-card" v-if="tripData.tips && tripData.tips.length">
					<view class="section-header">温馨提示</view>
					<view class="info-list">
						<view class="info-item" v-for="(tip, index) in tripData.tips" :key="index">
							{{ index + 1 }}. {{ tip }}
						</view>
					</view>
				</view>

				<view class="card warning-card" v-if="tripData.warnings && tripData.warnings.length">
					<view class="section-header">注意事项</view>
					<view class="info-list">
						<view class="info-item" v-for="(warning, index) in tripData.warnings" :key="index">
							{{ index + 1 }}. {{ warning }}
						</view>
					</view>
				</view>
			</block>
		</view>

		<!-- 底部咨询 -->
		<view class="trip-footer" v-if="tripData && !isLoading">
			<button type="primary" class="chat-btn" @click="gotoChat">咨询AI</button>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app'
	import { ref, reactive, computed } from 'vue'
	import { travelRecommend } from '../../api/api.js'

	const isLoading = ref(true)
	const tripData = ref(null)
	const errorMsg = ref('')
	const activeDays = ref([])

	const formData = reactive({
		city: '',
		days: '',
		budget: '',
		mode: 0
	})

	const periods = [
		{ key: 'morning', label: '上午', cls: 'morning' },
		{ key: 'afternoon', label: '下午', cls: 'afternoon' },
		{ key: 'evening', label: '晚上', cls: 'evening' }
	]

	const budgetLabels = {
		accommodation: '住宿',
		tickets: '门票',
		food: '餐饮',
		transportation: '交通',
		other: '其他'
	}
	const budgetRows = computed(() => {
		const detail = tripData.value && tripData.value.budgetDetail
		if (!detail) return []
		return Object.keys(detail).map(key => ({
			label: budgetLabels[key] || key,
			value: detail[key]
		}))
	})

	const fetchData = () => {
		isLoading.value = true
		errorMsg.value = ''
		travelRecommend(formData).then(res => {
			if (res && res.success !== false) {
				tripData.value = res
				if (res.dailyItinerary) {
					activeDays.value = res.dailyItinerary.map(d => d.day)
				}
			} else {
				errorMsg.value = (res && res.msg) || '生成失败，请重试'
			}
			isLoading.value = false
		})
	}

	onLoad((opt) => {
		formData.city = opt.city || ''
		formData.days = opt.days || ''
		formData.budget = opt.budget || ''
		// 后端暂只支持简单规划(0)，携带mode以便后续区分详细(1)
		formData.mode = Number(opt.mode) || 0
		if (formData.city && formData.days && formData.budget) {
			fetchData()
		} else {
			isLoading.value = false
			errorMsg.value = '缺少行程参数'
		}
	})

	const gotoChat = () => {
		// chat 为 tabBar 页面，需用 switchTab 跳转
		uni.switchTab({
			url: '/pages/chat/chat'
		})
	}
</script>

<style lang="scss" scoped>
	
	.trip {
		min-height: 100vh;
		background-color: #f5f5f5;

		.page-content {
			margin-top: 48rpx;
			padding: 24rpx;
			box-sizing: border-box;
			padding-bottom: 140rpx;
		}

		.card {
			border-radius: 24rpx;
			background-color: #fff;
			padding: 30rpx;
			margin-bottom: 24rpx;
		}

		.loading-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding-top: 200rpx;

			.loading-text {
				margin-top: 24rpx;
				font-size: 28rpx;
				color: #999;
			}
		}

		.error-container {
			padding-top: 120rpx;

			.retry-btn {
				margin: 40rpx 60rpx 0;
				background-color: #FF6600;
				color: #fff;
				border-radius: 50rpx;
				font-size: 30rpx;
			}
		}

		.overview-card {
			.trip-header {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.title {
					font-size: 36rpx;
					font-weight: 700;
					color: #323232;
				}

				.trip-budget {
					font-size: 28rpx;
					color: #ee0a24;
					font-weight: 700;
				}
			}
		}

		.day-schedule {
			padding: 12rpx 0;

			.schedule-section {
				margin-bottom: 28rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.schedule-label {
					font-size: 26rpx;
					font-weight: 700;
					border-radius: 8rpx;
					padding: 6rpx 16rpx;
					display: inline-block;
					margin-bottom: 14rpx;
				}

				.morning {
					background-color: #fff7e6;
					color: #fa8c16;
				}

				.afternoon {
					background-color: #e6f7ff;
					color: #1890ff;
				}

				.evening {
					background-color: #f4ffe9;
					color: #52c41a;
				}

				.spot {
					background-color: #fafafa;
					border-radius: 12rpx;
					padding: 20rpx;

					.spot-top {
						display: flex;
						justify-content: space-between;
						align-items: center;

						.spot-name {
							font-size: 30rpx;
							font-weight: 700;
							color: #333;
						}

						.spot-duration {
							font-size: 24rpx;
							color: #999;
						}
					}

					.spot-meta {
						margin-top: 12rpx;

						.meta-tag {
							font-size: 22rpx;
							color: #fa8c16;
							background-color: #fff7e6;
							border-radius: 6rpx;
							padding: 4rpx 12rpx;
						}
					}

					.spot-desc {
						font-size: 26rpx;
						color: #666;
						line-height: 38rpx;
						margin-top: 14rpx;
					}

					.spot-row {
						display: flex;
						margin-top: 14rpx;

						.row-label {
							flex-shrink: 0;
							font-size: 24rpx;
							font-weight: 700;
							color: #333;
							margin-right: 12rpx;
						}

						.row-text {
							flex: 1;
							font-size: 24rpx;
							color: #999;
							line-height: 36rpx;
						}
					}
				}
			}
		}

		.section-header {
			font-size: 30rpx;
			font-weight: 700;
			color: #333;
			margin-bottom: 20rpx;
		}

		.budget-table {
			.budget-row {
				display: flex;
				justify-content: space-between;
				padding: 18rpx 0;
				border-bottom: 1px solid #f5f5f5;
				font-size: 28rpx;
				color: #666;

				&:last-child {
					border-bottom: none;
				}

				&.total {
					font-weight: 700;
					color: #333;

					.budget-value {
						color: #ee0a24;
					}
				}
			}
		}

		.info-list {
			.info-item {
				padding: 14rpx 0;
				font-size: 26rpx;
				color: #666;
				line-height: 40rpx;
				border-bottom: 1px solid #f5f5f5;

				&:last-child {
					border-bottom: none;
				}
			}
		}

		.trip-footer {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			padding: 16rpx 30rpx;
			padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
			background-color: #fff;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);

			.chat-btn {
				background-color: #FF6600;
				color: #fff;
				border-radius: 50rpx;
				font-size: 30rpx;
			}
		}
	}
</style>
