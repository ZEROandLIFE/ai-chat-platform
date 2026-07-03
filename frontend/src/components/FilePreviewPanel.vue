<script setup lang="ts">
  import { ref, computed, watch, onUnmounted } from "vue";
  import { useChatStore } from "../stores/chat";
  import { FileReaderService } from "../utils/fileReader";
  import type { FilePreviewData } from "../utils/fileReader";

  const chatStore = useChatStore();
  const previewData = ref<FilePreviewData | null>(null);
  const currentPage = ref(1);
  const loading = ref(false);
  const panelWidth = ref("50%");
  const isDragging = ref(false);
  const scale = ref(1);
  const scaleStep = 0.1;
  const minScale = 0.5;
  const maxScale = 2;

  const computedWidth = computed(() => {
    if (
      chatStore.showPreviewPanel &&
      (displayPreviewData.value || currentPreviewInfo.value)
    ) {
      return panelWidth.value;
    }
    return "0";
  });

  const emit = defineEmits<{
    panelResize: [width: string];
  }>();

  const startDrag = (e: MouseEvent) => {
    isDragging.value = true;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  };

  const onDrag = (e: MouseEvent) => {
    if (!isDragging.value) return;
    const container = document.querySelector(".main-layout") as HTMLElement;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const newWidth = containerWidth - e.clientX;
    const percentage = Math.max(
      Math.min((newWidth / containerWidth) * 100, 80),
      20,
    );
    panelWidth.value = `${percentage}%`;
    emit("panelResize", panelWidth.value);
  };

  const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  onUnmounted(() => {
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  });

  const currentPreviewInfo = computed(() => {
    if (chatStore.previewFileInfo) {
      return chatStore.previewFileInfo;
    }
    return null;
  });

  const displayPreviewData = computed(() => previewData.value);

  watch(
    () => chatStore.previewFile,
    async (file) => {
      if (file) {
        loading.value = true;
        try {
          previewData.value = await FileReaderService.readFile(file);
          currentPage.value = 1;
        } catch (error) {
          console.error("File preview error:", error);
          previewData.value = null;
        } finally {
          loading.value = false;
        }
      } else {
        previewData.value = null;
      }
    },
    { immediate: true },
  );

  watch(
    () => chatStore.previewFileInfo,
    () => {
      currentPage.value = 1;
    },
  );

  const closePreview = () => {
    chatStore.setPreviewFile(null);
  };

  const prevPage = () => {
    if (previewData.value?.pages && currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const nextPage = () => {
    if (
      previewData.value?.pages &&
      currentPage.value < previewData.value.pages.length
    ) {
      currentPage.value++;
    }
  };

  const goToPage = (page: number) => {
    if (
      previewData.value?.pages &&
      page >= 1 &&
      page <= previewData.value.pages.length
    ) {
      currentPage.value = page;
    }
  };

  const zoomIn = () => {
    if (scale.value < maxScale) {
      scale.value = Math.min(scale.value + scaleStep, maxScale);
    }
  };

  const zoomOut = () => {
    if (scale.value > minScale) {
      scale.value = Math.max(scale.value - scaleStep, minScale);
    }
  };

  const fitWidth = () => {
    scale.value = 1;
  };

  watch(
    () => chatStore.previewFile,
    () => {
      scale.value = 1;
    },
  );
</script>

<template>
  <div
    class="file-preview-panel"
    :class="{
      visible:
        chatStore.showPreviewPanel &&
        (displayPreviewData || currentPreviewInfo),
    }"
    :style="{ width: computedWidth }"
  >
    <div
      v-if="chatStore.showPreviewPanel"
      class="drag-handle"
      @mousedown="startDrag"
    ></div>
    <div v-if="chatStore.showPreviewPanel" class="preview-header">
      <div class="preview-title">
        <span class="file-icon">
          {{
            currentPreviewInfo
              ? FileReaderService.getFileIcon(currentPreviewInfo.name)
              : displayPreviewData
                ? FileReaderService.getFileIcon(displayPreviewData.fileName)
                : "📎"
          }}
        </span>
        <span class="file-name">{{
          currentPreviewInfo?.name ||
          displayPreviewData?.fileName ||
          "未选择文件"
        }}</span>
      </div>
      <button class="close-btn" @click="closePreview">×</button>
    </div>

    <div v-if="chatStore.showPreviewPanel" class="preview-content">
      <div v-if="loading" class="loading-state">
        <span class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
        <p>正在加载文件...</p>
      </div>

      <div
        v-else-if="!displayPreviewData && !currentPreviewInfo"
        class="empty-preview"
      >
        <p>选择一个文件进行预览</p>
      </div>

      <div v-else-if="currentPreviewInfo" class="text-preview">
        <pre class="text-content">{{ currentPreviewInfo.content }}</pre>
      </div>

      <template v-else-if="displayPreviewData">
        <div v-if="displayPreviewData.blobUrl" class="image-preview">
          <img
            :src="displayPreviewData.blobUrl"
            :alt="displayPreviewData.fileName"
          />
        </div>

        <div v-else-if="displayPreviewData.pages" class="pdf-preview">
          <div class="pdf-toolbar">
            <div class="toolbar-left">
              <button
                class="toolbar-btn"
                :disabled="currentPage <= 1"
                @click="prevPage"
              >
                ◀
              </button>
              <button
                class="toolbar-btn"
                :disabled="currentPage >= displayPreviewData.pages.length"
                @click="nextPage"
              >
                ▶
              </button>
              <span class="page-info">
                {{ currentPage }} / {{ displayPreviewData.pages.length }}
              </span>
            </div>
            <div class="toolbar-right">
              <button class="toolbar-btn" @click="zoomOut" title="缩小">
                -
              </button>
              <span class="scale-info">{{ Math.round(scale * 100) }}%</span>
              <button class="toolbar-btn" @click="zoomIn" title="放大">
                +
              </button>
              <button class="toolbar-btn" @click="fitWidth" title="适合宽度">
                ⊡
              </button>
            </div>
          </div>
          <div class="pdf-container">
            <img
              :src="displayPreviewData.pages[currentPage - 1]"
              :alt="`第 ${currentPage} 页`"
              class="pdf-page"
              :style="{
                transform: `scale(${scale})`,
                transformOrigin: 'center top',
              }"
            />
          </div>
          <div class="page-dots">
            <button
              v-for="(_, index) in displayPreviewData.pages"
              :key="index"
              class="page-dot"
              :class="{ active: index + 1 === currentPage }"
              @click="goToPage(index + 1)"
            ></button>
          </div>
        </div>

        <div v-else-if="displayPreviewData.textContent" class="text-preview">
          <pre class="text-content">{{ displayPreviewData.textContent }}</pre>
        </div>

        <div v-else class="unsupported-preview">
          <p>暂不支持预览此文件类型</p>
          <p class="file-info">
            {{ displayPreviewData.fileName }} -
            {{ FileReaderService.formatFileSize(displayPreviewData.fileSize) }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
  .file-preview-panel {
    width: 0;
    height: 100%;
    background: #fff;
    border-left: 1px solid #e5e5e5;
    overflow: hidden;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: relative;
  }

  .drag-handle {
    position: absolute;
    left: 0;
    top: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background: transparent;
    z-index: 10;
  }

  .drag-handle:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .drag-handle:active {
    background: rgba(0, 0, 0, 0.2);
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #e5e5e5;
    background: #f8f9fa;
  }

  .preview-title {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .file-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    padding: 0 4px;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #333;
  }

  .preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
  }

  .loading-dots {
    display: flex;
    gap: 6px;
  }

  .loading-dots .dot {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  .loading-dots .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loading-dots .dot:nth-child(2) {
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

  .empty-preview,
  .unsupported-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    gap: 8px;
  }

  .image-preview {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
    overflow-y: auto;
  }

  .image-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .pdf-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .pdf-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e5e5;
    background: #f8f9fa;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .toolbar-btn:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #ccc;
  }

  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 13px;
    color: #666;
    min-width: 60px;
    text-align: center;
  }

  .scale-info {
    font-size: 12px;
    color: #666;
    min-width: 45px;
    text-align: center;
  }

  .pdf-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    padding: 16px;
  }

  .pdf-page {
    max-width: 100%;
    height: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    transition: transform 0.2s ease;
  }

  .page-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 8px;
  }

  .page-dot {
    width: 8px;
    height: 8px;
    background: #ddd;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-dot:hover {
    background: #999;
  }

  .page-dot.active {
    background: #333;
  }

  .text-preview {
    height: 100%;
    overflow-y: auto;
    text-align: left;
  }

  .text-content {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e5e5e5;
    text-align: left;
    display: block;
  }

  .file-info {
    font-size: 12px;
    color: #666;
  }
</style>

<style>
  .main-layout.dark .file-preview-panel {
    background: #1e1e1e;
    border-left-color: #333;
  }

  .main-layout.dark .preview-header {
    background: #252525;
    border-bottom-color: #333;
  }

  .main-layout.dark .file-name {
    color: #e0e0e0;
  }

  .main-layout.dark .close-btn:hover {
    color: #fff;
  }

  .main-layout.dark .nav-btn {
    background: #252525;
    border-color: #444;
    color: #e0e0e0;
  }

  .main-layout.dark .nav-btn:hover:not(:disabled) {
    background: #333;
    border-color: #555;
  }

  .main-layout.dark .page-info {
    color: #aaa;
  }

  .main-layout.dark .page-dot {
    background: #444;
  }

  .main-layout.dark .page-dot:hover {
    background: #666;
  }

  .main-layout.dark .page-dot.active {
    background: #fff;
  }

  .main-layout.dark .text-content {
    background: #252525;
    border-color: #333;
    color: #e0e0e0;
  }

  .main-layout.dark .empty-preview,
  .main-layout.dark .unsupported-preview {
    color: #666;
  }

  .main-layout.dark .file-info {
    color: #555;
  }
</style>
