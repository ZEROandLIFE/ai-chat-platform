import { marked } from "marked";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

export function renderMarkdown(content: string): string {
  const rawHtml = marked.parse(content) as string;
  return DOMPurify.sanitize(rawHtml);
}

export { hljs };
