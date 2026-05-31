<script setup lang="ts">
  import { computed } from "vue";
  import { renderMarkdown } from "../utils/markdown";

  const props = defineProps<{
    content: string;
  }>();

  const renderedContent = computed(() => {
    return renderMarkdown(props.content);
  });
</script>

<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<style>
  .markdown-content {
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    line-height: 1.3;
  }

  .markdown-content h1 {
    font-size: 1.5em;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 8px;
  }

  .markdown-content h2 {
    font-size: 1.3em;
  }

  .markdown-content h3 {
    font-size: 1.15em;
  }

  .markdown-content p {
    margin: 8px 0;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  .markdown-content li {
    margin: 4px 0;
  }

  .markdown-content code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "Fira Code", "Consolas", "Monaco", monospace;
    font-size: 0.9em;
  }

  .main-layout.dark .markdown-content code {
    background: #2d2d2d;
  }

  .markdown-content pre {
    margin: 12px 0;
    padding: 12px;
    background: #1e1e1e;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #333;
  }

  .markdown-content pre code {
    background: transparent;
    padding: 0;
    color: #e0e0e0;
  }

  .markdown-content blockquote {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid #ddd;
    background: #f9f9f9;
    color: #666;
  }

  .main-layout.dark .markdown-content blockquote {
    background: #252525;
    border-left-color: #444;
    color: #aaa;
  }

  .markdown-content a {
    color: #0066cc;
    text-decoration: none;
  }

  .markdown-content a:hover {
    text-decoration: underline;
  }

  .main-layout.dark .markdown-content a {
    color: #66b3ff;
  }

  .markdown-content table {
    margin: 12px 0;
    border-collapse: collapse;
    width: 100%;
  }

  .markdown-content th,
  .markdown-content td {
    border: 1px solid #e5e5e5;
    padding: 8px 12px;
    text-align: left;
  }

  .main-layout.dark .markdown-content th,
  .main-layout.dark .markdown-content td {
    border-color: #404040;
  }

  .markdown-content th {
    background: #f5f5f5;
    font-weight: 600;
  }

  .main-layout.dark .markdown-content th {
    background: #2d2d2d;
  }

  .markdown-content hr {
    margin: 16px 0;
    border: none;
    border-top: 1px solid #e5e5e5;
  }

  .main-layout.dark .markdown-content hr {
    border-top-color: #404040;
  }

  .markdown-content strong {
    font-weight: 600;
  }

  .markdown-content em {
    font-style: italic;
  }

  .markdown-content img {
    max-width: 100%;
    border-radius: 4px;
  }
</style>
