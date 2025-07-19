# 🚀 ChunRAG

<div align="center">

![ChunRAG Logo](https://img.shields.io/badge/ChunRAG-AI%20Document%20Assistant-blue?style=for-the-badge&logo=robot)

**Your Intelligent Document Chat Assistant Powered by Advanced RAG Technology** 🤖📚

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)](https://www.javascript.com/)
[![Electron](https://img.shields.io/badge/Electron-Ready-9feaf9?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![RAG](https://img.shields.io/badge/RAG-Powered-purple?style=flat-square)](https://github.com/Chungus1310/ChunRAG)

---

*Upload documents, chat with your content, or have general AI conversations with multiple provider support!*

[🚀 Quick Start](#-quick-start) • 
[✨ Features](#-features) • 
[📖 Documentation](#-documentation) • 
[🛠️ Installation](#️-installation) • 
[🤝 Contributing](#-contributing)

</div>

---

## 🎯 What is ChunRAG?

ChunRAG is a **powerful web application** that seamlessly combines **Retrieval-Augmented Generation (RAG)** capabilities with a flexible **multi-provider LLM system**. Whether you want to chat with your documents or have general AI conversations, ChunRAG has got you covered! 
<img width="1920" height="926" alt="{78B54677-C17E-4091-88FD-551EAD1CAA05}" src="https://github.com/user-attachments/assets/15642682-306c-4090-a16a-256d7522fcda" />
<details>
<summary>🎬 <strong>See ChunRAG in Action</strong></summary>

```
🏠 Upload your documents → 📄 AI processes & indexes them → 💬 Chat naturally → 🎯 Get accurate, context-aware answers!
```
<img width="1920" height="920" alt="{AD1315E5-0A1C-4D9E-9042-C1369FC70B5C}" src="https://github.com/user-attachments/assets/ce824be5-dadc-4e08-8aef-086c25ba566a" />
<img width="1920" height="922" alt="{11F07E20-C03C-41AF-B582-DB1863AF3B63}" src="https://github.com/user-attachments/assets/d343cea5-41be-46dd-a53c-145c64455b48" />
<img width="1920" height="918" alt="{26C1553D-ABD5-4AEA-95B6-5AC530456880}" src="https://github.com/user-attachments/assets/3ddde3e0-0f64-42c0-9ac0-d86158af55b7" />
<img width="1920" height="926" alt="{78B54677-C17E-4091-88FD-551EAD1CAA05}" src="https://github.com/user-attachments/assets/15642682-306c-4090-a16a-256d7522fcda" />
</details>

---

## ✨ Features

<table>
<tr>
<td>

### 🧠 **AI & RAG Powers**
- 🤖 **Multiple AI Providers**: Gemini, OpenRouter, Cohere, Mistral, HuggingFace, NVIDIA, Chutes, Requesty
- 📚 **Document Intelligence**: Upload & chat with TXT, MD, CSV, PDF, DOCX files
- 🔍 **Smart Context Search**: Advanced vector-based document retrieval  
- ⚡ **Real-time Processing**: Instant document indexing and chat responses
- 🎛️ **Parameter Control**: Fine-tune temperature, tokens, top-p, and more

</td>
<td>

### 🎨 **User Experience** 
- 🌈 **Beautiful Themes**: Quantum, Dusk, Latte, Matrix, Neon, Forest, Odyssey
- 📱 **Responsive Design**: Perfect on desktop, tablet, and mobile
- 🗂️ **Document Management**: Upload, view, and delete documents easily
- 💾 **Chat Export**: Save conversations as JSON files
- ⚙️ **System Prompts**: Customize AI behavior for specific use cases

</td>
</tr>
</table>

### 🔧 **Technical Highlights**

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| **🔄 API Key Rotation** | Automatic failover across multiple API keys | ✅ |
| **📊 Vector Database** | Vectra-powered local document indexing | ✅ |
| **🖥️ Electron App** | Cross-platform desktop application | ✅ |
| **🌐 Web Interface** | Modern, responsive web UI | ✅ |
| **🔐 Secure Storage** | Local API key encryption | ✅ |
| **📝 Markdown Support** | Rich text rendering with syntax highlighting | ✅ |

</div>

---

## 🚀 Quick Start

### 📦 **Option 1: Download & Run** *(Recommended)*

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chungus1310/ChunRAG.git
   cd ChunRAG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### 🖥️ **Option 2: Electron Desktop App**

```bash
# Development mode
npm run electron-dev

# Build for production
npm run build-win
```

---

## 🛠️ Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- Modern web browser

### Detailed Setup

<details>
<summary>📋 <strong>Step-by-step Installation</strong></summary>

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chungus1310/ChunRAG.git
   cd ChunRAG
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys** *(Optional - can be done via UI)*
   - Get API keys from your preferred providers:
     - [Google AI Studio](https://aistudio.google.com/) (Gemini)
     - [OpenRouter](https://openrouter.ai/)
     - [Cohere](https://cohere.ai/)
     - [Mistral AI](https://mistral.ai/)
     - [HuggingFace](https://huggingface.co/)
     - [NVIDIA NIM](https://build.nvidia.com/)

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Web: `http://localhost:3000`
   - Electron: `npm run electron`

</details>

---

## 📖 Documentation

### 🏗️ **Architecture**

ChunRAG follows a **modular architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Express       │    │   LLM Manager   │
│   (React-like)  │◄──►│    Server        │◄──►│   (Multi API)   │
│   - Chat UI     │    │   - File Upload  │    │   - Rotation    │
│   - Settings    │    │   - RAG Engine   │    │   - Fallback    │
│   - Themes      │    │   - Vector DB    │    │   - Rate Limit  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🔧 **Core Components**

<details>
<summary><strong>📁 File Structure</strong></summary>

```
ChunRAG/
├── 📁 public/                  # Frontend assets
│   ├── 🎨 styles.css          # Main stylesheet with themes
│   ├── ⚡ script.js           # Frontend JavaScript
│   ├── 🎭 animations.css      # Animations and effects
│   └── 🏠 index.html          # Main HTML file
├── 🧠 server.js               # Express server & RAG engine
├── 🔄 llm_rotation.js         # Multi-provider LLM manager
├── 🖥️ electron-main.cjs       # Electron main process
├── 📦 package.json            # Dependencies and scripts
├── 📁 data/                   # Application data
│   ├── 🔑 apiKeys.json        # Encrypted API keys
│   ├── 📄 documents.json      # Document metadata
│   └── ⚙️ modelParameters.json # AI model settings
├── 📁 uploads/                # Uploaded documents
└── 📁 vector_index/           # Vectra vector database
```

</details>


### 🤖 <span style="font-size:1.2em">Supported AI Providers & Models</span>

<details>
<summary><strong>🟡 Gemini (Google)</strong></summary>

<ul>
<li>gemini-2.5-pro</li>
<li>gemini-2.5-flash</li>
<li>gemini-1.5-pro</li>
<li>gemini-1.5-flash</li>
<li>gemini-2.0-flash</li>
<li>gemini-2.0-flash-lite</li>
<li>learnlm-2.0-flash-experimental</li>
</ul>
</details>

<details>
<summary><strong>🔄 OpenRouter</strong></summary>

<ul>
<li>microsoft/mai-ds-r1:free</li>
<li>arliai/qwq-32b-arliai-rpr-v1:free</li>
<li>deepseek/deepseek-chat-v3-0324:free</li>
<li>deepseek/deepseek-r1:free</li>
<li>rekaai/reka-flash-3:free</li>
<li>moonshotai/moonlight-16b-a3b-instruct:free</li>
<li>cognitivecomputations/dolphin3.0-mistral-24b:free</li>
<li>tngtech/deepseek-r1t-chimera:free</li>
<li>minimax/minimax-m1:extended</li>
</ul>
</details>

<details>
<summary><strong>🤗 HuggingFace</strong></summary>

<ul>
<li>meta-llama/Llama-3.3-70B-Instruct</li>
<li>deepseek-ai/DeepSeek-V3-0324</li>
<li>alpindale/WizardLM-2-8x22B</li>
<li>cognitivecomputations/dolphin-2.9.2-mixtral-8x22b</li>
<li>HuggingFaceH4/zephyr-7b-beta</li>
<li>Sao10K/L3-8B-Stheno-v3.2</li>
<li>Sao10K/L3-8B-Lunaris-v1</li>
</ul>
</details>

<details>
<summary><strong>🌬️ Mistral</strong></summary>

<ul>
<li>mistral-large-latest</li>
<li>mistral-medium-latest</li>
<li>mistral-small-latest</li>
<li>magistral-medium-latest</li>
<li>magistral-small-latest</li>
<li>open-mistral-nemo</li>
</ul>
</details>

<details>
<summary><strong>🔵 Cohere</strong></summary>

<ul>
<li>command-a-03-2025</li>
<li>command-r7b-12-2024</li>
<li>command-r-plus-08-2024</li>
<li>command-r-08-2024</li>
<li>command-nightly</li>
</ul>
</details>

<details>
<summary><strong>🟢 NVIDIA</strong></summary>

<ul>
<li>nvidia/llama-3.3-nemotron-super-49b-v1</li>
<li>nvidia/llama-3.1-nemotron-ultra-253b-v1</li>
<li>meta/llama-4-scout-17b-16e-instruct</li>
<li>meta/llama-4-maverick-17b-128e-instruct</li>
<li>writer/palmyra-creative-122b</li>
<li>qwen/qwq-32b</li>
<li>meta/llama-3.3-70b-instruct</li>
<li>01-ai/yi-large</li>
<li>mistralai/mixtral-8x22b-instruct-v0.1</li>
<li>deepseek-ai/deepseek-r1</li>
<li>qwen/qwen3-235b-a22b</li>
</ul>
</details>

<details>
<summary><strong>🪂 Chutes</strong></summary>

<ul>
<li>deepseek-ai/DeepSeek-R1</li>
<li>ArliAI/QwQ-32B-ArliAI-RpR-v1</li>
<li>microsoft/MAI-DS-R1-FP8</li>
<li>tngtech/DeepSeek-R1T-Chimera</li>
<li>tencent/Hunyuan-A13B-Instruct</li>
<li>Qwen/Qwen3-235B-A22B</li>
<li>chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8</li>
<li>MiniMaxAI/MiniMax-M1-80k</li>
<li>moonshotai/Kimi-K2-Instruct</li>
</ul>
</details>

<details>
<summary><strong>❓ Requesty</strong></summary>

Flexible provider for custom endpoints and routing.
</details>


---

## 💡 FAQ

<details>
<summary><strong>How do I add my own API keys?</strong></summary>
You can add API keys for each provider in the Settings page of the app. Keys are encrypted and stored locally.
</details>

<details>
<summary><strong>What document formats are supported?</strong></summary>
TXT, MD, CSV, PDF, DOCX.
</details>

<details>
<summary><strong>Can I use ChunRAG offline?</strong></summary>
You can use ChunRAG locally for document chat and general AI, but API calls require internet access.
</details>

<details>
<summary><strong>Is there a desktop app?</strong></summary>
Yes! ChunRAG is available as an Electron desktop app for Windows.
</details>


---

## 🎨 Customization

### 🌈 **Themes**

ChunRAG comes with **7 beautiful themes**:

<div align="center">

| Theme | Colors | Vibe |
|-------|--------|------|
| **⚛️ Quantum** | Blue & Purple | *Modern & Clean* |
| **🌅 Dusk** | Orange & Pink | *Warm & Cozy* |
| **☕ Latte** | Beige & Brown | *Comfortable & Natural* |
| **🌌 Odyssey** | Purple & Gold | *Luxurious & Space-like* |

</div>

### ⚙️ **Model Parameters**

Fine-tune AI behavior with these parameters:

- **🌡️ Temperature** (0.0-1.0): Control randomness
- **🎯 Top-P** (0.0-1.0): Nucleus sampling  
- **📏 Max Tokens** (512-40960): Response length
- **🔝 Top-K**: Token selection diversity
- **🔄 Frequency Penalty**: Reduce repetition
- **👁️ Presence Penalty**: Encourage new topics

---

## 🧪 Advanced Usage

### 📚 **RAG (Retrieval-Augmented Generation)**

ChunRAG uses advanced RAG techniques to make your documents searchable and conversational:

1. **📤 Document Upload**: Supports multiple formats
2. **✂️ Smart Chunking**: Optimal text segmentation  
3. **🧮 Embeddings**: Vector representations using Google's embedding API
4. **🔍 Similarity Search**: Finds most relevant document chunks
5. **🤖 Context Injection**: Feeds relevant content to AI models

### 🔑 **API Key Management**

- **Multiple Keys**: Add multiple API keys per provider for load balancing
- **Auto-Rotation**: Automatic failover when keys hit limits
- **Secure Storage**: Keys encrypted and stored locally
- **Health Monitoring**: Test connection status for all providers

### 🔧 **Development**

<details>
<summary><strong>🛠️ Development Setup</strong></summary>

```bash
# Development with auto-reload
npm run dev

# Electron development mode
npm run electron-dev

# Build for distribution
npm run build-win        # Windows installer
npm run build-win-portable  # Portable executable
```

**Environment Variables:**
```bash
NODE_ENV=development     # Enable dev mode
ELECTRON_IS_PACKAGED=0   # Development flag
```

</details>

---

## 📊 Performance & Scaling

### ⚡ **Optimizations**

- **🔄 Streaming Responses**: Real-time AI output
- **📦 Vector Caching**: Fast document retrieval
- **🎨 CSS Animations**: Smooth, hardware-accelerated UI
- **📱 Responsive Design**: Optimized for all devices
- **🗜️ Code Splitting**: Efficient resource loading

### 🔧 **Configuration**

Modify these settings in your setup:

```javascript
// Server configuration
const port = 3000;  // Change port
const maxFileSize = '10mb';  // Upload limit
const chunkSize = 1000;  // Document chunk size
const maxRetrieval = 3;  // RAG context chunks
```

---

## 🤝 Contributing

We love contributions! Here's how you can help make ChunRAG even better:

### 🚀 **Ways to Contribute**

<div align="center">

| Type | Examples | Difficulty |
|------|----------|------------|
| **🐛 Bug Reports** | UI issues, API errors, crashes | ⭐ Easy |
| **💡 Feature Ideas** | New providers, UI improvements | ⭐⭐ Medium |
| **🧪 Testing** | Cross-platform testing, edge cases | ⭐⭐ Medium |
| **💻 Code** | New features, optimizations, fixes | ⭐⭐⭐ Advanced |
| **📚 Documentation** | Guides, tutorials, API docs | ⭐⭐ Medium |

</div>

### 📋 **Contribution Guidelines**

<details>
<summary><strong>🤝 How to Contribute</strong></summary>

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **✨ Make your changes**
4. **✅ Test thoroughly**
5. **📝 Commit with clear messages**
   ```bash
   git commit -m "✨ Add amazing new feature"
   ```
6. **📤 Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **🎯 Open a Pull Request**

</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Feel free to use, modify, and distribute! 🎉
```

---

## 👨‍💻 Author

<div align="center">

**🚀 Created with ❤️ by [Chun](https://github.com/Chungus1310)**

*Making AI more accessible, one document at a time! 📚🤖*

---

### 🌟 **Star this repo if you find it useful!**


---

## 🔗 Links & Resources

<div align="center">

| Resource | Link |
|----------|------|
| 🏠 **Repository** | [GitHub](https://github.com/Chungus1310/ChunRAG) |
| 🐛 **Issues** | [Report Issues](https://github.com/Chungus1310/ChunRAG/issues) |
| 💡 **Discussions** | [GitHub Discussions](https://github.com/Chungus1310/ChunRAG/discussions) |
| 📖 **Wiki** | [Documentation](https://github.com/Chungus1310/ChunRAG/wiki) |

</div>

---

<div align="center">

**🚀 Ready to supercharge your document workflows? Let's get started!**

[![Get Started](https://img.shields.io/badge/Get%20Started-Right%20Now!-blue?style=for-the-badge&logo=rocket)](https://github.com/Chungus1310/ChunRAG#-quick-start)

---

*Made with 💖 and lots of ☕ by the ChunRAG team*

</div>
