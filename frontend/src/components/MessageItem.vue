<script setup lang="ts">
import { ref } from "vue";
import type { Message } from "../types";
import MarkdownRenderer from "./MarkdownRenderer.vue";

const props = defineProps<{
  message: Message;
}>();

const copied = ref(false);

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};
</script>

<template>
  <div
    class="message"
    :class="[message.role, { streaming: message.isStreaming }]"
  >
    <div class="message-content">
      <MarkdownRenderer
        v-if="message.role === 'assistant'"
        :content="message.content"
      />
      <template v-else>{{ message.content }}</template>
      <span v-if="message.isStreaming" class="typing-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
    </div>
    <div class="message-footer">
      <span class="message-time">
        {{ new Date(message.timestamp).toLocaleTimeString() }}
      </span>
      <button
        v-if="message.role === 'assistant' && !message.isStreaming"
        class="copy-btn"
        @click="copyContent"
      >
        {{ copied ? "已复制" : "复制" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.user {
  align-self: flex-end;
  background: #e9ecef;
}

.message.assistant {
  align-self: flex-start;
  background: #fff;
  border: 1px solid #e5e5e5;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

.message-content :deep(.markdown-content) {
  white-space: normal;
}

.message.highlight {
  animation: highlight-flash 1s ease-out;
}

@keyframes highlight-flash {
  0% {
    background-color: #ffeb3b !important;
  }
  100% {
    background-color: inherit !important;
  }
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 12px;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.copy-btn {
  padding: 4px 10px;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.typing-indicator {
  display: inline-flex;
  gap: 3px;
  margin-left: 4px;
  vertical-align: middle;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.message.streaming .message-content {
  min-height: 20px;
}
</style>

<style>
.main-layout.dark .message.user {
  background: #2d2d2d;
}

.main-layout.dark .message.assistant {
  background: #252525;
  border-color: #333;
}

.main-layout.dark .copy-btn {
  color: #aaa;
  border-color: #444;
}

.main-layout.dark .copy-btn:hover {
  background: #333;
  border-color: #555;
}
</style>
