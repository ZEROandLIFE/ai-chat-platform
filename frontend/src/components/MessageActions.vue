<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { useChatStore } from "../stores/chat";
  import type { Message } from "../types";

  const props = defineProps<{
    message: Message;
    index: number;
  }>();

  const chatStore = useChatStore();
  const showActions = ref(false);
  const copied = ref(false);

  const handleRegenerate = () => {
    showActions.value = false;
    chatStore.regenerateLastResponse();
  };

  const handleQuote = () => {
    showActions.value = false;
    chatStore.setQuotedMessage(props.message, props.index);
  };

  const handleCopy = async () => {
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

  const handleDelete = () => {
    showActions.value = false;
    if (confirm("确定要删除这条消息吗？")) {
      chatStore.deleteMessage(props.message.id);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".message-actions")) {
      showActions.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<template>
  <div class="message-actions">
    <button class="actions-trigger" @click="showActions = !showActions">
      ···
    </button>
    <div v-if="showActions" class="actions-popup">
      <button
        v-if="message.role === 'assistant' && !message.isStreaming"
        class="action-btn"
        title="重新生成"
        @click="handleRegenerate"
      >
        重新生成
      </button>
      <button class="action-btn" title="引用" @click="handleQuote">引用</button>
      <button
        class="action-btn"
        :title="copied ? '已复制' : '复制'"
        @click="handleCopy"
      >
        {{ copied ? "已复制" : "复制" }}
      </button>
      <button class="action-btn delete" title="删除" @click="handleDelete">
        删除
      </button>
    </div>
  </div>
</template>

<style scoped>
  .message-actions {
    position: relative;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .actions-trigger {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    color: #888;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .actions-trigger:hover {
    color: #555;
    background: #f0f0f0;
  }

  .actions-popup {
    position: absolute;
    right: 0;
    top: 100%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    min-width: 80px;
    white-space: nowrap;
    margin-top: 4px;
  }

  .action-btn {
    background: none;
    border: none;
    padding: 6px 12px;
    text-align: left;
    font-size: 13px;
    color: #333;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .action-btn:hover {
    background: #f0f0f0;
  }

  .action-btn.delete {
    color: #ff4d4f;
  }

  .action-btn.delete:hover {
    background: #fff1f0;
  }
</style>
