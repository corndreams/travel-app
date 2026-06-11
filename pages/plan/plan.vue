<template>
	<view class="plan">
		<up-notice-bar text="基于AI的智能景点介绍与行程规划助手"></up-notice-bar>
		<view class="card search-card">
			<view class="section-title">规划你的行程</view>

			<!-- 简单/详细 切换 -->
			<up-subsection
				:list="modeList"
				:current="mode"
				activeColor="#FF6600"
				@change="changeMode"
				class="mode-tab"
			></up-subsection>

			<!-- 简单信息 -->
			<view class="form-item" @click="showCity = true">
				<u-input
					v-model="searchForm.city"
					placeholder="请输入目的地"
					readonly
					suffixIcon="arrow-right"
					border="none"
				>
					<template #prefix>
						<text class="label">目的地</text>
					</template>
				</u-input>
			</view>
			<view class="form-item">
				<u-input
					v-model="searchForm.days"
					placeholder="请输入行程天数"
					type="number"
					border="none"
				>
					<template #prefix>
						<text class="label">行程天数</text>
					</template>
					<template #suffix>
						<text class="unit">天</text>
					</template>
				</u-input>
			</view>
			<view class="form-item">
				<u-input
					v-model="searchForm.budget"
					placeholder="请输入预算"
					type="number"
					border="none"
				>
					<template #prefix>
						<text class="label">预算(元)</text>
					</template>
					<template #suffix>
						<text class="unit">元</text>
					</template>
				</u-input>
			</view>

			<!-- 详细信息 -->
			<block v-if="mode === 1">
				<view class="form-item" @click="showDate = true">
					<u-input
						v-model="searchForm.startDate"
						placeholder="请选择出发日期"
						readonly
						suffixIcon="arrow-right"
						border="none"
					>
						<template #prefix>
							<text class="label">出发日期</text>
						</template>
					</u-input>
				</view>

				<view class="form-item">
					<text class="label">出行人数</text>
					<up-number-box v-model="searchForm.people" :min="1" :max="20"></up-number-box>
				</view>

				<view class="form-item column">
					<text class="label">出行方式</text>
					<up-subsection
						:list="transportList"
						:current="transportIndex"
						activeColor="#FF6600"
						@change="changeTransport"
						class="sub-tab"
					></up-subsection>
				</view>

				<view class="form-item column">
					<text class="label">出行节奏</text>
					<up-subsection
						:list="paceList"
						:current="paceIndex"
						activeColor="#FF6600"
						@change="changePace"
						class="sub-tab"
					></up-subsection>
				</view>

				<view class="form-item" @click="showStay = true">
					<u-input
						v-model="searchForm.stay"
						placeholder="请选择住宿偏好"
						readonly
						suffixIcon="arrow-right"
						border="none"
					>
						<template #prefix>
							<text class="label">住宿偏好</text>
						</template>
					</u-input>
				</view>

				<view class="form-item column">
					<text class="label">旅行偏好<text class="tip">（可多选）</text></text>
					<view class="tags">
						<view
							class="tag-item"
							:class="{ active: searchForm.themes.includes(item) }"
							v-for="item in themeList"
							:key="item"
							@click="toggleTheme(item)"
						>
							{{ item }}
						</view>
					</view>
				</view>

				<view class="form-item column">
					<text class="label">其他需求</text>
					<up-textarea
						v-model="searchForm.remark"
						placeholder="例如：带老人小孩出行、想吃地道美食、避开人多景点等"
						count
						maxlength="200"
						height="120"
					></up-textarea>
				</view>
			</block>

			<button
				:loading="isLoading"
				type="primary"
				class="submit-btn"
				@click="handleSubmit"
			>
				生成行程
			</button>
		</view>

		<!-- 目的地选择 -->
		<up-picker
			:show="showCity"
			:columns="cityColumns"
			@confirm="onCityConfirm"
			@cancel="showCity = false"
			keyName="text"
		></up-picker>

		<!-- 住宿偏好选择 -->
		<up-picker
			:show="showStay"
			:columns="stayColumns"
			@confirm="onStayConfirm"
			@cancel="showStay = false"
			keyName="text"
		></up-picker>

		<!-- 出发日期选择 -->
		<up-datetime-picker
			:show="showDate"
			v-model="dateValue"
			mode="date"
			:minDate="minDate"
			@confirm="onDateConfirm"
			@cancel="showDate = false"
		></up-datetime-picker>
	</view>
</template>

<script setup>
	import { ref, reactive } from 'vue'

	const isLoading = ref(false)

	// 模式：0 简单 / 1 详细
	const modeList = ['简单', '详细']
	const mode = ref(0)
	const changeMode = (index) => mode.value = index

	const searchForm = reactive({
		city: '',
		days: '',
		budget: '',
		startDate: '',
		people: 1,
		transport: '飞机',
		pace: '适中',
		stay: '',
		themes: [],
		remark: ''
	})

	// 目的地
	const showCity = ref(false)
	const allCities = ['北京', '上海', '广州', '深圳', '成都', '西安', '重庆', '杭州', '南京', '武汉', '天津']
	const cityColumns = ref([allCities.map(city => ({ text: city, value: city }))])
	const onCityConfirm = ({ value }) => {
		searchForm.city = value[0].value
		showCity.value = false
	}

	// 出行方式
	const transportList = ['飞机', '高铁', '自驾', '其他']
	const transportIndex = ref(0)
	const changeTransport = (index) => {
		transportIndex.value = index
		searchForm.transport = transportList[index]
	}

	// 出行节奏
	const paceList = ['轻松', '适中', '紧凑']
	const paceIndex = ref(1)
	const changePace = (index) => {
		paceIndex.value = index
		searchForm.pace = paceList[index]
	}

	// 住宿偏好
	const showStay = ref(false)
	const stayList = ['经济型', '舒适型', '高档型', '豪华型', '民宿/特色']
	const stayColumns = ref([stayList.map(item => ({ text: item, value: item }))])
	const onStayConfirm = ({ value }) => {
		searchForm.stay = value[0].value
		showStay.value = false
	}

	// 出发日期
	const showDate = ref(false)
	const dateValue = ref(Date.now())
	const minDate = Date.now()
	const onDateConfirm = (e) => {
		const date = new Date(e.value)
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate()).padStart(2, '0')
		searchForm.startDate = `${y}-${m}-${d}`
		showDate.value = false
	}

	// 旅行偏好
	const themeList = ['自然风光', '历史文化', '美食探店', '休闲度假', '亲子游', '购物', '网红打卡', '摄影']
	const toggleTheme = (item) => {
		const index = searchForm.themes.indexOf(item)
		if (index > -1) {
			searchForm.themes.splice(index, 1)
		} else {
			searchForm.themes.push(item)
		}
	}

	const handleSubmit = () => {
		if (!searchForm.city) {
			uni.$u.toast('请输入目的地')
			return
		}
		if (!searchForm.days || searchForm.days <= 0 || searchForm.days > 30) {
			uni.$u.toast('请输入行程天数(1-30天)')
			return
		}
		if (!searchForm.budget || searchForm.budget <= 100) {
			uni.$u.toast('预算不能小于100元')
			return
		}

		isLoading.value = true
		// mode：0 简单 / 1 详细
		const query = `city=${searchForm.city}&days=${searchForm.days}&budget=${searchForm.budget}&mode=${mode.value}`
		uni.navigateTo({
			url: `/pages/trip/trip?${query}`,
			complete: () => {
				isLoading.value = false
			}
		})
	}
</script>

<style lang="scss" scoped>
	.plan {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 24rpx;
		box-sizing: border-box;

		.card {
			border-radius: 24rpx;
			background-color: #fff;
			padding: 34rpx;
			margin-top: 24rpx;
		}

		.section-title {
			font-size: 34rpx;
			font-weight: 700;
			color: #111;
		}

		.mode-tab {
			margin: 24rpx 0;
		}

		.form-item {
			background-color: #f5f5f5;
			border-radius: 12rpx;
			padding: 20rpx 24rpx;
			margin-top: 20rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			&.column {
				flex-direction: column;
				align-items: flex-start;

				.label {
					margin-bottom: 16rpx;
				}
			}

			.label {
				font-size: 28rpx;
				color: #333;
				white-space: nowrap;
				margin-right: 20rpx;

				.tip {
					font-size: 22rpx;
					color: #999;
				}
			}

			.unit {
				font-size: 28rpx;
				color: #999;
			}

			.sub-tab {
				width: 100%;
			}
		}

		.tags {
			display: flex;
			flex-wrap: wrap;
			width: 100%;

			.tag-item {
				font-size: 26rpx;
				color: #666;
				background-color: #fff;
				border: 1px solid #e5e5e5;
				border-radius: 50rpx;
				padding: 10rpx 28rpx;
				margin: 0 16rpx 16rpx 0;

				&.active {
					color: #fff;
					background-color: #FF6600;
					border-color: #FF6600;
				}
			}
		}

		.submit-btn {
			margin-top: 40rpx;
			background-color: #FF6600;
			color: #fff;
			border-radius: 50rpx;
			font-size: 30rpx;
		}
	}
</style>
