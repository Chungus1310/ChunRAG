// Global variables
let modelConfigurations = {};
let currentProvider = '';
let currentModel = '';
let apiKeys = {};
let modelParameters = {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    topK: 50,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
};

// Chat state
let chatHistory = [];
let isChatSidebarCollapsed = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Configure marked for markdown rendering
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            sanitize: false,
            smartLists: true,
            smartypants: true
        });
    }
    
    // Set up theme switcher
    setupThemeSwitcher();
    
    // Set up navigation
    setupNavigation();
    
    // Set up file upload
    setupFileUpload();
    
    // Set up chat functionality
    setupChat();
    
    // Set up settings
    setupSettings();
    
    // Load initial data
    await loadModelConfigurations();
    await loadDocuments();
    await loadApiKeys();
    await loadModelParameters();
    
    // Set up auto-resize for textareas
    setupAutoResize();
    
    // Set up chat parameter syncing
    setupChatParameterSync();
    
    // Update chat status
    updateChatStatus();
}

// Enhanced Chat Functions
function setupChatParameterSync() {
    // Sync chat sidebar parameters with main settings
    const chatTempSlider = document.getElementById('chatTemperature');
    const chatTokensSlider = document.getElementById('chatMaxTokens');
    
    if (chatTempSlider) {
        chatTempSlider.addEventListener('input', function() {
            document.getElementById('chatTempValue').textContent = this.value;
        });
    }
    
    if (chatTokensSlider) {
        chatTokensSlider.addEventListener('input', function() {
            document.getElementById('chatTokensValue').textContent = this.value;
        });
    }
}

function updateChatStatus() {
    const statusElement = document.getElementById('chatStatus');
    if (!statusElement) return;
    
    const statusSpan = statusElement.querySelector('span:last-child');
    
    if (currentProvider && currentModel) {
        statusSpan.textContent = `${currentProvider} • ${currentModel}`;
        statusElement.querySelector('.status-dot').style.background = 'var(--success-color)';
    } else {
        statusSpan.textContent = 'Select provider and model';
        statusElement.querySelector('.status-dot').style.background = 'var(--warning-color)';
    }
}

function toggleChatSidebar() {
    const layout = document.querySelector('.chat-layout');
    if (!layout) return;

    isChatSidebarCollapsed = !isChatSidebarCollapsed;
    layout.classList.toggle('sidebar-collapsed', isChatSidebarCollapsed);
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="message bot-message welcome-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="welcome-content">
                        <h3>Welcome to <span class="gradient-text">ChunRAG</span>! 👋</h3>
                        <p>I'm your intelligent document assistant powered by advanced RAG technology.</p>
                        <div class="welcome-features">
                            <div class="feature-pill">💬 General AI Chat</div>
                            <div class="feature-pill">📄 Document Q&A</div>
                            <div class="feature-pill">🔍 Smart Context Search</div>
                        </div>
                        <p><strong>How can I assist you today?</strong></p>
                    </div>
                    <span class="message-timestamp">Just now</span>
                </div>
            </div>
        `;
        chatHistory = [];
        showToast('Chat cleared successfully', 'success');
    }
}

function resetSystemPrompt() {
    document.getElementById('systemPrompt').value = '';
    showToast('System prompt reset', 'info');
}

function saveSystemPrompt() {
    const prompt = document.getElementById('systemPrompt').value.trim();
    localStorage.setItem('chunrag-system-prompt', prompt);
    showToast('System prompt saved', 'success');
}

function exportChat() {
    const chatData = {
        timestamp: new Date().toISOString(),
        provider: currentProvider,
        model: currentModel,
        messages: chatHistory
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chunrag-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Chat exported successfully', 'success');
}

function toggleChatSettings() {
    showPage('settings');
    setupAutoResize();
}

// Theme Switcher
function setupThemeSwitcher() {
    // Check for saved theme
    const savedTheme = localStorage.getItem('chunrag-theme') || 'quantum';
    setTheme(savedTheme);
    
    // Set active theme option
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
        
        // Set the indicator position initially
        if (option.classList.contains('active')) {
            moveThemeIndicator(option);
        }

        // Add click event listeners
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            moveThemeIndicator(this);
            
            // Set the theme
            setTheme(theme);
        });
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chunrag-theme', theme);
}

function moveThemeIndicator(activeOption) {
    const indicator = document.querySelector('.theme-indicator');
    const switcher = document.querySelector('.theme-switcher');
    if (!indicator || !switcher) return;

    const switcherRect = switcher.getBoundingClientRect();
    const optionRect = activeOption.getBoundingClientRect();
    const offset = optionRect.left - switcherRect.left;
    indicator.style.transform = `translateX(${offset}px)`;
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
}

// Model configurations
async function loadModelConfigurations() {
    try {
        const response = await fetch('/api/models');
        modelConfigurations = await response.json();
        populateProviderDropdown();
    } catch (error) {
        console.error('Error loading model configurations:', error);
    }
}

function populateProviderDropdown() {
    const providerSelect = document.getElementById('providerSelect');
    providerSelect.innerHTML = '<option value="">Select Provider</option>';
    
    // Sort providers alphabetically for better UX
    const sortedProviders = Object.keys(modelConfigurations).sort();

    sortedProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
        providerSelect.appendChild(option);
    });
    
    providerSelect.addEventListener('change', function() {
        currentProvider = this.value;
        populateModelDropdown();
    });
}

function populateModelDropdown() {
    const modelSelect = document.getElementById('modelSelect');
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    
    if (currentProvider && modelConfigurations[currentProvider]) {
        // Sort models alphabetically by name for better UX
        const sortedModels = modelConfigurations[currentProvider].sort((a, b) => a.name.localeCompare(b.name));

        sortedModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            // Display name, and indicate if it's a free model
            option.textContent = model.name + (model.free ? ' (Free)' : '');
            modelSelect.appendChild(option);
        });
    }
    
    modelSelect.addEventListener('change', function() {
        currentModel = this.value;
    });
}

// File upload
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#764ba2';
        uploadArea.style.backgroundColor = '#f0f3ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = '#f8f9ff';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = '#f8f9ff';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    });
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
        }
    });
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('document', file);
    
    try {
        showToast('Uploading and processing document...', 'info');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Document uploaded successfully!', 'success');
            await loadDocuments();
        } else {
            showToast('Error uploading document: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error uploading document: ' + error.message, 'error');
    }
}

// Document management
async function loadDocuments() {
    try {
        const response = await fetch('/api/documents');
        const documents = await response.json();
        displayDocuments(documents);
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function displayDocuments(documents) {
    const documentsList = document.getElementById('documentsList');
    
    if (documents.length === 0) {
        documentsList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No documents uploaded yet.</p>';
        return;
    }
    
    documentsList.innerHTML = documents.map(doc => `
        <div class="document-item">
            <div class="document-info">
                <h4>${doc.name}</h4>
                <div class="document-meta">
                    <span>Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}</span>
                    <span>|</span>
                    Chunks: ${doc.chunks}
                </div>
            </div>
            <div class="document-actions">
                <button class="btn btn-small" onclick="deleteDocument('${doc.id}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/documents/${docId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Document deleted successfully!', 'success');
            await loadDocuments();
        } else {
            showToast('Error deleting document: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error deleting document: ' + error.message, 'error');
    }
}

// Chat functionality
function setupChat() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
}

function toggleSystemPrompt() {
    const section = document.getElementById('systemPromptSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    if (!currentProvider || !currentModel) {
        showToast('Please select a provider and model', 'error');
        return;
    }
    
    // Store the message before clearing input
    const messageText = message;
    
    // Clear input immediately for better UX
    messageInput.value = '';
    
    // Add user message to chat
    addMessageToChat(messageText, 'user');
    
    // Get system prompt
    const systemPrompt = document.getElementById('systemPrompt').value.trim();
    
    try {
        // Show loading in chat
        const loadingMessageId = addLoadingMessage();
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: messageText,
                provider: currentProvider,
                model: currentModel,
                systemPrompt: systemPrompt
            })
        });
        
        const result = await response.json();
        
        // Remove loading message
        removeLoadingMessage(loadingMessageId);
        
        if (result.success) {
            addMessageToChat(result.response, 'bot');
            if (result.contextUsed) {
                addContextIndicator();
            }
        } else {
            showToast('Error generating response: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error sending message: ' + error.message, 'error');
    }
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    
    // Get current time
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
    
    // Parse markdown for bot messages, keep plain text for user messages
    let processedMessage;
    if (sender === 'bot' && typeof marked !== 'undefined') {
        processedMessage = marked.parse(message);
    } else {
        // Escape HTML in user messages to prevent XSS, then convert newlines to <br>
        processedMessage = escapeHtml(message).replace(/\n/g, '<br>');
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            ${processedMessage}
            <span class="message-timestamp">${timeString}</span>
        </div>
    `;
    // Add to chat history for export
    chatHistory.push({ role: sender, content: message });
    chatMessages.appendChild(messageDiv);
    // Apply syntax highlighting and add copy buttons
    if (sender === 'bot') {
        messageDiv.querySelectorAll('pre').forEach((pre, index) => {
            const code = pre.querySelector('code');
            if (code) {
                // Highlight with Prism
                Prism.highlightElement(code);

                // Create a unique ID for the code block
                const codeId = `code-${Date.now()}-${index}`;
                pre.id = codeId;

                // Create header with language and copy button
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                const header = document.createElement('div');
                header.className = 'code-block-header';

                const language = code.className.replace(/language-/, '');
                header.innerHTML = `
                    <span>${language || 'code'}</span>
                    <button class="copy-button" onclick="copyCode('${codeId}', this)">Copy code</button>
                `;

                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(header);
                wrapper.appendChild(pre);
            }
        });
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to copy code from a block
function copyCode(elementId, button) {
    const codeElement = document.getElementById(elementId).querySelector('code');
    const codeToCopy = codeElement.innerText;
    
    navigator.clipboard.writeText(codeToCopy).then(() => {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = 'Copy code';
            button.classList.remove('copied');
        }, 2500);
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        button.textContent = 'Error';
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addLoadingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const messageId = 'loading-' + Date.now();
    messageDiv.id = messageId;
    messageDiv.className = 'message bot-message thinking-indicator';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>Thinking...</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}

function removeLoadingMessage(messageId) {
    const loadingMessage = document.getElementById(messageId);
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

function addContextIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'context-indicator';
    indicatorDiv.innerHTML = `
        <span class="context-icon">📄</span> Answer generated using RAG from your documents.
    `;
    
    chatMessages.appendChild(indicatorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Settings
function setupSettings() {
    // Set up all parameter sliders with enhanced functionality
    const parameterIds = ['temperature', 'topP', 'maxTokens', 'topK', 'frequencyPenalty', 'presencePenalty'];
    
    const updateSliderBackground = (slider) => {
        const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.background = `linear-gradient(to right, var(--primary-color) ${percentage}%, var(--border-color) ${percentage}%)`;
    };

    parameterIds.forEach(paramId => {
        const slider = document.getElementById(paramId);
        const valueSpan = document.getElementById(`${paramId}Value`);
        
        if (slider && valueSpan) {
            slider.addEventListener('input', function() {
                valueSpan.textContent = this.value;
                updateSliderBackground(this);
            });
            
            // Initialize background
            updateSliderBackground(slider);
        }
    });
    
    // Make updateSliderBackground available globally
    window.updateSliderBackground = updateSliderBackground;
}

async function saveModelParameters() {
    const getSliderValue = (id, isInt = false) => {
        const element = document.getElementById(id);
        if (!element) return undefined;
        return isInt ? parseInt(element.value) : parseFloat(element.value);
    };
    
    modelParameters = {
        temperature: getSliderValue('temperature'),
        topP: getSliderValue('topP'),
        maxTokens: getSliderValue('maxTokens', true),
        topK: getSliderValue('topK', true),
        frequencyPenalty: getSliderValue('frequencyPenalty'),
        presencePenalty: getSliderValue('presencePenalty')
    };

    // Remove undefined values
    Object.keys(modelParameters).forEach(key => {
        if (modelParameters[key] === undefined) {
            delete modelParameters[key];
        }
    });

    try {
        const response = await fetch('/api/parameters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(modelParameters)
        });
        
        const result = await response.json();
        if (result.success) {
            showToast('Model parameters saved successfully!', 'success');
        } else {
            showToast('Error saving parameters: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving parameters: ' + error.message, 'error');
    }
}

async function saveApiKeys() {
    const providers = ['gemini', 'openrouter', 'huggingface', 'mistral', 'cohere', 'nvidia', 'chutes', 'requesty'];
    const newApiKeys = {};
    
    providers.forEach(provider => {
        const textarea = document.getElementById(provider + 'Keys');
        if (textarea) {
            const keys = textarea.value.split('\n').filter(key => key.trim());
            if (keys.length > 0) {
                newApiKeys[provider] = keys;
            }
        }
    });
    
    try {
        const response = await fetch('/api/keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newApiKeys)
        });
        
        const result = await response.json();
        
        if (result.success) {
            apiKeys = newApiKeys;
            showToast('API keys saved successfully!', 'success');
        } else {
            showToast('Error saving API keys: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving API keys: ' + error.message, 'error');
    }
}

async function loadApiKeys() {
    try {
        const response = await fetch('/api/keys');
        const keyStatus = await response.json();
        populateProviderCards(keyStatus);
    } catch (error) {
        console.error('Error loading API keys:', error);
    }
}

function populateProviderCards(keyStatus) {
    const grid = document.getElementById('apiProvidersGrid');
    if (!grid) return;
    
    const providers = ['gemini', 'openrouter', 'huggingface', 'mistral', 'cohere', 'nvidia', 'chutes', 'requesty'];
    const logos = { 
        gemini: '✨', openrouter: '🔄', huggingface: '🤗', mistral: '🌬️', 
        cohere: '🔵', nvidia: '🟢', chutes: '🪂', requesty: '❓' 
    };
    
    const descriptions = {
        gemini: 'Google\'s advanced AI models',
        openrouter: 'Access to multiple AI providers',
        huggingface: 'Open-source AI models',
        mistral: 'European AI excellence',
        cohere: 'Enterprise-grade language models',
        nvidia: 'GPU-accelerated AI models',
        chutes: 'Fast AI inference',
        requesty: 'Custom API endpoint'
    };

    grid.innerHTML = ''; // Clear existing cards

    for (const provider of providers) {
        const count = keyStatus[provider] || 0;
        const isConnected = count > 0;
        
        const card = document.createElement('div');
        card.className = 'provider-card';
        card.dataset.provider = provider;

        card.innerHTML = `
            <div class="provider-header">
                <div class="provider-info">
                    <span class="provider-logo">${logos[provider] || '🔑'}</span>
                    <div>
                        <div class="provider-name">${provider.charAt(0).toUpperCase() + provider.slice(1)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-color-secondary);">${descriptions[provider]}</div>
                    </div>
                </div>
                <div class="provider-status">
                    <span class="status-badge ${isConnected ? 'connected' : 'disconnected'}">
                        ${isConnected ? '● Connected' : '○ Disconnected'}
                    </span>
                    <div class="key-count">${count} key${count !== 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="provider-keys">
                <textarea id="${provider}Keys" placeholder="Enter API keys (one per line)..." rows="3"></textarea>
            </div>
            <div class="provider-actions">
                <button class="btn btn-small btn-secondary" onclick="testProviderConnection('${provider}')">
                    🔍 Test
                </button>
                <button class="btn btn-small btn-primary" onclick="saveProviderApiKey('${provider}')">
                    💾 Save
                </button>
                <button class="btn btn-small btn-danger" onclick="clearProviderApiKey('${provider}')">
                    🗑️ Clear
                </button>
            </div>
        `;
        grid.appendChild(card);

        const textarea = card.querySelector('textarea');
        if (count > 0) {
            textarea.placeholder = `${count} key(s) currently saved. Edit to modify or add more keys.`;
        }
    }
}

// Enhanced API Management Functions
async function testProviderConnection(provider) {
    const textarea = document.getElementById(`${provider}Keys`);
    const keys = textarea.value.trim().split('\n').filter(key => key.trim());
    
    if (keys.length === 0) {
        showToast(`No API keys found for ${provider}`, 'error');
        return;
    }
    
    showToast(`Testing connection to ${provider}...`, 'info');
    
    try {
        const response = await fetch(`/api/keys/test/${provider}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: keys[0] }) // Test with first key
        });
        
        const result = await response.json();
        
        if (result.success && result.valid) {
            showToast(`✅ ${provider} connection successful!`, 'success');
        } else {
            showToast(`❌ ${provider} connection failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showToast(`❌ ${provider} connection test failed: ${error.message}`, 'error');
    }
}

async function clearProviderApiKey(provider) {
    if (!confirm(`Are you sure you want to clear all API keys for ${provider}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/keys/${provider}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById(`${provider}Keys`).value = '';
            showToast(`${provider} API keys cleared successfully`, 'success');
            await loadApiKeys(); // Refresh the UI
        } else {
            showToast(`Error clearing ${provider} API keys: ${result.error}`, 'error');
        }
    } catch (error) {
        showToast(`Error clearing ${provider} API keys: ${error.message}`, 'error');
    }
}

async function clearAllApiKeys() {
    if (!confirm('Are you sure you want to clear ALL API keys? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/keys', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear all textareas
            const providers = ['gemini', 'openrouter', 'huggingface', 'mistral', 'cohere', 'nvidia', 'chutes', 'requesty'];
            providers.forEach(provider => {
                const textarea = document.getElementById(`${provider}Keys`);
                if (textarea) textarea.value = '';
            });
            
            showToast('All API keys cleared successfully', 'success');
            await loadApiKeys(); // Refresh the UI
        } else {
            showToast(`Error clearing all API keys: ${result.error}`, 'error');
        }
    } catch (error) {
        showToast(`Error clearing all API keys: ${error.message}`, 'error');
    }
}

async function testAllConnections() {
    const providers = ['gemini', 'openrouter', 'huggingface', 'mistral', 'cohere', 'nvidia', 'chutes', 'requesty'];
    
    showToast('Testing all provider connections...', 'info');
    
    let tested = 0;
    for (const provider of providers) {
        const textarea = document.getElementById(`${provider}Keys`);
        if (textarea && textarea.value.trim()) {
            tested++;
            await testProviderConnection(provider);
            // Small delay between tests to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    if (tested === 0) {
        showToast('No API keys found to test', 'warning');
    } else {
        showToast(`Finished testing ${tested} providers`, 'info');
    }
}

// Enhanced Model Parameters Functions
function resetModelParameters() {
    if (!confirm('Reset all model parameters to default values?')) {
        return;
    }
    
    const defaults = {
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 2048,
        topK: 50,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
    };
    
    Object.keys(defaults).forEach(param => {
        const slider = document.getElementById(param);
        const valueSpan = document.getElementById(`${param}Value`);
        
        if (slider) {
            slider.value = defaults[param];
            if (valueSpan) valueSpan.textContent = defaults[param];
            updateSliderBackground(slider);
        }
    });
    
    showToast('Parameters reset to defaults', 'success');
}

function applyPreset(presetName) {
    const presets = {
        conservative: {
            temperature: 0.3,
            topP: 0.8,
            maxTokens: 1024,
            topK: 30,
            frequencyPenalty: 0.5,
            presencePenalty: 0.2
        },
        balanced: {
            temperature: 0.7,
            topP: 0.9,
            maxTokens: 2048,
            topK: 50,
            frequencyPenalty: 0.0,
            presencePenalty: 0.0
        },
        creative: {
            temperature: 0.9,
            topP: 0.95,
            maxTokens: 3072,
            topK: 70,
            frequencyPenalty: -0.2,
            presencePenalty: 0.1
        },
        experimental: {
            temperature: 1.0,
            topP: 1.0,
            maxTokens: 4096,
            topK: 100,
            frequencyPenalty: -0.5,
            presencePenalty: 0.5
        }
    };
    
    const preset = presets[presetName];
    if (!preset) return;
    
    Object.keys(preset).forEach(param => {
        const slider = document.getElementById(param);
        const valueSpan = document.getElementById(`${param}Value`);
        
        if (slider) {
            slider.value = preset[param];
            if (valueSpan) valueSpan.textContent = preset[param];
            updateSliderBackground(slider);
        }
    });
    
    // Update preset button states
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    showToast(`Applied ${presetName} preset`, 'success');
}

// System Settings Functions
function clearAllData() {
    if (!confirm('This will clear ALL data including API keys, chat history, and settings. Are you sure?')) {
        return;
    }
    
    if (!confirm('This action cannot be undone. Please confirm again.')) {
        return;
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear forms and reset UI
    document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
    
    showToast('All data cleared successfully', 'success');
    
    // Reload page after a short delay
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

function resetToDefaults() {
    if (!confirm('Reset ChunRAG to factory defaults? This will clear all settings.')) {
        return;
    }
    
    localStorage.clear();
    showToast('Reset to factory defaults', 'success');
    
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

async function loadModelParameters() {
    try {
        const response = await fetch('/api/parameters');
        const parameters = await response.json();
        
        // Update global parameters
        modelParameters = { ...modelParameters, ...parameters };
        
        // Update UI sliders and their visual state
        const temperatureSlider = document.getElementById('temperature');
        const topPSlider = document.getElementById('topP');
        const maxTokensSlider = document.getElementById('maxTokens');
        
        const updateSliderBackground = (slider) => {
            if (!slider) return;
            const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, var(--primary-color) ${percentage}%, var(--border-color) ${percentage}%)`;
        };

        if (temperatureSlider) {
            temperatureSlider.value = parameters.temperature;
            document.getElementById('temperatureValue').textContent = parameters.temperature;
            updateSliderBackground(temperatureSlider);
        }
        if (topPSlider) {
            topPSlider.value = parameters.topP;
            document.getElementById('topPValue').textContent = parameters.topP;
            updateSliderBackground(topPSlider);
        }
        if (maxTokensSlider) {
            maxTokensSlider.value = parameters.maxTokens;
            document.getElementById('maxTokensValue').textContent = parameters.maxTokens;
            updateSliderBackground(maxTokensSlider);
        }
    } catch (error) {
        console.error('Error loading model parameters:', error);
    }
}

async function saveProviderApiKey(provider) {
    const textarea = document.getElementById(`${provider}Keys`);
    if (!textarea) return;

    const keys = textarea.value.split('\n').filter(key => key.trim());
    const payload = {};
    
    // We only send the keys for the specific provider being updated.
    if (keys.length > 0) {
        payload[provider] = keys;
    }

    try {
        const response = await fetch('/api/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} keys saved!`, 'success');
            // Refresh the key counts
            await loadApiKeys();
        } else {
            showToast(`Error saving ${provider} keys: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error loading model parameters:', error);
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            removeToast(toast);
        }
    }, 5000);
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

function setupAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
}

// Settings Tabs
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}
// Legacy function stubs for compatibility
function showLoading(message) {
    showToast(message, 'info');
}

function hideLoading() {
    // Toast auto-hides
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

// Export functions for global access
window.showPage = showPage;
window.uploadFile = uploadFile;
window.deleteDocument = deleteDocument;
window.sendMessage = sendMessage;
window.toggleSystemPrompt = toggleSystemPrompt;
window.saveApiKeys = saveApiKeys;
window.saveProviderApiKey = saveProviderApiKey;
window.saveModelParameters = saveModelParameters;
window.removeToast = removeToast;
window.copyCode = copyCode;
window.openTab = openTab;
window.testProviderConnection = testProviderConnection;
window.clearProviderApiKey = clearProviderApiKey;
window.clearAllApiKeys = clearAllApiKeys;
window.resetModelParameters = resetModelParameters;
window.applyPreset = applyPreset;
window.testAllConnections = testAllConnections;
window.toggleChatSidebar = toggleChatSidebar;
window.clearChat = clearChat;
window.resetSystemPrompt = resetSystemPrompt;
window.saveSystemPrompt = saveSystemPrompt;
window.exportChat = exportChat;
window.toggleChatSettings = toggleChatSettings;
