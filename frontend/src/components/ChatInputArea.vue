<script setup lang="ts">
  import { ref } from "vue";
  import { useChatStore } from "../stores/chat";
  import type { UploadedFile } from "../types";

  const chatStore = useChatStore();

  const messageInput = ref("");
  const uploadedFiles = ref<UploadedFile[]>([]);

  const handleSend = () => {
    const content = messageInput.value.trim();
    if (!content || chatStore.isLoading) return;

    chatStore.sendMessage(content);
    messageInput.value = "";
    uploadedFiles.value = [];
  };

  const handleStop = () => {
    chatStore.stopGenerating();
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          uploadedFiles.value.push({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadTime: new Date(),
          });
        }
      }
    };
    input.click();
  };

  const removeFile = (fileId: string) => {
    const index = uploadedFiles.value.findIndex((f) => f.id === fileId);
    if (index !== -1) {
      uploadedFiles.value.splice(index, 1);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
</script>

<template>
  <div class="chat-input-area">
    <div v-if="uploadedFiles.length > 0" class="file-preview">
      <div
        v-for="file in uploadedFiles"
        :key="file.id"
        class="file-preview-item"
      >
        <span class="file-icon">📄</span>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ formatFileSize(file.size) }}</span>
        <button class="remove-file-btn" @click="removeFile(file.id)">×</button>
      </div>
    </div>
    <div class="input-row">
      <button
        v-if="!chatStore.isGenerating"
        class="upload-btn"
        title="上传文件"
        @click="triggerFileInput"
      >
        📎
      </button>
      <input
        v-model="messageInput"
        type="text"
        class="chat-input"
        placeholder="输入消息..."
        @keyup.enter="chatStore.isGenerating ? handleStop() : handleSend()"
      />
      <button
        class="action-btn"
        :class="chatStore.isGenerating ? 'stop-btn' : 'send-btn'"
        :disabled="!chatStore.isGenerating && !messageInput.trim()"
        @click="chatStore.isGenerating ? handleStop() : handleSend()"
      >
        {{ chatStore.isGenerating ? "停止" : "发送" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  .chat-input-area {
    padding: 16px;
    border-top: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f8f9fa;
  }

  .file-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .file-preview-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    font-size: 13px;
  }

  .file-icon {
    font-size: 14px;
  }

  .file-name {
    color: #333;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    color: #999;
    font-size: 11px;
  }

  .remove-file-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 14px;
    padding: 0 4px;
  }

  .remove-file-btn:hover {
    color: #dc3545;
  }

  .input-row {
    display: flex;
    gap: 12px;
  }

  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    height: 44px;
    width: 44px;
    box-sizing: border-box;
  }

  .upload-btn:hover {
    background: #f8f9fa;
    border-color: #ccc;
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
    height: 44px;
    box-sizing: border-box;
  }

  .chat-input:focus {
    border-color: #adb5bd;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
    min-width: 80px;
    height: 44px;
    box-sizing: border-box;
  }

  .send-btn {
    background: #333;
    color: #fff;
  }

  .send-btn:hover:not(:disabled) {
    background: #555;
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stop-btn {
    background: #dc3545;
    color: #fff;
  }

  .stop-btn:hover {
    background: #c82333;
  }
</style>

<style>
  .main-layout.dark .chat-input-area {
    border-top-color: #333;
    background: #1e1e1e;
  }

  .main-layout.dark .file-preview-item {
    background: #2d2d2d;
    border-color: #404040;
  }

  .main-layout.dark .file-name {
    color: #e0e0e0;
  }

  .main-layout.dark .remove-file-btn:hover {
    color: #f87171;
  }

  .main-layout.dark .upload-btn {
    background: #252525;
    border-color: #333;
  }

  .main-layout.dark .upload-btn:hover {
    background: #2d2d2d;
    border-color: #555;
  }

  .main-layout.dark .chat-input {
    background: #252525;
    color: #fff;
    border-color: #333;
  }

  .main-layout.dark .chat-input:focus {
    border-color: #555;
  }

  .main-layout.dark .send-btn {
    background: #fff;
    color: #000;
  }

  .main-layout.dark .send-btn:hover:not(:disabled) {
    background: #e0e0e0;
  }

  .main-layout.dark .stop-btn {
    background: #bd2130;
  }

  .main-layout.dark .stop-btn:hover {
    background: #a71d2a;
  }
</style>
