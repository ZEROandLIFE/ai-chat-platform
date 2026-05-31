<script setup lang="ts">
  import { useChatStore } from "../stores/chat";

  defineProps<{
    sidebarCollapsed: boolean;
  }>();

  const emit = defineEmits<{
    toggleSidebar: [];
  }>();

  const chatStore = useChatStore();
</script>

<template>
  <div class="chat-header">
    <button class="toggle-sidebar" @click="emit('toggleSidebar')">☰</button>
    <button
      v-if="sidebarCollapsed"
      class="header-new-chat"
      @click="chatStore.createConversation()"
    >
      + 新建对话
    </button>
    <span class="chat-title">AI Chat</span>
  </div>
</template>

<style scoped>
  .chat-header {
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    gap: 12px;
    background: #f8f9fa;
  }

  .toggle-sidebar {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    color: #666;
  }

  .toggle-sidebar:hover {
    color: #333;
  }

  .header-new-chat {
    padding: 6px 12px;
    background: #e9ecef;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    transition: background 0.2s;
  }

  .header-new-chat:hover {
    background: #dee2e6;
  }

  .chat-title {
    font-size: 16px;
    font-weight: 500;
  }
</style>

<style>
  .main-layout.dark .chat-header {
    border-bottom-color: #333;
    background: #1e1e1e;
  }

  .main-layout.dark .toggle-sidebar {
    color: #aaa;
  }

  .main-layout.dark .toggle-sidebar:hover {
    color: #fff;
  }

  .main-layout.dark .header-new-chat {
    background: #2d2d2d;
    border-color: #404040;
    color: #e0e0e0;
  }

  .main-layout.dark .header-new-chat:hover {
    background: #3d3d3d;
  }
</style>
