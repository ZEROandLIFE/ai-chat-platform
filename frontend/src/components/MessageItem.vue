<script setup lang="ts">
  import type { Message } from "../types";

  defineProps<{
    message: Message;
  }>();
</script>

<template>
  <div
    class="message"
    :class="[message.role, { streaming: message.isStreaming }]"
  >
    <div class="message-content">
      {{ message.content }}
      <span v-if="message.isStreaming" class="typing-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
    </div>
    <div class="message-time">
      {{ new Date(message.timestamp).toLocaleTimeString() }}
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
    white-space: pre-wrap;
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

  .message-time {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
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
</style>
