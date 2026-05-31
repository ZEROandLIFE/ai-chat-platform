# AI Chat Platform - 开发计划

## 项目概述

本项目是一个模仿DeepSeek/豆包的AI对话平台Web应用，支持多轮对话、历史记录管理、文件上传、Markdown渲染、代码高亮等功能，使用纯Mock数据实现对话逻辑。

---

### 阶段1：项目初始化与基础配置

**目标**：完成项目初始化，配置开发环境，预留后续功能扩展空间

**技术栈**：

| 分类 | 技术 | 说明 |
|:-----|:-----|:-----|
| 前端 | Vue 3.4+ | 前端框架 |
| 前端 | TypeScript | 类型系统 |
| 前端 | Vite | 构建工具 |
| 前端 | Pinia | 状态管理 |
| 前端 | Vue Router | 路由管理 |
| 前端 | marked | Markdown解析器（预留，未安装） |
| 前端 | highlight.js | 代码高亮库（预留，未安装） |
| 前端 | DOMPurify | HTML净化库（预留，未安装） |

**前端任务**：
1. 清理现有HelloWorld组件
2. 创建TypeScript类型定义文件（预留所有功能接口）
3. 配置Pinia状态管理
4. 配置Vue Router路由
5. 创建项目目录结构
6. ~~安装Markdown渲染相关依赖（marked, highlight.js, dompurify）~~

**目录结构**：
```
frontend/src/
├── components/
│   ├── chat/           # 预留
│   ├── sidebar/        # 预留
│   ├── common/         # 预留
│   └── markdown/       # 预留
├── views/
│   └── layout/
│       └── MainLayout.vue   # 主布局组件
├── stores/
│   ├── theme.ts        # ✅ 主题状态管理
│   ├── chat.ts         # ✅ 对话状态管理
│   └── index.ts        # ✅ Store导出
├── types/
│   ├── chat.ts         # ✅ Message、Conversation、ChatState、MOCK_RESPONSES
│   ├── theme.ts        # ✅ ThemeState
│   ├── model.ts        # ✅ Model、AVAILABLE_MODELS
│   ├── common.ts       # ✅ UploadedFile、generateId、generateConversationTitle
│   └── index.ts        # ✅ 类型导出
├── styles/
│   └── style.css       # ✅ 全局样式
├── utils/              # 预留（阶段3实现）
├── router/
│   └── index.ts        # ✅ Vue Router配置
└── App.vue             # ✅ 根组件
```

**已创建文件**：

| 文件路径 | 说明 |
|:---------|:-----|
| stores/theme.ts | 主题状态管理（useThemeStore）- 包含mode、toggleTheme、setTheme |
| stores/chat.ts | 对话状态管理（useChatStore）- 包含对话CRUD、消息发送、Mock回复、流式效果、停止生成等 |
| stores/index.ts | Store统一导出 |
| types/chat.ts | Message、Conversation、ChatState、MOCK_RESPONSES（4种）、EXAMPLE_QUESTIONS |
| types/theme.ts | ThemeState |
| types/model.ts | Model、AVAILABLE_MODELS（3种模型） |
| types/common.ts | UploadedFile、generateId、generateConversationTitle |
| types/index.ts | 类型统一导出 |
| router/index.ts | Vue Router配置（根路径→MainLayout） |
| views/layout/MainLayout.vue | 主布局组件（侧边栏+聊天区域+消息展示） |
| style.css | 全局样式（日间/夜间主题CSS变量） |
| main.ts | 应用入口（Pinia+Router配置） |
| App.vue | 根组件 |

**数据模型**：

```typescript
// types/chat.ts
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  isEdited?: boolean;
  quotedMessage?: Message;
  isStopped?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

interface ChatState {
  currentConversationId: string | null;
  conversations: Conversation[];
  isLoading: boolean;
  isGenerating: boolean;
  quotedMessage: Message | null;
  editingMessageId: string | null;
}

// types/theme.ts
interface ThemeState {
  mode: 'light' | 'dark';
}

// types/model.ts
interface Model {
  id: string;
  name: string;
  description: string;
}

// types/common.ts
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadTime: Date;
}
```

**功能特性**：
- Vue3 + TypeScript项目架构
- 组件化开发结构
- Pinia状态管理（useThemeStore、useChatStore）
- Vue Router路由配置
- 类型文件分类管理（chat/theme/model/common）
- 预留Markdown渲染、代码高亮、消息引用等功能的类型定义
- 基础UI布局（侧边栏+聊天区域）
- 日间/夜间主题切换
- 新建对话、历史记录切换
- 对话标题自动生成（仅默认标题时）
- Mock数据回复（4种不同回复）
- localStorage持久化（对话+主题）
- 打字机效果（前端模拟）
- 停止生成功能

**完成状态**：已完成

---

### 阶段2：布局与主题系统

**目标**：实现整体布局框架和日间/夜间主题切换

**前端任务**：

1. 创建主布局组件
2. 创建侧边栏组件（集成在MainLayout.vue中，未拆分）
3. 创建头部组件（集成在MainLayout.vue中，未拆分）
4. 实现主题切换功能
5. 创建主题Store（stores/theme.ts）

**布局结构**：
```
┌─────────────────────────────────────────┐
│  Header (☰ + 新建对话 + AI Chat)        │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │      Chat Messages Area          │
│ bar  │      (可滚动对话消息列表)          │
│      │                                  │
│      ├──────────────────────────────────┤
│      │  Input Area (输入框 + 发送按钮)  │
└──────┴──────────────────────────────────┘
```

**侧边栏功能**：
- 新建对话按钮
- 历史对话列表
- 对话标题编辑（双击或点击编辑按钮）
- 删除对话按钮
- 模型选择下拉框（预留UI，未实现）
- 文件上传按钮（预留UI，未实现）
- 主题切换按钮

**主题系统**：
- 日间模式：白色背景 (#ffffff) + 黑色文字
- 夜间模式：深灰背景 (#1a1a1a) + 白色文字
- 侧边栏日间：浅灰背景 (#f8f9fa)
- 侧边栏夜间：深灰背景 (#1e1e1e)
- 主题切换使用Emoji（☀️/🌙）
- 本地存储主题偏好（localStorage）

**实现细节**：

```typescript
// stores/theme.ts
export const useThemeStore = defineStore('theme', () => {
  const mode = ref<'light' | 'dark'>(
    (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
  };

  watch(mode, (newMode) => {
    localStorage.setItem('theme-mode', newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  }, { immediate: true });

  return { mode, toggleTheme, setTheme };
});
```

```css
/* style.css */
:root {
  color-scheme: light dark;
}

.main-layout {
  background: #ffffff;
  color: #000000;
}

.main-layout.dark {
  background: #1a1a1a;
  color: #ffffff;
}
```

**功能特性**：
- 左侧固定侧边栏（可收起）
- 右侧对话主区域
- 日间/夜间主题切换
- 响应式布局
- 主题状态持久化
- 对话标题可编辑（双击或编辑按钮）
- 侧边栏收起时Header显示新建对话按钮
- 收起侧边栏时显示折叠按钮
- 历史对话列表（点击切换）
- 消息气泡展示（用户右对齐/AI左对齐）
- 消息时间戳显示
- 输入框+发送按钮
- Enter发送消息

**组件结构（实际）**：

| 组件 | 文件 | 说明 |
|:-----|:-----|:-----|
| MainLayout | views/layout/MainLayout.vue | 主布局（包含所有UI） |
| Sidebar | - | 集成在MainLayout中 |
| Header | - | 集成在MainLayout中 |
| ChatMessages | - | 集成在MainLayout中 |
| ChatInput | - | 集成在MainLayout中 |

**完成状态**：已完成

---

### 阶段3：Mock API与拦截器

**目标**：建立独立的Mock数据层、API服务、请求拦截器，实现流式Mock响应

**前置条件**：需要在阶段4对话核心之前完成，因为对话功能依赖API层

**前端任务**：

1. 创建独立的Mock数据文件（utils/mockData.ts）
2. 创建Mock API服务（utils/mockApi.ts）
3. 创建请求拦截器（utils/interceptor.ts）
4. 创建API类型定义（types/api.ts）
5. 实现流式Mock响应（模拟SSE）
6. 创建API统一导出（utils/api.ts）

**目录结构**：
```
frontend/src/
├── utils/
│   ├── mockData.ts      # Mock数据（4种回复内容）
│   ├── mockApi.ts       # Mock API服务（chat/completion接口）
│   ├── interceptor.ts   # 请求/响应拦截器
│   └── api.ts           # API统一导出
├── types/
│   └── api.ts           # API相关类型定义
```

**Mock数据类型**：

```typescript
// types/api.ts
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason?: string;
  }[];
}
```

**Mock数据文件**：

```typescript
// utils/mockData.ts
export const MOCK_RESPONSES: string[] = [
  `你好！我是AI助手。我可以帮你解答各种问题。

## 功能特性

- **代码示例**：我可以展示代码
- **列表支持**：支持有序和无序列表
- **引用块**：可以引用内容

### 代码示例

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\``,

  `这是一个不同的回复示例。

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\``
];

export const EXAMPLE_QUESTIONS: string[] = [
  '如何学习编程？',
  '解释一下什么是机器学习',
  '写一个Python快速排序算法',
  '如何提高工作效率？'
];
```

**Mock API服务**：

```typescript
// utils/mockApi.ts
import type { ChatCompletionRequest, StreamChunk } from '../types/api';
import { MOCK_RESPONSES } from './mockData';

export async function chatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

  return {
    id: 'mock-' + Date.now(),
    model: request.model || 'gpt-3.5',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: randomResponse
      },
      finish_reason: 'stop'
    }]
  };
}

export async function* chatCompletionStream(
  request: ChatCompletionRequest
): AsyncGenerator<StreamChunk> {
  const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  const chunkSize = 10; // 每chunk字符数
  const delay = 50; // ms延迟

  for (let i = 0; i < response.length; i += chunkSize) {
    const chunkContent = response.slice(i, i + chunkSize);
    yield {
      id: 'mock-' + Date.now(),
      choices: [{
        index: 0,
        delta: { content: chunkContent }
      }]
    };

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  yield {
    id: 'mock-' + Date.now(),
    choices: [{
      index: 0,
      delta: {},
      finish_reason: 'stop'
    }]
  };
}
```

**拦截器逻辑**：

```typescript
// utils/interceptor.ts
class InterceptorManager {
  private requestInterceptors: Function[] = [];
  private responseInterceptors: Function[] = [];

  useRequestInterceptor(fn: Function) {
    this.requestInterceptors.push(fn);
  }

  useResponseInterceptor(fn: Function) {
    this.responseInterceptors.push(fn);
  }

  async interceptRequest(config: any) {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  async interceptResponse(response: any) {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }
}

export const interceptorManager = new InterceptorManager();

// 日志拦截器示例
interceptorManager.useRequestInterceptor((config: any) => {
  console.log('[Request]', config);
  return config;
});

interceptorManager.useResponseInterceptor((response: any) => {
  console.log('[Response]', response);
  return response;
});
```

**流式Mock响应原理**：

```
chatStore.sendMessage("你好")
        ↓
mockApi.chatCompletionStream(request)
        ↓
for...of循环 + yield + setTimeout
        ↓
逐chunk返回: "你好！..." → "我是..." → "AI..." → "助手..."
        ↓
ChatStore逐chunk更新消息内容
        ↓
前端显示打字机效果
```

**功能特性**：
- 独立的Mock数据文件
- 统一的API服务层
- 请求/响应拦截器
- 支持流式和非流式两种Mock模式
- 流式Mock使用async generator实现
- 模拟真实API的响应格式
- 便于后续替换为真实API

**完成状态**：已完成

---

### 阶段4：对话核心功能

**目标**：实现对话消息展示、发送、流式Mock回复功能

**前置条件**：依赖阶段3 Mock API层

**前端任务**：

1. 创建消息气泡组件
2. 创建消息列表组件
3. 创建输入框组件
4. 创建加载动画组件
5. 更新对话Store调用Mock API
6. 实现流式消息更新
7. 实现滚动到底部功能
8. 实现停止生成功能

**数据流**：

```
用户发送消息
    ↓
ChatStore.sendMessage()
    ↓
chatCompletionStream() from Mock API
    ↓
for...of 逐chunk获取数据
    ↓
更新消息内容 (isStreaming: true)
    ↓
前端实时显示打字效果
    ↓
完成时 isStreaming: false
```

**功能特性**：
- 消息发送与展示
- 用户消息右对齐，AI消息左对齐
- 消息时间戳显示
- 流式AI回复（打字机效果）
- 自动滚动到最新消息
- 支持Enter发送
- 发送时输入框禁用
- 停止生成功能
- 右侧消息导航栏（DeepSeek风格）
  - 显示用户提问坐标点
  - 鼠标悬停显示问题预览
  - 点击跳转对应消息位置
  - 滚动时高亮当前位置

**完成状态**：已完成

---

### 阶段5：历史记录与文件功能

**目标**：实现对话历史管理、新建对话、文件上传功能

**前端任务**：

1. 创建历史对话列表组件
2. 创建新建对话按钮组件
3. 创建模型选择组件
4. 创建文件上传组件
5. 实现对话历史持久化
6. 实现新建对话功能
7. 实现切换对话功能
8. 实现删除对话功能
9. 实现文件上传UI（仅UI，无实际上传）

**数据模型**：

```typescript
const AVAILABLE_MODELS: Model[] = [
  { id: 'gpt-4', name: 'GPT-4', description: '最强大的模型' },
  { id: 'gpt-3.5', name: 'GPT-3.5', description: '快速响应' },
  { id: 'claude', name: 'Claude', description: '安全可靠' }
];
```

**功能特性**：
- 新建对话
- 历史对话列表展示
- 切换历史对话
- 删除历史对话
- 对话标题自动生成（基于首条消息，仅默认标题时）
- 模型选择下拉框
- 文件上传按钮（仅UI展示）
- 已上传文件列表展示
- localStorage持久化存储

**完成状态**：未完成

---

### 阶段6：Markdown渲染与代码高亮

**目标**：实现AI回复的Markdown渲染和代码块语法高亮

**前端任务**：

1. 创建Markdown渲染组件
2. 创建代码块组件
3. 配置marked解析器
4. 配置highlight.js代码高亮
5. 配置DOMPurify防XSS攻击
6. 实现Markdown样式
7. 实现代码块复制功能
8. 更新Mock数据包含Markdown内容

**Markdown支持**：
- 标题（h1-h6）
- 列表（有序、无序）
- 代码块（带语法高亮）
- 行内代码
- 加粗、斜体
- 引用块
- 表格
- 链接

**代码高亮支持**：
- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- HTML/CSS
- SQL
- Shell
- JSON/YAML

**功能特性**：
- Markdown实时渲染
- 代码块语法高亮
- 代码块一键复制
- XSS防护
- 自定义Markdown样式
- 适配日间/夜间主题

**完成状态**：未完成

---

### 阶段7：欢迎页面与引导界面

**目标**：实现首次进入的欢迎页面和功能引导

**前端任务**：

1. 创建欢迎页面组件
2. 创建功能卡片组件
3. 创建欢迎消息组件
4. 实现欢迎页面显示逻辑
5. 实现示例问题快捷输入
6. 更新路由配置

**欢迎页面内容**：
- Logo和欢迎标题
- 功能介绍卡片（3-4个）
- 示例问题列表（可点击快速提问）
- 开始对话按钮

**功能特性**：
- 首次访问显示欢迎页面
- 功能介绍展示
- 示例问题快速提问
- 有对话记录后隐藏欢迎页面
- 可从侧边栏重新进入欢迎页面

**完成状态**：未完成

---

### 阶段8：高级交互功能

**目标**：实现重新生成、消息编辑、消息引用等高级交互功能

**前置条件**：依赖阶段4对话核心和阶段6 Markdown渲染

**前端任务**：

1. 创建重新生成按钮组件
2. 创建消息编辑组件
3. 创建消息引用组件
4. 更新消息气泡组件（添加操作按钮）
5. 更新ChatStore（添加相关状态和方法）
6. 实现重新生成逻辑
7. 实现消息编辑逻辑
8. 实现消息引用逻辑

**功能详解**：

#### 重新生成
- AI消息下方显示"重新生成"按钮
- 点击后删除当前AI回复
- 重新发送最后一条用户消息
- 生成新的AI回复（使用流式）

#### 消息编辑
- 用户消息下方显示"编辑"按钮
- 点击后消息变为可编辑状态
- 编辑后可重新发送
- 删除该消息之后的所有消息

#### 消息引用
- 消息下方显示"引用"按钮
- 点击后在输入框上方显示引用内容
- 发送消息时附带引用信息
- 引用的消息在对话中高亮显示

**功能特性**：
- 重新生成回复（流式）
- 编辑已发送消息
- 引用历史消息
- 消息操作按钮（hover显示）
- 操作确认提示

**完成状态**：未完成

---

### 阶段9：优化与完善

**目标**：优化用户体验，完善细节功能

**前端任务**：

1. 添加消息复制功能
2. 添加清空当前对话功能
3. 优化加载状态显示
4. 添加错误处理
5. 优化移动端适配
6. 添加快捷键支持
7. 性能优化
8. 添加搜索历史对话功能
9. 添加对话导出功能

**功能特性**：
- 一键复制消息内容
- 清空当前对话
- 错误提示友好
- 移动端响应式适配
- 快捷键支持（Ctrl+N新建，Ctrl+Enter发送等）
- 消息列表虚拟滚动（如果消息过多）
- 搜索历史对话
- 导出对话为Markdown文件

**完成状态**：未完成

---

## 验收标准

### 功能验收
- [ ] 可以新建对话
- [ ] 可以发送消息并收到Mock回复
- [ ] 可以查看历史对话列表
- [ ] 可以切换历史对话
- [ ] 可以删除历史对话
- [ ] 可以切换日间/夜间主题
- [ ] 可以选择不同模型
- [ ] 可以上传文件（UI展示）
- [ ] 消息列表正确滚动
- [ ] Markdown正确渲染
- [ ] 代码块语法高亮
- [ ] 代码块可以复制
- [ ] 欢迎页面正常显示
- [ ] 可以停止生成
- [ ] 可以重新生成
- [ ] 可以编辑消息
- [ ] 可以引用消息

### UI验收
- [ ] 左侧侧边栏正常显示
- [ ] 布局符合DeepSeek/豆包风格
- [ ] 日间/夜间主题切换正常
- [ ] 响应式布局适配不同屏幕
- [ ] 动画流畅自然
- [ ] Markdown样式美观
- [ ] 代码高亮清晰

---

## 注意事项

1. **纯Mock数据**：所有对话回复均为固定内容，不连接真实API
2. **主题系统**：只使用白色和黑色，实现日间/夜间模式
3. **文件上传**：仅实现UI展示，不实际上传文件
4. **代码规范**：使用TypeScript，组件采用Composition API
5. **状态持久化**：使用localStorage存储对话历史和主题偏好
6. **Markdown安全**：使用DOMPurify防止XSS攻击
7. **扩展性**：所有数据模型和组件设计预留扩展空间
8. **流式响应**：使用async generator实现模拟流式，无需后端支持
