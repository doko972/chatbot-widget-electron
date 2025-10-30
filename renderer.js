// Configuration et état
let config = {
    apiUrl: localStorage.getItem('apiUrl') || 'http://localhost:8000'
};

let isPinned = false;

// Éléments DOM
const elements = {
    settingsPanel: document.getElementById('settingsPanel'),
    settingsBtn: document.getElementById('settingsBtn'),
    apiUrlInput: document.getElementById('apiUrl'),
    saveSettingsBtn: document.getElementById('saveSettings'),
    testConnectionBtn: document.getElementById('testConnection'),
    connectionStatus: document.getElementById('connectionStatus'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    sendButton: document.getElementById('sendButton'),
    typingIndicator: document.getElementById('typingIndicator'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    pinBtn: document.getElementById('pinBtn'),
    statusIndicator: document.querySelector('.status-indicator')
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
    // Boutons de la barre de titre
    elements.minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    elements.closeBtn.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    elements.pinBtn.addEventListener('click', togglePin);

    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsPanel.classList.toggle('active');
    });

    // Paramètres
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

    // Auto-resize du textarea
    elements.messageInput.addEventListener('input', () => {
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
    });
}

// Épingler/Désépingler la fenêtre
function togglePin() {
    isPinned = !isPinned;
    window.electronAPI.toggleAlwaysOnTop(isPinned);
    elements.pinBtn.textContent = isPinned ? '📍' : '📌';
    elements.pinBtn.title = isPinned ? 'Désépingler' : 'Épingler';
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
    elements.testConnectionBtn.textContent = 'Test en cours...';

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
            updateStatusIndicator(true);
        } else {
            throw new Error('Erreur de connexion');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showConnectionStatus('❌ Échec de la connexion. Vérifiez l\'URL.', 'error');
        updateStatusIndicator(false);
    } finally {
        elements.testConnectionBtn.disabled = false;
        elements.testConnectionBtn.textContent = 'Tester la connexion';
    }
}

// Vérifier la connexion au démarrage
async function checkInitialConnection() {
    if (config.apiUrl) {
        await testConnection();
    } else {
        elements.settingsPanel.classList.add('active');
        updateStatusIndicator(false);
    }
}

// Afficher le statut de connexion
function showConnectionStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `connection-status ${type}`;
    
    setTimeout(() => {
        elements.connectionStatus.style.display = 'none';
    }, 5000);
}

// Mettre à jour l'indicateur de statut
function updateStatusIndicator(isConnected) {
    elements.statusIndicator.style.background = isConnected ? '#4ade80' : '#ef4444';
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
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Afficher la réponse du bot
        const botResponse = data.response || data.answer || data.message;
        addMessage(botResponse, 'bot');
        
    } catch (error) {
        console.error('Erreur:', error);
        addMessage('❌ ' + (error.message || 'Erreur de connexion. Vérifiez vos paramètres.'), 'bot');
        updateStatusIndicator(false);
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
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
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