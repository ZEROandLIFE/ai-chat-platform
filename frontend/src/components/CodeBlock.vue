<script setup lang="ts">
import { ref, onMounted } from "vue";
import { hljs } from "../utils/markdown";

const props = defineProps<{
  code: string;
  language?: string;
}>();

const codeRef = ref<HTMLElement | null>(null);
const copied = ref(false);

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};

onMounted(() => {
  if (codeRef.value) {
    codeRef.value.innerHTML = props.language
      ? hljs.highlight(props.code, { language: props.language }).value
      : hljs.highlightAuto(props.code).value;
  }
});
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ language || "code" }}</span>
      <button class="copy-btn" @click="copyCode">
        {{ copied ? "已复制" : "复制" }}
      </button>
    </div>
    <pre><code ref="codeRef" :class="language ? `language-${language}` : ''">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
  border: 1px solid #333;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.code-lang {
  font-size: 12px;
  color: #888;
  text-transform: lowercase;
}

.copy-btn {
  padding: 4px 12px;
  background: #404040;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #505050;
}

pre {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
}

code {
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #e0e0e0;
}
</style>
