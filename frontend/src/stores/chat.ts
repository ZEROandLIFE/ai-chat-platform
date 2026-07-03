import { defineStore } from "pinia";
import { ref, computed, reactive, nextTick } from "vue";
import type { Message, Conversation } from "../types";
import { api } from "../utils/api";

export const useChatStore = defineStore("chat", () => {
  const currentConversationId = ref<string | null>(null);
  const conversations = ref<Conversation[]>([]);
  const isLoading = ref(false);
  const isGenerating = ref(false);
  const quotedMessage = ref<Message | null>(null);
  const currentAiMessageId = ref<string | null>(null);

  const currentConversation = computed(() => {
    return (
      conversations.value.find((c) => c.id === currentConversationId.value) ||
      null
    );
  });

  const currentMessages = computed(() => {
    return currentConversation.value?.messages || [];
  });

  function scrollToBottom() {
    const container = document.querySelector(".chat-messages") as HTMLElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  async function loadConversations() {
    try {
      conversations.value = await api.conversations.getAll();
      if (conversations.value.length > 0 && !currentConversationId.value) {
        currentConversationId.value = conversations.value[0].id;
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      conversations.value = [];
    }
  }

  async function createConversation(): Promise<Conversation> {
    const newConversation = await api.conversations.create();
    conversations.value.unshift(newConversation);
    currentConversationId.value = newConversation.id;
    return newConversation;
  }

  async function selectConversation(id: string) {
    currentConversationId.value = id;
  }

  async function deleteConversation(id: string) {
    await api.conversations.delete(id);
    const index = conversations.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      conversations.value.splice(index, 1);
    }
    if (currentConversationId.value === id) {
      currentConversationId.value = conversations.value[0]?.id || null;
    }
  }

  async function updateConversationTitle(id: string, title: string) {
    const updated = await api.conversations.updateTitle(id, title);
    const conv = conversations.value.find((c) => c.id === id);
    if (conv) {
      conv.title = updated.title;
      conv.updatedAt = updated.updatedAt;
    }
  }

  async function sendMessage(content: string): Promise<void> {
    if (!currentConversationId.value) {
      await createConversation();
    }

    isLoading.value = true;
    isGenerating.value = true;
    quotedMessage.value = null;

    const conv = currentConversation.value;
    if (!conv) return;

    conv.messages.push({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      role: "user",
      timestamp: new Date(),
    });

    if (conv.messages.length === 1 && conv.title === "新对话") {
      conv.title =
        content.length > 30 ? content.substring(0, 30) + "..." : content;
    }

    const aiMessage = reactive<Message>({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    });
    conv.messages.push(aiMessage);

    try {
      await api.conversations.sendMessageStream(
        currentConversationId.value!,
        content,
        (chunk) => {
          aiMessage.content += chunk;
          nextTick(() => {
            scrollToBottom();
          });
        },
        () => {
          aiMessage.isStreaming = false;
        },
      );
    } catch (error) {
      console.error("Send message error:", error);
      aiMessage.content = "发送消息失败，请重试";
      aiMessage.isStreaming = false;
    } finally {
      isLoading.value = false;
      isGenerating.value = false;
      currentAiMessageId.value = null;
    }
  }

  async function deleteMessage(messageId: string) {
    const conv = currentConversation.value;
    if (!conv || !currentConversationId.value) return;

    const updated = await api.conversations.deleteMessage(
      currentConversationId.value,
      messageId,
    );
    conv.messages = updated.messages;
    conv.updatedAt = updated.updatedAt;
  }

  async function regenerateLastResponse(): Promise<void> {
    const conv = currentConversation.value;
    if (!conv || !currentConversationId.value) return;

    if (conv.messages.length < 2) return;

    conv.messages.pop();

    isLoading.value = true;
    isGenerating.value = true;

    const aiMessage: Message = {
      id: "",
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };
    conv.messages.push(aiMessage);

    try {
      const updated = await api.conversations.regenerate(
        currentConversationId.value,
      );
      conv.messages = updated.messages;
      conv.updatedAt = updated.updatedAt;
    } catch (error) {
      console.error("Regenerate error:", error);
      aiMessage.content = "重新生成失败，请重试";
      aiMessage.isStreaming = false;
    } finally {
      isLoading.value = false;
      isGenerating.value = false;
    }
  }

  function stopGenerating() {
    isGenerating.value = false;
    isLoading.value = false;
  }

  function setQuotedMessage(message: Message | null) {
    quotedMessage.value = message;
  }

  function getConversationById(id: string): Conversation | undefined {
    return conversations.value.find((c) => c.id === id);
  }

  return {
    currentConversationId,
    conversations,
    isLoading,
    isGenerating,
    quotedMessage,
    currentAiMessageId,
    currentConversation,
    currentMessages,
    loadConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    updateConversationTitle,
    sendMessage,
    deleteMessage,
    regenerateLastResponse,
    stopGenerating,
    setQuotedMessage,
    getConversationById,
  };
});
