<script setup lang="ts">
  import { ref, computed, nextTick, onMounted } from "vue";
  import { useThemeStore } from "../stores/theme";
  import { useChatStore } from "../stores/chat";
  import type { Conversation } from "../types";

  defineProps<{
    collapsed: boolean;
  }>();

  const themeStore = useThemeStore();
  const chatStore = useChatStore();

  const editingConversationId = ref<string | null>(null);
  const editingTitle = ref("");
  const searchQuery = ref("");

  onMounted(() => {
    chatStore.loadConversations();
  });

  const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) {
      return chatStore.conversations;
    }
    const query = searchQuery.value.toLowerCase();
    return chatStore.conversations.filter((conv) =>
      conv.title.toLowerCase().includes(query),
    );
  });

  const startEditing = (conv: Conversation, event: Event) => {
    event.stopPropagation();
    editingConversationId.value = conv.id;
    editingTitle.value = conv.title;
    nextTick(() => {
      const input = document.querySelector(
        ".title-edit-input",
      ) as HTMLInputElement;
      if (input) input.focus();
    });
  };

  const saveTitle = async () => {
    if (editingConversationId.value && editingTitle.value.trim()) {
      await chatStore.updateConversationTitle(
        editingConversationId.value,
        editingTitle.value.trim()
      );
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
  <div class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="chatStore.createConversation()">
        + 新建对话
      </button>
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索对话..."
        />
      </div>
    </div>
    <div class="sidebar-content">
      <div
        v-if="searchQuery && filteredConversations.length === 0"
        class="no-results"
      >
        未找到匹配的对话
      </div>
      <div class="conversation-list">
        <div
          v-for="conv in filteredConversations"
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
            <span
              class="conversation-title"
              @dblclick="startEditing(conv, $event)"
              >{{ conv.title }}</span
            >
            <div class="item-actions">
              <button
                class="edit-btn"
                @click="startEditing(conv, $event)"
                title="编辑"
              >
                ✎
              </button>
              <button
                class="delete-btn"
                @click.stop="chatStore.deleteConversation(conv.id)"
              >
                ×
              </button>
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
</template>

<style scoped>
  .sidebar {
    width: 260px;
    border-right: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    background: #f8f9fa;
  }

  .sidebar.collapsed {
    width: 0;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
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

  .search-box {
    margin-top: 12px;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    background: #fff;
    color: #333;
    box-sizing: border-box;
  }

  .search-input:focus {
    border-color: #667eea;
  }

  .search-input::placeholder {
    color: #999;
  }

  .no-results {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 13px;
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

  .conversation-item.active {
    background: #e9ecef;
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

  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e5e5;
    background: #f1f3f5;
  }

  .theme-toggle {
    width: 100%;
    padding: 10px;
    background: #e9ecef;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
    text-align: center;
  }

  .theme-toggle:hover {
    background: #dee2e6;
  }
</style>

<style>
  .main-layout.dark .sidebar {
    border-right-color: #333;
    background: #1e1e1e;
  }

  .main-layout.dark .sidebar-header {
    border-bottom-color: #333;
  }

  .main-layout.dark .new-chat-btn {
    background: #2d2d2d;
    color: #e0e0e0;
  }

  .main-layout.dark .new-chat-btn:hover {
    background: #3d3d3d;
  }

  .main-layout.dark .conversation-item:hover {
    background: #2d2d2d;
  }

  .main-layout.dark .conversation-item.active {
    background: #2d2d2d;
  }

  .main-layout.dark .title-edit-input {
    background: #3d3d3d;
    border-color: #555;
    color: #fff;
  }

  .main-layout.dark .edit-btn:hover,
  .main-layout.dark .delete-btn:hover {
    color: #bbb;
  }

  .main-layout.dark .sidebar-footer {
    border-top-color: #333;
    background: #252525;
  }

  .main-layout.dark .search-input {
    background: #2d2d2d;
    border-color: #444;
    color: #e0e0e0;
  }

  .main-layout.dark .search-input:focus {
    border-color: #667eea;
  }

  .main-layout.dark .search-input::placeholder {
    color: #666;
  }

  .main-layout.dark .theme-toggle {
    background: #2d2d2d;
    border-color: #404040;
    color: #e0e0e0;
  }

  .main-layout.dark .theme-toggle:hover {
    background: #3d3d3d;
  }
</style>
