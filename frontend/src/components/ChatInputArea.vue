<script setup lang="ts">
import { ref } from "vue";
import { useChatStore } from "../stores/chat";

const chatStore = useChatStore();

const messageInput = ref("");

const handleSend = () => {
  const content = messageInput.value.trim();
  if (!content || chatStore.isLoading) return;

  chatStore.sendMessage(content);
  messageInput.value = "";
};

const handleStop = () => {
  chatStore.stopGenerating();
};
</script>

<template>
  <div class="chat-input-area">
    <button
      v-if="chatStore.isGenerating"
      class="stop-btn"
      @click="handleStop"
    >
      停止生成
    </button>
    <template v-else>
      <input
        v-model="messageInput"
        type="text"
        class="chat-input"
        placeholder="输入消息..."
        :disabled="chatStore.isLoading"
        @keyup.enter="handleSend"
      />
      <button
        class="send-btn"
        :disabled="chatStore.isLoading || !messageInput.trim()"
        @click="handleSend"
      >
        发送
      </button>
    </template>
  </div>
</template>

<style scoped>
.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 12px;
  background: #f8f9fa;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  color: #000;
}

.chat-input:focus {
  border-color: #adb5bd;
}

.send-btn {
  padding: 12px 24px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #555;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-btn {
  padding: 12px 24px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.stop-btn:hover {
  background: #c82333;
}
</style>

<style>
.main-layout.dark .chat-input-area {
  border-top-color: #333;
  background: #1e1e1e;
}

.main-layout.dark .chat-input {
  background: #252525;
  color: #fff;
  border-color: #333;
}

.main-layout.dark .chat-input:focus {
  border-color: #555;
}

.main-layout.dark .send-btn {
  background: #fff;
  color: #000;
}

.main-layout.dark .send-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.main-layout.dark .stop-btn {
  background: #bd2130;
}

.main-layout.dark .stop-btn:hover {
  background: #a71d2a;
}
</style>
