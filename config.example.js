// Exemple de configuration
// Ce fichier n'est pas utilisé actuellement mais peut servir de référence

const CONFIG_EXAMPLE = {
    // URL de votre API Laravel
    apiUrl: 'http://localhost:8000',
    
    // Token API (à générer depuis le dashboard Laravel)
    apiToken: 'votre_token_ici',
    
    // Options de la fenêtre
    window: {
        width: 380,
        height: 600,
        alwaysOnTop: false
    },
    
    // Endpoints API
    endpoints: {
        test: '/api/chatbot/test',
        message: '/api/chatbot/message',
        conversations: '/api/chatbot/conversations'
    }
};

// Les paramètres sont actuellement stockés dans localStorage
// pour plus de sécurité et de flexibilité
