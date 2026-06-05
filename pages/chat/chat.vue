<template>
	<view class="">
<!-- 			<up-navbar
				title="AI旅游助手"
				left-text="返回"
				:autoBack="true"
			>
			</up-navbar> -->
<!-- 		    <div class="chat-container">
		      <div v-if="messages.length === 0" class="chat-empty">
		        <van-empty description="开始和AI旅游助手对话吧！" />
		        <div class="quick-questions">
		          <div class="quick-title">常见问题</div>
		          <van-tag v-for="question in quickQuestions" :key="question" class="quick-tag" mark size="large"
		            @click="tagClick(question)">{{ question }}</van-tag>
		        </div>
		      </div>
		      <div v-else class="message-list">
		        <ChatBubble v-for="message in messages" :key="message.id" :message="message" />
		        <div class="streaming-indicator" v-if="isStreaming">
		          <van-loading type="spinner" size="20" />
		          <span>AI正在思考中...</span>
		        </div>
		      </div>
		    </div>
		    <div class="chat-input-area">
		      <van-field v-model="inputMessage" placeholder="请输入您的问题..." :disabled="isStreaming" clearable
		        @keyup.enter="sendMessage">
		        <template #button>
		          <van-button type="primary" @click="sendMessage" :disabled="isStreaming">发送</van-button>
		        </template>
		      </van-field>
		    </div> -->
	</view>
</template>

<script setup>
	
</script>

<style>
	       
</style>
