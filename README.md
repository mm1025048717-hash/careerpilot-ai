# 智职通 CareerPilot AI

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/DeepSeek-V3-FF6B6B?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <strong>🚀 AI 驱动的智能求职数字员工</strong><br/>
  <em>AI-Powered Intelligent Job Application Digital Employee</em>
</p>

---

## ✨ 产品亮点

**智职通 (CareerPilot AI)** 是一款革命性的 AI 求职助理，采用 **DeepSeek + Agent 双重架构**，让 AI 真正理解你的求职需求并自动执行任务。

### 🎯 核心功能

| 功能模块 | 描述 |
|---------|------|
| 💬 **智能对话** | 自然语言交互，精准理解求职意图 |
| 🤖 **自动投递** | 一键批量投递，解放双手 |
| 🧠 **长期记忆** | 记住偏好习惯，越用越懂你 |
| 📚 **知识库** | 统一管理求职资料 |
| 📊 **任务追踪** | 实时查看投递进度 |
| 🎨 **极简设计** | Apple 风格，赏心悦目 |

---

## 🏗️ 系统架构

```
┌──────────────────────────────────────────────────────────┐
│                     智职通 CareerPilot AI                 │
├──────────────────────────────────────────────────────────┤
│  Frontend                                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Tailwind CSS              │  │
│  │  Apple-style Glassmorphism Design                  │  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  Backend                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Flask API + LangChain/LangGraph                   │  │
│  │                                                    │  │
│  │  ┌──────────────────┐  ┌────────────────────────┐  │  │
│  │  │ SemanticUnder-   │  │    TaskExecutor        │  │  │
│  │  │ standing         │─▶│    (Agent Tools)       │  │  │
│  │  │ (DeepSeek V3)    │  │                        │  │  │
│  │  └──────────────────┘  └────────────────────────┘  │  │
│  │                                                    │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐   │  │
│  │  │MemorySystem│ │KnowledgeDB │ │Conversation  │   │  │
│  │  │ (长期记忆)  │ │ (知识库)    │ │Manager       │   │  │
│  │  └────────────┘ └────────────┘ └──────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  Worker                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Selenium + Browser Automation                     │  │
│  │  BOSS 直聘自动化投递                                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/careerpilot-ai.git
cd careerpilot-ai
```

### 2. 后端设置

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. 前端设置

```bash
cd frontend
npm install
```

### 4. 配置 API Key

创建 `backend/.env` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### 5. 启动服务

**终端 1 - 后端 API:**
```bash
cd backend
.\venv\Scripts\activate
python app.py
```

**终端 2 - Worker:**
```bash
cd backend
.\venv\Scripts\activate
python worker.py
```

**终端 3 - 前端:**
```bash
cd frontend
npm run dev
```

### 6. 访问应用

打开浏览器访问: **http://localhost:5173**

---

## 📁 目录结构

```
careerpilot-ai/
├── frontend/                    # 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx        # 智能对话
│   │   │   ├── History.tsx     # 历史会话
│   │   │   ├── KnowledgeBase.tsx # 知识库
│   │   │   ├── Tasks.tsx       # 任务管理
│   │   │   └── Settings.tsx    # 系统设置
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── backend/                     # 后端服务
│   ├── app.py                  # Flask API 入口
│   ├── agent.py                # AI Agent 核心
│   ├── memory.py               # 记忆系统
│   ├── knowledge_base.py       # 知识库管理
│   ├── worker.py               # 任务执行器
│   ├── config.json             # 用户配置
│   └── requirements.txt
│
├── data/                        # 数据存储
│   ├── conversations/          # 会话历史
│   ├── knowledge/              # 知识库文档
│   └── memory/                 # 记忆数据
│
└── README.md
```

---

## 🔧 环境要求

- **Node.js** >= 18.0
- **Python** >= 3.10
- **Chrome/Edge** 浏览器 (用于自动化)
- **DeepSeek API Key**

---

## 📝 使用示例

### 对话投递
```
你: 帮我投递北京的产品经理岗位，投5个
AI: 好的，我来帮你投递北京的产品经理岗位...
    ✅ 已创建投递任务，将自动投递 5 个匹配职位
```

### 知识库管理
```
你: 帮我记住我擅长用户研究和数据分析
AI: 好的，我已经记住了你的技能特长...
```

---

## 🎨 界面展示

- 🌊 **玻璃态设计** - 现代 Glassmorphism 风格
- 💙 **蓝白配色** - 清新专业的视觉体验  
- ✨ **流畅动画** - 精心打磨的交互细节
- 📱 **响应式** - 完美适配各种屏幕

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

## 📄 License

MIT License © 2025

---

<p align="center">
  <strong>智职通 CareerPilot AI</strong><br/>
  让 AI 成为你的求职导航员 🚀
</p>
