<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useThemeStore } from "../../stores/theme";
  import { useChatStore } from "../../stores/chat";
  import Sidebar from "../../components/Sidebar.vue";
  import ChatHeader from "../../components/ChatHeader.vue";
  import ChatMessages from "../../components/ChatMessages.vue";
  import ChatInputArea from "../../components/ChatInputArea.vue";

  const themeStore = useThemeStore();
  const chatStore = useChatStore();

  const sidebarCollapsed = ref(false);
  const activeNavIndex = ref<number | null>(null);

  const userMessages = computed(() => {
    return chatStore.currentMessages.filter((msg) => msg.role === "user");
  });

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const updateActiveNavIndex = (index: number) => {
    activeNavIndex.value = index;
  };
</script>

<template>
  <div class="main-layout" :class="{ dark: themeStore.mode === 'dark' }">
    <Sidebar :collapsed="sidebarCollapsed" />
    <div class="chat-area">
      <ChatHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
      <ChatMessages
        :user-messages="userMessages"
        :active-nav-index="activeNavIndex"
        @update-active-nav-index="updateActiveNavIndex"
      />
      <ChatInputArea />
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

  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
