<script setup lang="ts">
  import { ref, watch, nextTick } from "vue";
  import { useChatStore } from "../stores/chat";
  import MessageItem from "./MessageItem.vue";
  import MessageNav from "./MessageNav.vue";

  const chatStore = useChatStore();

  const props = defineProps<{
    userMessages: Array<{ id: string; content: string }>;
    activeNavIndex: number | null;
  }>();

  const emit = defineEmits<{
    scrollToMessage: [messageId: string];
    updateActiveNavIndex: [index: number];
  }>();

  const messagesContainer = ref<HTMLElement | null>(null);
  const messageRefs = ref<Map<string, HTMLElement>>(new Map());

  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    });
  };

  watch(
    () => chatStore.currentMessages.length,
    () => {
      scrollToBottom();
    },
  );

  watch(
    () => chatStore.currentMessages.map((m) => m.content.length),
    () => {
      scrollToBottom();
    },
    { deep: true },
  );

  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.value.get(messageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight");
      setTimeout(() => element.classList.remove("highlight"), 1000);
    }
  };

  const handleScroll = () => {
    if (!messagesContainer.value) return;

    const container = messagesContainer.value;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const userMessages = props.userMessages;
    if (userMessages.length === 0) return;

    const totalScroll = scrollHeight - clientHeight;
    if (totalScroll <= 0) {
      emit("updateActiveNavIndex", userMessages.length - 1);
      return;
    }

    const scrollProgress = scrollTop / totalScroll;
    const messageIndex = Math.floor(scrollProgress * userMessages.length);

    emit(
      "updateActiveNavIndex",
      Math.min(Math.max(messageIndex, 0), userMessages.length - 1),
    );
  };

  defineExpose({
    scrollToMessage,
    messagesContainer,
    messageRefs,
  });
</script>

<template>
  <div class="chat-messages-wrapper">
    <div class="chat-messages" ref="messagesContainer" @scroll="handleScroll">
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
        <MessageItem
          v-for="msg in chatStore.currentMessages"
          :key="msg.id"
          :message="msg"
          :ref="
            (el: any) => {
              if (el?.$el) messageRefs.set(msg.id, el.$el);
            }
          "
        />
      </div>
    </div>
    <MessageNav
      v-if="userMessages.length > 0"
      :user-messages="userMessages as any"
      :active-nav-index="activeNavIndex"
      @scroll-to-message="scrollToMessage"
    />
  </div>
</template>

<style scoped>
  .chat-messages-wrapper {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    scrollbar-width: none;
    -ms-overflow-style: none;
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
    align-items: flex-start;
    padding-bottom: 160px;
  }
</style>
