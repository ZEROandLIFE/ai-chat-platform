<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useThemeStore } from "../../stores/theme";
import { useChatStore } from "../../stores/chat";
import type { Conversation } from "../../types";

const themeStore = useThemeStore();
const chatStore = useChatStore();

const sidebarCollapsed = ref(false);
const messageInput = ref("");
const editingConversationId = ref<string | null>(null);
const editingTitle = ref("");

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleSend = () => {
  const content = messageInput.value.trim();
  if (!content || chatStore.isLoading) return;

  chatStore.sendMessage(content);
  messageInput.value = "";
};

const startEditing = (conv: Conversation, event: Event) => {
  event.stopPropagation();
  editingConversationId.value = conv.id;
  editingTitle.value = conv.title;
  nextTick(() => {
    const input = document.querySelector('.title-edit-input') as HTMLInputElement;
    if (input) input.focus();
  });
};

const saveTitle = () => {
  if (editingConversationId.value && editingTitle.value.trim()) {
    const conv = chatStore.getConversationById(editingConversationId.value);
    if (conv) {
      conv.title = editingTitle.value.trim();
    }
  }
  editingConversationId.value = null;
  editingTitle.value = "";
};

const cancelEditing = () => {
  editingConversationId.value = null;
  editingTitle.value = "";
};
</script>

<template>
  <div class="main-layout" :class="{ dark: themeStore.mode === 'dark' }">
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="chatStore.createConversation()">
          + 新建对话
        </button>
      </div>
      <div class="sidebar-content">
        <div class="conversation-list">
          <div
            v-for="conv in chatStore.conversations"
            :key="conv.id"
            class="conversation-item"
            :class="{ active: conv.id === chatStore.currentConversationId }"
            @click="chatStore.selectConversation(conv.id)"
          >
            <template v-if="editingConversationId === conv.id">
              <input
                v-model="editingTitle"
                class="title-edit-input"
                @keyup.enter="saveTitle"
                @keyup.escape="cancelEditing"
                @blur="saveTitle"
                @click.stop
              />
            </template>
            <template v-else>
              <span class="conversation-title" @dblclick="startEditing(conv, $event)">{{ conv.title }}</span>
              <div class="item-actions">
                <button class="edit-btn" @click="startEditing(conv, $event)" title="编辑">✎</button>
                <button class="delete-btn" @click.stop="chatStore.deleteConversation(conv.id)">×</button>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="sidebar-footer">
        <button class="theme-toggle" @click="themeStore.toggleTheme()">
          {{ themeStore.mode === "light" ? "🌙" : "☀️" }}
        </button>
      </div>
    </div>
    <div class="chat-area">
      <div class="chat-header">
        <button class="toggle-sidebar" @click="toggleSidebar">☰</button>
        <button v-if="sidebarCollapsed" class="header-new-chat" @click="chatStore.createConversation()">
          + 新建对话
        </button>
        <span class="chat-title">AI Chat</span>
      </div>
      <div class="chat-messages">
        <div v-if="!chatStore.currentConversation" class="empty-state">
          <p>选择一个对话或新建对话开始聊天</p>
        </div>
        <div
          v-else-if="chatStore.currentMessages.length === 0"
          class="empty-state"
        >
          <p>开始发送消息吧</p>
        </div>
        <div v-else class="messages-list">
          <div
            v-for="msg in chatStore.currentMessages"
            :key="msg.id"
            class="message"
            :class="msg.role"
          >
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">
              {{ new Date(msg.timestamp).toLocaleTimeString() }}
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <input
          v-model="messageInput"
          type="text"
          class="chat-input"
          placeholder="输入消息..."
          @keyup.enter="handleSend"
        />
        <button
          class="send-btn"
          :disabled="chatStore.isLoading || !messageInput.trim()"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
  background: #ffffff;
  color: #000000;
  overflow: hidden;
}

.main-layout.dark {
  background: #1a1a1a;
  color: #ffffff;
}

.sidebar {
  width: 260px;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  background: #f8f9fa;
}

.main-layout.dark .sidebar {
  border-right-color: #333;
  background: #1e1e1e;
}

.sidebar.collapsed {
  width: 0;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.main-layout.dark .sidebar-header {
  border-bottom-color: #333;
}

.new-chat-btn {
  width: 100%;
  padding: 10px 16px;
  background: #e9ecef;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.new-chat-btn:hover {
  background: #dee2e6;
}

.main-layout.dark .new-chat-btn {
  background: #2d2d2d;
  color: #e0e0e0;
}

.main-layout.dark .new-chat-btn:hover {
  background: #3d3d3d;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
}

.conversation-item:hover {
  background: #e9ecef;
}

.conversation-item:hover .item-actions {
  opacity: 1;
}

.main-layout.dark .conversation-item:hover {
  background: #2d2d2d;
}

.conversation-item.active {
  background: #e9ecef;
}

.main-layout.dark .conversation-item.active {
  background: #2d2d2d;
}

.conversation-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.title-edit-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.main-layout.dark .title-edit-input {
  background: #3d3d3d;
  border-color: #555;
  color: #fff;
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #999;
  padding: 2px 4px;
}

.edit-btn:hover,
.delete-btn:hover {
  color: #666;
}

.main-layout.dark .edit-btn:hover,
.main-layout.dark .delete-btn:hover {
  color: #bbb;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e5e5;
  background: #f1f3f5;
}

.main-layout.dark .sidebar-footer {
  border-top-color: #333;
  background: #252525;
}

.theme-toggle {
  width: 100%;
  padding: 10px;
  background: #e9ecef;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.theme-toggle:hover {
  background: #dee2e6;
}

.main-layout.dark .theme-toggle {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.main-layout.dark .theme-toggle:hover {
  background: #3d3d3d;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  gap: 12px;
  background: #f8f9fa;
}

.main-layout.dark .chat-header {
  border-bottom-color: #333;
  background: #1e1e1e;
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

.main-layout.dark .toggle-sidebar {
  color: #aaa;
}

.main-layout.dark .toggle-sidebar:hover {
  color: #fff;
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

.main-layout.dark .header-new-chat {
  background: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

.main-layout.dark .header-new-chat:hover {
  background: #3d3d3d;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.user {
  align-self: flex-end;
  background: #e9ecef;
}

.main-layout.dark .message.user {
  background: #2d2d2d;
}

.message.assistant {
  align-self: flex-start;
  background: #fff;
  border: 1px solid #e5e5e5;
}

.main-layout.dark .message.assistant {
  background: #252525;
  border-color: #333;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 12px;
  background: #f8f9fa;
}

.main-layout.dark .chat-input-area {
  border-top-color: #333;
  background: #1e1e1e;
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

.main-layout.dark .chat-input {
  background: #252525;
  color: #fff;
  border-color: #333;
}

.main-layout.dark .chat-input:focus {
  border-color: #555;
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

.main-layout.dark .send-btn {
  background: #fff;
  color: #000;
}

.main-layout.dark .send-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
