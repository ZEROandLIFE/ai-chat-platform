import { defineStore } from "pinia";
import { ref, computed, reactive, nextTick } from "vue";
import type { Message, Conversation, QuotedMessageInfo } from "../types";
import { api } from "../utils/api";

export const useChatStore = defineStore("chat", () => {
  const currentConversationId = ref<string | null>(null);
  const conversations = ref<Conversation[]>([]);
  const isLoading = ref(false);
  const isGenerating = ref(false);
  const quotedMessage = ref<QuotedMessageInfo | null>(null);
  const currentAiMessageId = ref<string | null>(null);
  const previewFile = ref<File | null>(null);
  const showPreviewPanel = ref(false);
  const previewFileInfo = ref<{
    content: string;
    name: string;
    type: string;
  } | null>(null);
  const selectedText = ref("");

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
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollThreshold = clientHeight * 0.5;
      if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
        container.scrollTop = container.scrollHeight;
      }
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

    const conv = currentConversation.value;
    if (!conv) return;

    let finalContent = content;
    if (quotedMessage.value) {
      const { message, index } = quotedMessage.value;
      const firstFewChars = message.content.substring(0, 10);
      const ellipsis = message.content.length > 10 ? "……" : "";

      if (message.role === "user") {
        finalContent = `查看我先前第${index + 1}个提问，“${firstFewChars}${ellipsis}”。\n\n${content}`;
      } else {
        finalContent = `查看我先前第${Math.ceil((index + 1) / 2)}个提问，你的回答“${firstFewChars}${ellipsis}”。\n\n${content}`;
      }
    }
    quotedMessage.value = null;

    conv.messages.push({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: finalContent,
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

    const aiMessage = reactive<Message>({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    });
    conv.messages.push(aiMessage);

    try {
      await api.conversations.regenerateStream(
        currentConversationId.value,
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

  function setQuotedMessage(message: Message | null, index: number = -1) {
    if (message) {
      quotedMessage.value = { message, index };
    } else {
      quotedMessage.value = null;
    }
  }

  function setPreviewFile(file: File | null) {
    previewFile.value = file;
    previewFileInfo.value = null;
    showPreviewPanel.value = file !== null;
  }

  function setSelectedText(text: string) {
    selectedText.value = text;
  }

  function clearSelectedText() {
    selectedText.value = "";
  }

  async function previewFileById(fileId: string) {
    console.log(`[previewFileById] Starting preview for file ID: ${fileId}`);
    try {
      const fileInfo = await api.files.getContent(fileId);
      console.log(
        `[previewFileById] File info: name=${fileInfo.name}, type=${fileInfo.type}`,
      );
      if (fileInfo.type && fileInfo.type.startsWith("application/pdf")) {
        console.log(`[previewFileById] It's a PDF file, fetching raw data...`);
        const blob = await api.files.getRaw(fileId);
        console.log(
          `[previewFileById] Raw blob received: type=${blob.type}, size=${blob.size}`,
        );
        const file = new File([blob], fileInfo.name, { type: fileInfo.type });
        console.log(
          `[previewFileById] Created File object: name=${file.name}, size=${file.size}`,
        );
        setPreviewFile(file);
        console.log(`[previewFileById] Preview file set successfully`);
      } else {
        console.log(`[previewFileById] Not a PDF file, showing text preview`);
        previewFileInfo.value = fileInfo;
        previewFile.value = null;
        showPreviewPanel.value = true;
      }
    } catch (error) {
      console.error("Failed to preview file:", error);
    }
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
    previewFile,
    previewFileInfo,
    showPreviewPanel,
    selectedText,
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
    setPreviewFile,
    previewFileById,
    getConversationById,
    setSelectedText,
    clearSelectedText,
  };
});
