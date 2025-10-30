// Configuration et état
let config = {
    apiUrl: localStorage.getItem('apiUrl') || 'https://chatbot.ateliernormandduweb.fr'
};

let isMinimized = true;

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
    minimizeBtn: document.getElementById('minimizeBtn'),
    closeBtn: document.getElementById('closeBtn')
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    checkInitialConnection();
});

// Charger les paramètres sauvegardés
function loadSettings() {
    elements.apiUrlInput.value = config.apiUrl;
}

// Configuration des événements
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
        window.electronAPI.closeWindow();
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
}

// Toggle entre mode réduit et déployé
function toggleChat(minimize = false) {
    isMinimized = minimize;
    
    if (minimize) {
        // Réduire vers le bouton
        elements.chatContainer.classList.add('hidden');
        elements.floatingButton.style.display = 'flex';
    } else {
        // Déployer le chat
        elements.floatingButton.style.display = 'none';
        elements.chatContainer.classList.remove('hidden');
        elements.messageInput.focus();
    }
}

// Sauvegarder les paramètres
function saveSettings() {
    config.apiUrl = elements.apiUrlInput.value.trim();

    // Retirer le slash final si présent
    if (config.apiUrl.endsWith('/')) {
        config.apiUrl = config.apiUrl.slice(0, -1);
    }

    localStorage.setItem('apiUrl', config.apiUrl);

    showConnectionStatus('✅ Paramètres sauvegardés !', 'success');
    
    setTimeout(() => {
        elements.settingsPanel.classList.remove('active');
    }, 1500);
}

// Tester la connexion
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
            const data = await response.json();
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

// Vérifier la connexion au démarrage
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

// Afficher le statut de connexion
function showConnectionStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `connection-status ${type}`;
}

// Envoyer un message
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message) return;
    
    if (!config.apiUrl) {
        addMessage('Veuillez configurer l\'URL de l\'API dans les paramètres.', 'bot');
        elements.settingsPanel.classList.add('active');
        return;
    }

    // Afficher le message utilisateur
    addMessage(message, 'user');
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    
    // Désactiver l'envoi pendant le traitement
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
                question: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Afficher la réponse du bot
        const botResponse = data.response || data.answer || data.message;
        addMessage(botResponse, 'bot');
        
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

// Ajouter un message dans la conversation
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
    
    // Scroll vers le bas
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// Afficher/masquer l'indicateur de frappe
function showTypingIndicator(show) {
    if (show) {
        elements.typingIndicator.classList.add('active');
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    } else {
        elements.typingIndicator.classList.remove('active');
    }
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise non gérée:', event.reason);
});