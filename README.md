# AI Chat Platform

一个模仿DeepSeek/豆包的AI对话平台Web应用，支持多轮对话、历史记录管理、文件上传、Markdown渲染、代码高亮等功能。

## 技术栈

| 分类 | 技术 | 说明 |
|:-----|:-----|:-----|
| 前端 | Vue 3.4+ | 前端框架 |
| 前端 | TypeScript | 类型系统 |
| 前端 | Vite | 构建工具 |
| 前端 | Pinia | 状态管理 |
| 前端 | Vue Router | 路由管理 |
| 前端 | marked | Markdown解析器 |
| 前端 | highlight.js | 代码高亮库 |
| 前端 | DOMPurify | HTML净化库 |

## 功能特性

### 核心功能
- ✅ 多轮对话支持
- ✅ 流式AI回复（打字机效果）
- ✅ 停止生成功能
- ✅ 重新生成回复

### 消息操作
- ✅ 引用历史消息
- ✅ 复制消息内容
- ✅ 删除消息

### 历史记录
- ✅ 新建对话
- ✅ 切换历史对话
- ✅ 删除对话
- ✅ 对话标题自动生成
- ✅ localStorage持久化

### 主题系统
- ✅ 日间/夜间主题切换
- ✅ 主题状态持久化

### Markdown渲染
- ✅ Markdown实时渲染
- ✅ 代码块语法高亮
- ✅ 代码块一键复制
- ✅ XSS防护

### 文件上传
- ✅ 文件上传按钮（UI展示）
- ✅ 已上传文件列表展示

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
frontend/src/
├── components/
│   ├── ChatMessages.vue      # 消息列表组件
│   ├── ChatInputArea.vue     # 输入区域组件
│   ├── MessageItem.vue       # 消息气泡组件
│   ├── MessageActions.vue    # 消息操作组件
│   ├── MessageNav.vue        # 消息导航组件
│   ├── MarkdownRenderer.vue  # Markdown渲染组件
│   └── CodeBlock.vue         # 代码块组件
├── views/
│   └── layout/
│       └── MainLayout.vue    # 主布局组件
├── stores/
│   ├── theme.ts              # 主题状态管理
│   ├── chat.ts               # 对话状态管理
│   └── index.ts              # Store导出
├── types/
│   ├── chat.ts               # 对话相关类型
│   ├── theme.ts              # 主题类型
│   ├── model.ts              # 模型类型
│   ├── common.ts             # 通用类型
│   └── index.ts              # 类型导出
├── utils/
│   ├── mockData.ts           # Mock数据
│   ├── mockApi.ts            # Mock API服务
│   ├── interceptor.ts        # 请求拦截器
│   └── markdown.ts           # Markdown工具
├── router/
│   └── index.ts              # Vue Router配置
├── styles/
│   └── style.css             # 全局样式
├── App.vue                   # 根组件
└── main.ts                   # 应用入口
```

## 开发计划

| 阶段 | 功能 | 状态 |
|:-----|:-----|:-----|
| 阶段1 | 项目初始化与基础配置 | ✅ 已完成 |
| 阶段2 | 布局与主题系统 | ✅ 已完成 |
| 阶段3 | Mock API与拦截器 | ✅ 已完成 |
| 阶段4 | 对话核心功能 | ✅ 已完成 |
| 阶段5 | 历史记录与文件功能 | ✅ 已完成 |
| 阶段6 | Markdown渲染与代码高亮 | ✅ 已完成 |
| 阶段7 | AI生成控制（暂停/继续） | ✅ 已完成 |
| 阶段8 | 高级交互功能（重新生成、引用、复制、删除） | ✅ 已完成 |
| 阶段9 | 文件预览面板（右侧预览、文件点击预览） | ⏳ 待实现 |
| 阶段10 | 文档渲染引擎（分页、缩放、工具栏） | ⏳ 待实现 |
| 阶段11 | 划词提问功能（文本选中、浮动菜单、带入对话） | ⏳ 待实现 |

## 注意事项

1. **纯Mock数据**：所有对话回复均为固定内容，不连接真实API
2. **主题系统**：支持日间/夜间模式切换
3. **文件上传**：仅实现UI展示，不实际上传文件
4. **代码规范**：使用TypeScript，组件采用Composition API
5. **状态持久化**：使用localStorage存储对话历史和主题偏好
6. **Markdown安全**：使用DOMPurify防止XSS攻击
7. **流式响应**：使用async generator实现模拟流式回复
