<script setup lang="ts">
  import { computed } from "vue";
  import type { Message } from "../types";
  import MarkdownRenderer from "./MarkdownRenderer.vue";
  import MessageActions from "./MessageActions.vue";
  import { useChatStore } from "../stores/chat";
  import { FileReaderService } from "../utils/fileReader";
  import { api } from "../utils/api";

  const props = defineProps<{
    message: Message;
    index: number;
  }>();

  const chatStore = useChatStore();

  const fileNames = computed(() => {
    const match = props.message.content.match(/上传了文件：(.+)/);
    if (match) {
      return match[1].split("、").filter((f) => f.trim());
    }
    return [];
  });

  const handleFileClick = async (fileName: string) => {
    if (props.message.role === "user") {
      chatStore.stopGenerating();
    }
    if (chatStore.currentConversationId) {
      try {
        const files = await api.files.getByConversation(
          chatStore.currentConversationId,
        );
        const file = files.find((f: any) => f.name === fileName);
        if (file && file.id) {
          await chatStore.previewFileById(file.id);
        }
      } catch (error) {
        console.error("Failed to preview file:", error);
      }
    }
  };
</script>

<template>
  <div
    class="message"
    :class="[message.role, { streaming: message.isStreaming }]"
    :data-message-id="message.id"
  >
    <div class="message-content">
      <MarkdownRenderer
        v-if="message.role === 'assistant'"
        :content="message.content"
      />
      <template v-else-if="fileNames.length > 0">
        <div class="file-preview-list">
          <span
            v-for="fileName in fileNames"
            :key="fileName"
            class="file-preview-tag"
            @click="handleFileClick(fileName)"
          >
            <span class="file-icon">{{
              FileReaderService.getFileIcon(fileName)
            }}</span>
            <span class="file-name">{{ fileName }}</span>
          </span>
        </div>
      </template>
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
      <div class="footer-actions">
        <MessageActions :message="message" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .message {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 12px;
  }

  .file-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .file-preview-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .file-preview-tag:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  .file-preview-tag .file-icon {
    font-size: 14px;
  }

  .file-preview-tag .file-name {
    color: #333;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .message.user {
    align-self: flex-end;
    background: #e9ecef;
    text-align: left;
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

  .footer-actions {
    display: flex;
    align-items: center;
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
