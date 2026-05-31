import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Message, Conversation } from "../types";
import { generateId, generateConversationTitle } from "../types";
import { chatCompletionStream } from "../utils/mockApi";

const STORAGE_KEY = "ai-chat-conversations";

export const useChatStore = defineStore("chat", () => {
  const currentConversationId = ref<string | null>(null);
  const conversations = ref<Conversation[]>([]);
  const isLoading = ref(false);
  const isGenerating = ref(false);
  const quotedMessage = ref<Message | null>(null);
  const editingMessageId = ref<string | null>(null);

  const currentConversation = computed(() => {
    return (
      conversations.value.find((c) => c.id === currentConversationId.value) ||
      null
    );
  });

  const currentMessages = computed(() => {
    return currentConversation.value?.messages || [];
  });

  function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        conversations.value = parsed.conversations || [];
        currentConversationId.value = parsed.currentConversationId || null;
      } catch {
        conversations.value = [];
        currentConversationId.value = null;
      }
    }
  }

  function saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        conversations: conversations.value,
        currentConversationId: currentConversationId.value,
      }),
    );
  }

  function createConversation(): Conversation {
    const newConversation: Conversation = {
      id: generateId(),
      title: "新对话",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: "gpt-3.5",
    };
    conversations.value.unshift(newConversation);
    currentConversationId.value = newConversation.id;
    saveToStorage();
    return newConversation;
  }

  function selectConversation(id: string) {
    currentConversationId.value = id;
    saveToStorage();
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      conversations.value.splice(index, 1);
      if (currentConversationId.value === id) {
        currentConversationId.value = conversations.value[0]?.id || null;
      }
      saveToStorage();
    }
  }

  function addMessage(content: string, role: "user" | "assistant"): Message {
    const conversation = currentConversation.value;
    if (!conversation) {
      createConversation();
    }

    const newMessage: Message = {
      id: generateId(),
      content,
      role,
      timestamp: new Date(),
    };

    const conv = currentConversation.value;
    if (conv) {
      conv.messages.push(newMessage);
      conv.updatedAt = new Date();

      if (
        role === "user" &&
        conv.messages.length === 1 &&
        conv.title === "新对话"
      ) {
        conv.title = generateConversationTitle(content);
      }

      saveToStorage();
    }

    return newMessage;
  }

  function updateMessage(messageId: string, content: string) {
    const conv = currentConversation.value;
    if (!conv) return;

    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.content = content;
      msg.isEdited = true;
      msg.timestamp = new Date();
      saveToStorage();
    }
  }

  function appendMessageContent(messageId: string, content: string) {
    const conv = currentConversation.value;
    if (!conv) return;

    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.content += content;
      saveToStorage();
    }
  }

  function setMessageStreaming(messageId: string, isStreaming: boolean) {
    const conv = currentConversation.value;
    if (!conv) return;

    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.isStreaming = isStreaming;
    }
  }

  function setMessageStopped(messageId: string, isStopped: boolean) {
    const conv = currentConversation.value;
    if (!conv) return;

    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.isStopped = isStopped;
    }
  }

  function deleteMessage(messageId: string) {
    const conv = currentConversation.value;
    if (!conv) return;

    const index = conv.messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      conv.messages.splice(index, 1);
      saveToStorage();
    }
  }

  function clearCurrentConversation() {
    const conv = currentConversation.value;
    if (conv) {
      conv.messages = [];
      conv.title = "新对话";
      saveToStorage();
    }
  }

  async function sendMessage(content: string): Promise<void> {
    isLoading.value = true;
    isGenerating.value = true;

    addMessage(content, "user");
    quotedMessage.value = null;

    const aiMessage = addMessage("", "assistant");

    try {
      setMessageStreaming(aiMessage.id, true);

      for await (const chunk of chatCompletionStream({ messages: [] })) {
        if (!isGenerating.value) {
          setMessageStopped(aiMessage.id, true);
          break;
        }

        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          appendMessageContent(aiMessage.id, delta);
        }

        if (chunk.choices[0]?.finish_reason === "stop") {
          break;
        }
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      isLoading.value = false;
      isGenerating.value = false;
      setMessageStreaming(aiMessage.id, false);
    }
  }

  async function regenerateLastResponse(): Promise<void> {
    const conv = currentConversation.value;
    if (!conv || conv.messages.length < 2) return;

    const lastUserMessage = conv.messages[conv.messages.length - 2];
    if (lastUserMessage.role !== "user") return;

    const lastAiMessage = conv.messages[conv.messages.length - 1];
    if (lastAiMessage.role !== "assistant") return;

    conv.messages.pop();

    isLoading.value = true;
    isGenerating.value = true;

    const aiMessage = addMessage("", "assistant");

    try {
      setMessageStreaming(aiMessage.id, true);

      for await (const chunk of chatCompletionStream({ messages: [] })) {
        if (!isGenerating.value) {
          setMessageStopped(aiMessage.id, true);
          break;
        }

        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          appendMessageContent(aiMessage.id, delta);
        }

        if (chunk.choices[0]?.finish_reason === "stop") {
          break;
        }
      }
    } catch (error) {
      console.error("重新生成失败:", error);
    } finally {
      isLoading.value = false;
      isGenerating.value = false;
      setMessageStreaming(aiMessage.id, false);
    }
  }

  function stopGenerating() {
    isGenerating.value = false;
    isLoading.value = false;
  }

  function setQuotedMessage(message: Message | null) {
    quotedMessage.value = message;
  }

  function setEditingMessage(messageId: string | null) {
    editingMessageId.value = messageId;
  }

  function getConversationById(id: string): Conversation | undefined {
    return conversations.value.find((c) => c.id === id);
  }

  loadFromStorage();

  return {
    currentConversationId,
    conversations,
    isLoading,
    isGenerating,
    quotedMessage,
    editingMessageId,
    currentConversation,
    currentMessages,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    clearCurrentConversation,
    sendMessage,
    regenerateLastResponse,
    stopGenerating,
    setQuotedMessage,
    setEditingMessage,
    getConversationById,
    loadFromStorage,
    appendMessageContent,
    setMessageStreaming,
    setMessageStopped,
  };
});
