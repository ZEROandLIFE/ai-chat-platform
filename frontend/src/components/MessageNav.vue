<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted } from "vue";
  import type { Message } from "../types";

  const props = defineProps<{
    userMessages: Message[];
    activeNavIndex: number | null;
  }>();

  const emit = defineEmits<{
    scrollToMessage: [messageId: string];
  }>();

  const hoveredNavIndex = ref<number | null>(null);
  const navPositions = ref<Map<string, string>>(new Map());
  let positionTimer: ReturnType<typeof setTimeout> | null = null;

  const updatePositions = () => {
    if (positionTimer) {
      clearTimeout(positionTimer);
    }
    positionTimer = setTimeout(() => {
      const container = document.querySelector(".chat-messages") as HTMLElement;
      if (!container) return;

      const scrollHeight = container.scrollHeight;
      const newPositions = new Map<string, string>();

      props.userMessages.forEach((msg) => {
        const msgElement = document.querySelector(
          `[data-message-id="${msg.id}"]`,
        ) as HTMLElement;
        if (msgElement) {
          const msgTop = msgElement.offsetTop;
          const msgHeight = msgElement.offsetHeight;
          const msgCenter = msgTop + msgHeight / 2;
          const percentage = (msgCenter / scrollHeight) * 100;
          newPositions.set(
            msg.id,
            `${Math.min(Math.max(percentage, 0), 100)}%`,
          );
        }
      });

      navPositions.value = newPositions;
    }, 300);
  };

  watch(
    () => props.userMessages.length,
    () => {
      updatePositions();
    },
  );

  watch(
    () => props.userMessages.map((m) => m.content.length),
    () => {
      updatePositions();
    },
    { deep: true },
  );

  onMounted(() => {
    updatePositions();
    const observer = new MutationObserver(() => {
      updatePositions();
    });
    const container = document.querySelector(".chat-messages");
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
      onUnmounted(() => observer.disconnect());
    }
  });

  const getNavPosition = (msgId: string) => {
    return navPositions.value.get(msgId);
  };
</script>

<template>
  <div class="message-nav">
    <div
      v-for="(msg, index) in userMessages"
      :key="msg.id"
      class="nav-item"
      :class="{ active: activeNavIndex === index }"
      :style="{ top: getNavPosition(msg.id) }"
      @click="emit('scrollToMessage', msg.id)"
      @mouseenter="hoveredNavIndex = index"
      @mouseleave="hoveredNavIndex = null"
    >
      <span class="nav-dot"></span>
      <span v-if="hoveredNavIndex === index" class="nav-tooltip">
        {{
          msg.content.length > 30
            ? msg.content.slice(0, 30) + "..."
            : msg.content
        }}
      </span>
    </div>
  </div>
</template>

<style scoped>
  .message-nav {
    width: 32px;
    position: relative;
    padding: 16px 0;
    border-left: 1px solid #e5e5e5;
    overflow-y: auto;
    height: 100%;
  }

  .nav-item {
    position: absolute;
    padding: 8px 4px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateY(-50%);
  }

  .nav-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
    transition: all 0.2s;
  }

  .nav-item:hover .nav-dot {
    background: #999;
    transform: scale(1.2);
  }

  .nav-item.active .nav-dot {
    background: #333;
    transform: scale(1.3);
  }

  .nav-tooltip {
    position: absolute;
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    background: #333;
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .nav-tooltip::after {
    content: "";
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-left: 6px solid #333;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
</style>

<style>
  .main-layout.dark .message-nav {
    border-left-color: #333;
  }

  .main-layout.dark .nav-dot {
    background: #555;
  }

  .main-layout.dark .nav-item:hover .nav-dot {
    background: #888;
  }

  .main-layout.dark .nav-item.active .nav-dot {
    background: #fff;
  }

  .main-layout.dark .nav-tooltip {
    background: #444;
    color: #fff;
  }

  .main-layout.dark .nav-tooltip::after {
    border-left-color: #444;
  }
</style>
