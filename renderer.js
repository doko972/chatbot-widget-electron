let config = {
    apiUrl: localStorage.getItem('apiUrl') || 'https://chatbot.ateliernormandduweb.fr'
};

let isMinimized = true;
let isFullscreen = false;

// 🧠 Historique de conversation
let conversationHistory = [];

// Éléments DOM
const elements = {
    floatingButton: document.getElementById('floatingButton'),
    chatContainer: document.getElementById('chatContainer'),
    settingsPanel: document.getElementById('settingsPanel'),
    closeSettings: document.getElementById('closeSettings'),
    apiUrlInput: document.getElementById('apiUrl'),
    saveSettingsBtn: document.getElementById('saveSettings'),
    testConnectionBtn: document.getElementById('testConnection'),
    connectionStatus: document.getElementById('connectionStatus'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    sendButton: document.getElementById('sendButton'),
    typingIndicator: document.getElementById('typingIndicator'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    toggleFullscreenBtn: document.getElementById('toggleFullscreenBtn')  // 🔥 NOUVEAU
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    checkInitialConnection();
    setupFullscreenToggle();  // 🔥 NOUVEAU
});

// ============================================
// GESTION FULLSCREEN
// ============================================

function setupFullscreenToggle() {
    if (!elements.toggleFullscreenBtn) {
        console.warn('⚠️ Bouton toggleFullscreen non trouvé');
        return;
    }

    elements.toggleFullscreenBtn.addEventListener('click', toggleFullscreen);

    // Raccourci F11
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    console.log('✅ Toggle fullscreen configuré');
}

function toggleFullscreen() {
    isFullscreen = !isFullscreen;

    // 🔥 Utiliser window.electronAPI au lieu de require('electron')
    if (window.electronAPI && window.electronAPI.toggleFullscreen) {
        window.electronAPI.toggleFullscreen(isFullscreen);
        updateFullscreenButton();
        animateFullscreenTransition();

        console.log(isFullscreen ? '📺 Mode plein écran' : '🪟 Mode normal');
    } else {
        console.error('❌ electronAPI.toggleFullscreen non disponible');
    }
}

function updateFullscreenButton() {
    if (!elements.toggleFullscreenBtn) return;

    const icon = elements.toggleFullscreenBtn.querySelector('i');

    if (isFullscreen) {
        icon.className = 'fas fa-compress';
        elements.toggleFullscreenBtn.title = 'Mode fenêtre (F11)';
    } else {
        icon.className = 'fas fa-expand';
        elements.toggleFullscreenBtn.title = 'Plein écran (F11)';
    }
}

function animateFullscreenTransition() {
    const container = document.getElementById('chatContainer');
    if (!container) return;

    container.classList.add('transitioning');

    if (isFullscreen) {
        container.classList.add('fullscreen-mode');
    } else {
        container.classList.remove('fullscreen-mode');
    }

    setTimeout(() => {
        container.classList.remove('transitioning');
    }, 300);
}

// ============================================
// RESTE DU CODE (inchangé)
// ============================================

function loadSettings() {
    elements.apiUrlInput.value = config.apiUrl;
}

function setupEventListeners() {
    // Toggle bouton flottant / chat
    elements.floatingButton.addEventListener('click', () => {
        toggleChat(false);
    });

    // Boutons header
    elements.minimizeBtn.addEventListener('click', () => {
        toggleChat(true);
    });

    elements.closeBtn.addEventListener('click', () => {
        // 🔥 Utiliser window.electronAPI
        if (window.electronAPI && window.electronAPI.closeWindow) {
            window.electronAPI.closeWindow();
        } else {
            window.close();
        }
    });

    // Settings
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsPanel.classList.remove('active');
    });

    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.testConnectionBtn.addEventListener('click', testConnection);

    // Chat
    elements.sendButton.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    elements.messageInput.addEventListener('input', () => {
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
    });

    // Double-clic sur le bouton = paramètres
    elements.floatingButton.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        elements.settingsPanel.classList.add('active');
    });

    // Bouton nouvelle conversation
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (confirm('Voulez-vous vraiment démarrer une nouvelle conversation ?')) {
                try {
                    clearHistory();
                    elements.messagesContainer.innerHTML = '';
                    addMessage('💭 Nouvelle conversation démarrée. Comment puis-je vous aider ?', 'bot');
                    console.log('✅ Nouvelle conversation démarrée');
                } catch (error) {
                    console.error('❌ Erreur lors du reset:', error);
                    addMessage('⚠️ Erreur lors du reset. Veuillez recharger l\'application.', 'bot');
                }
            }
        });
    }
}

function toggleChat(minimize = false) {
    isMinimized = minimize;

    if (minimize) {
        elements.chatContainer.classList.add('hidden');
        elements.floatingButton.style.display = 'flex';
        elements.floatingButton.style.left = 'auto';
        elements.floatingButton.style.top = 'auto';
        elements.floatingButton.style.right = '20px';
        elements.floatingButton.style.bottom = '20px';
    } else {
        elements.floatingButton.style.display = 'none';
        elements.chatContainer.classList.remove('hidden');
        elements.messageInput.focus();
    }
}

function saveSettings() {
    config.apiUrl = elements.apiUrlInput.value.trim();

    if (config.apiUrl.endsWith('/')) {
        config.apiUrl = config.apiUrl.slice(0, -1);
    }

    localStorage.setItem('apiUrl', config.apiUrl);
    showConnectionStatus('✅ Paramètres sauvegardés !', 'success');

    setTimeout(() => {
        elements.settingsPanel.classList.remove('active');
    }, 1500);
}

async function testConnection() {
    if (!config.apiUrl) {
        showConnectionStatus('❌ Veuillez renseigner l\'URL', 'error');
        return;
    }

    elements.testConnectionBtn.disabled = true;
    elements.testConnectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Test...';

    try {
        const response = await fetch(`${config.apiUrl}/api/chatbot/test`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showConnectionStatus('✅ Connexion réussie !', 'success');
        } else {
            throw new Error('Erreur de connexion');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showConnectionStatus('❌ Échec de la connexion. Vérifiez l\'URL.', 'error');
    } finally {
        elements.testConnectionBtn.disabled = false;
        elements.testConnectionBtn.innerHTML = '<i class="fas fa-plug"></i> Tester';
    }
}

async function checkInitialConnection() {
    if (config.apiUrl) {
        try {
            const response = await fetch(`${config.apiUrl}/api/chatbot/test`);
            if (!response.ok) {
                elements.settingsPanel.classList.add('active');
            }
        } catch (error) {
            elements.settingsPanel.classList.add('active');
        }
    } else {
        elements.settingsPanel.classList.add('active');
    }
}

function showConnectionStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `connection-status ${type}`;
}

async function sendMessage() {
    const message = elements.messageInput.value.trim();

    if (!message) return;

    if (!config.apiUrl) {
        addMessage('Veuillez configurer l\'URL de l\'API dans les paramètres.', 'bot');
        elements.settingsPanel.classList.add('active');
        return;
    }

    addMessage(message, 'user');
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';

    conversationHistory.push({
        role: 'user',
        content: message
    });

    elements.sendButton.disabled = true;
    elements.messageInput.disabled = true;
    showTypingIndicator(true);

    try {
        const response = await fetch(`${config.apiUrl}/api/chatbot/message`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: message,
                conversation_history: conversationHistory
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.response || data.answer || data.message;
        addMessage(botResponse, 'bot');

        conversationHistory.push({
            role: 'assistant',
            content: botResponse
        });

        if (conversationHistory.length > 160) {
            conversationHistory = conversationHistory.slice(-160);
        }

    } catch (error) {
        console.error('Erreur:', error);
        addMessage('❌ ' + (error.message || 'Erreur de connexion. Vérifiez vos paramètres.'), 'bot');
    } finally {
        showTypingIndicator(false);
        elements.sendButton.disabled = false;
        elements.messageInput.disabled = false;
        elements.messageInput.focus();
    }
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    if (type === 'bot') {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        messageDiv.appendChild(avatarDiv);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (type === 'bot') {
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = 'Jarvis';
        contentDiv.appendChild(header);
    }

    const p = document.createElement('p');
    p.textContent = text;

    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    elements.messagesContainer.appendChild(messageDiv);

    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function showTypingIndicator(show) {
    if (show) {
        elements.typingIndicator.classList.add('active');
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    } else {
        elements.typingIndicator.classList.remove('active');
    }
}

function clearHistory() {
    conversationHistory = [];
    console.log('🗑️ Historique effacé');
}

function showHistory() {
    console.log('📜 Historique de conversation:', conversationHistory);
    console.log(`📊 Nombre total de messages: ${conversationHistory.length}`);
    console.log(`🔢 Nombre d'échanges: ${conversationHistory.length / 2}`);
    return conversationHistory;
}

// Exposer pour debug
window.jarvisDebug = {
    clearHistory: clearHistory,
    showHistory: showHistory,
    getHistoryLength: () => conversationHistory.length,
    getExchangeCount: () => Math.floor(conversationHistory.length / 2)
};

window.jarvisFullscreen = {
    toggle: toggleFullscreen,
    isFullscreen: () => isFullscreen,
    getSize: () => isFullscreen ? 'fullscreen' : 'normal'
};

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise non gérée:', event.reason);
});

console.log('🤖 Jarvis chargé avec mémoire conversationnelle et fullscreen !');
console.log('💾 Capacité: 80 échanges (160 messages)');
console.log('💡 Debug: window.jarvisDebug.showHistory()');
console.log('💡 Fullscreen: window.jarvisFullscreen.toggle()');